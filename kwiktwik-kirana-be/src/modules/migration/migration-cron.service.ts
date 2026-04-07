import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MigrationService } from './migration.service';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { gte, lt, and, eq, sql } from 'drizzle-orm';

/**
 * Daily migration statistics
 */
interface DailyMigrationStats {
  date: string;
  totalAttempts: number;
  successful: number;
  failed: number;
  pending: number;
  timeout: number;
  averageDuration: number;
  totalRecordsMigrated: number;
  averageRecordsPerMigration: number;
  mostCommonError?: string;
  topFailedTables: string[];
}

/**
 * Migration Cron Service
 * Scheduled tasks for migration maintenance
 */
@Injectable()
export class MigrationCronService {
  private readonly logger = new Logger(MigrationCronService.name);

  constructor(
    private readonly migrationService: MigrationService,
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Cleanup stale migrations every 5 minutes
   * This handles migrations that crashed, timed out, or lost their heartbeat
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleStaleMigrationCleanup() {
    this.logger.log('Running stale migration cleanup...');

    try {
      await this.migrationService.cleanupStaleMigrations();
      this.logger.log('Stale migration cleanup completed');
    } catch (error) {
      this.logger.error(
        'Failed to cleanup stale migrations:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Daily migration stats logging
   * Collects and logs migration statistics for the last 24 hours
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async logDailyMigrationStats() {
    this.logger.log('Collecting daily migration statistics...');

    try {
      const stats = await this.collectDailyStats();
      this.logStatsReport(stats);
    } catch (error) {
      this.logger.error(
        'Failed to collect daily migration stats:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Collect daily migration statistics from the database
   */
  private async collectDailyStats(): Promise<DailyMigrationStats> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Query migrations from the last 24 hours
    const migrations = await this.db
      .select({
        status: schema.migrationLogs.status,
        duration: schema.migrationLogs.duration,
        recordsCount: schema.migrationLogs.recordsCount,
        errorCode: schema.migrationLogs.errorCode,
        tablesFailed: schema.migrationLogs.tablesFailed,
      })
      .from(schema.migrationLogs)
      .where(
        and(
          gte(schema.migrationLogs.createdAt, yesterday),
          lt(schema.migrationLogs.createdAt, now),
        ),
      );

    // Calculate statistics
    const stats: DailyMigrationStats = {
      date: yesterday.toISOString().split('T')[0],
      totalAttempts: migrations.length,
      successful: 0,
      failed: 0,
      pending: 0,
      timeout: 0,
      averageDuration: 0,
      totalRecordsMigrated: 0,
      averageRecordsPerMigration: 0,
      topFailedTables: [],
    };

    let totalDuration = 0;
    let completedMigrations = 0;
    const errorCounts = new Map<string, number>();
    const tableFailCounts = new Map<string, number>();

    for (const migration of migrations) {
      // Count by status
      switch (migration.status) {
        case 'completed':
          stats.successful++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'pending':
          stats.pending++;
          break;
        case 'timeout':
          stats.timeout++;
          break;
      }

      // Sum durations for completed migrations
      if (migration.duration && migration.duration > 0) {
        totalDuration += migration.duration;
        completedMigrations++;
      }

      // Sum records migrated
      if (migration.recordsCount) {
        stats.totalRecordsMigrated += migration.recordsCount;
      }

      // Track error codes
      if (migration.errorCode) {
        errorCounts.set(
          migration.errorCode,
          (errorCounts.get(migration.errorCode) || 0) + 1,
        );
      }

      // Track failed tables
      if (migration.tablesFailed && Array.isArray(migration.tablesFailed)) {
        for (const table of migration.tablesFailed) {
          tableFailCounts.set(table, (tableFailCounts.get(table) || 0) + 1);
        }
      }
    }

    // Calculate averages
    stats.averageDuration =
      completedMigrations > 0
        ? Math.round(totalDuration / completedMigrations)
        : 0;
    stats.averageRecordsPerMigration =
      stats.successful > 0
        ? Math.round(stats.totalRecordsMigrated / stats.successful)
        : 0;

    // Find most common error
    let maxErrorCount = 0;
    for (const [errorCode, count] of errorCounts.entries()) {
      if (count > maxErrorCount) {
        maxErrorCount = count;
        stats.mostCommonError = errorCode;
      }
    }

    // Get top 5 failed tables
    const sortedTableFails = Array.from(tableFailCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([table]) => table);
    stats.topFailedTables = sortedTableFails;

    return stats;
  }

  /**
   * Log the statistics report
   */
  private logStatsReport(stats: DailyMigrationStats): void {
    const successRate =
      stats.totalAttempts > 0
        ? ((stats.successful / stats.totalAttempts) * 100).toFixed(1)
        : '0.0';

    this.logger.log(
      '╔════════════════════════════════════════════════════════════╗',
    );
    this.logger.log(
      `║  Daily Migration Report - ${stats.date}                   ║`,
    );
    this.logger.log(
      '╠════════════════════════════════════════════════════════════╣',
    );
    this.logger.log(
      `║  Total Attempts:        ${stats.totalAttempts.toString().padEnd(37)} ║`,
    );
    this.logger.log(
      `║  Successful:            ${stats.successful.toString().padEnd(37)} ║`,
    );
    this.logger.log(
      `║  Failed:                ${stats.failed.toString().padEnd(37)} ║`,
    );
    this.logger.log(
      `║  Pending:               ${stats.pending.toString().padEnd(37)} ║`,
    );
    this.logger.log(
      `║  Timeout:               ${stats.timeout.toString().padEnd(37)} ║`,
    );
    this.logger.log(
      `║  Success Rate:          ${(successRate + '%').padEnd(37)} ║`,
    );
    this.logger.log(
      '╠════════════════════════════════════════════════════════════╣',
    );
    this.logger.log(
      `║  Total Records:         ${stats.totalRecordsMigrated.toString().padEnd(37)} ║`,
    );
    this.logger.log(
      `║  Avg Records/Migration: ${stats.averageRecordsPerMigration.toString().padEnd(37)} ║`,
    );
    this.logger.log(
      `║  Avg Duration:          ${(stats.averageDuration + 'ms').padEnd(37)} ║`,
    );

    if (stats.mostCommonError) {
      this.logger.log(
        '╠════════════════════════════════════════════════════════════╣',
      );
      this.logger.log(
        `║  Most Common Error:     ${stats.mostCommonError.padEnd(37)} ║`,
      );
    }

    if (stats.topFailedTables.length > 0) {
      this.logger.log(
        '╠════════════════════════════════════════════════════════════╣',
      );
      this.logger.log(
        `║  Top Failed Tables:     ${stats.topFailedTables.join(', ').substring(0, 37).padEnd(37)} ║`,
      );
    }

    this.logger.log(
      '╚════════════════════════════════════════════════════════════╝',
    );
  }
}
