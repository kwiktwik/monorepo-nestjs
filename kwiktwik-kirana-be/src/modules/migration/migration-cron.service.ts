import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MigrationService } from './migration.service';

/**
 * Migration Cron Service
 * Scheduled tasks for migration maintenance
 */
@Injectable()
export class MigrationCronService {
  private readonly logger = new Logger(MigrationCronService.name);

  constructor(private readonly migrationService: MigrationService) {}

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
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  logDailyMigrationStats() {
    this.logger.log('Daily migration stats: TODO - implement stats collection');
    // TODO: Implement daily stats logging
  }
}
