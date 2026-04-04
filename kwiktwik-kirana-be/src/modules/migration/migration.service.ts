/**
 * Migration Service
 *
 * SAFETY NOTICE: This service handles migration FROM kirana-fe (old system) TO kwiktwik-kirana-be (new system)
 * - Data from kirana-fe is fetched via HTTP API calls (read-only, NEVER modified or deleted)
 * - Data is inserted into kwiktwik-kirana-be tables only
 * - When MIGRATION_SAFE_MODE=true (default), failed migrations will NOT roll back/delete any data
 * - Original data in kirana-fe is ALWAYS preserved and never at risk
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq, and, lt, not, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { JwtService } from '@nestjs/jwt';

import {
  MigrationState,
  MigrationErrorCode,
  MigratableUserData,
  MigrationResult,
  MigrationProgress,
  DeviceInfo,
  PartialDataCheckResult,
} from './interfaces/migration.interfaces';

import { HashCalculator } from './utils/hash-calculator.util';
import { IdMapper } from './utils/id-mapper.util';
import { MigrationStateMachine } from './utils/state-machine.util';
import { RetryUtil } from './utils/retry.util';
import {
  getMigrationOrder,
  getTableWeight,
  calculateProgress,
} from './utils/dependency-graph.util';

import { BetterAuthValidator } from './services/better-auth-validator.service';
import { ValidationErrorDetails } from './services/better-auth-validator.service';
import { KiranaFeDataService } from './services/kirana-fe-data.service';
import { TableMigrationService } from './services/table-migration.service';
import {
  normalizePhoneNumber,
  normalizePhoneNumberForLog,
} from './utils/phone-number.util';
import { FetchTiming } from './utils/fetch-with-timeout.util';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private readonly config: {
    timeout: number;
    maxRetries: number;
    heartbeatInterval: number;
    staleThreshold: number;
    lockTtl: number;
    safeMode: boolean;
  };

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly betterAuthValidator: BetterAuthValidator,
    private readonly kiranaFeDataService: KiranaFeDataService,
    private readonly tableMigrationService: TableMigrationService,
  ) {
    this.config = {
      timeout: this.configService.get('MIGRATION_TIMEOUT_MS', 180000), // 3 minutes (was 60s)
      maxRetries: this.configService.get('MIGRATION_MAX_RETRIES', 3),
      heartbeatInterval: this.configService.get(
        'MIGRATION_HEARTBEAT_INTERVAL_MS',
        30000,
      ),
      staleThreshold: this.configService.get(
        'MIGRATION_STALE_THRESHOLD_MS',
        400000, // 6.67 minutes (was 5min) - must be > timeout
      ),
      lockTtl: this.configService.get('MIGRATION_LOCK_TTL_MS', 200000), // 3.33 minutes (was 90s)
      safeMode: this.configService.get('MIGRATION_SAFE_MODE', true),
    };
  }

  /**
   * Main migration method
   */
  async migrateUser(
    betterAuthToken: string,
    deviceId: string,
    deviceInfo?: DeviceInfo,
  ): Promise<MigrationResult> {
    const migrationId = nanoid();
    const startTime = Date.now();
    const idMapper = new IdMapper();
    const stateMachine = new MigrationStateMachine(MigrationState.PENDING);

    // Variables to track migration state for rollback
    let userId = '';
    const migratedTables: string[] = [];
    const failedTables: string[] = [];
    const httpTimings: FetchTiming[] = []; // Track all HTTP call timings

    // Non-critical tables: if these fail, migration still completes
    const nonCriticalTables = [
      'deviceSessions',
      'pushTokens',
      'enhancedNotifications',
    ];

    try {
      // Step 1: Create migration log
      await this.createMigrationLog(
        migrationId,
        betterAuthToken,
        deviceId,
        deviceInfo,
      );

      // Step 2: Acquire lock (DB-based, no Redis)
      const lockAcquired = await this.acquireLock(migrationId);
      if (!lockAcquired) {
        throw new Error('Migration already in progress for this user');
      }

      // Start heartbeat
      const heartbeatInterval = setInterval(
        () => this.updateHeartbeat(migrationId),
        this.config.heartbeatInterval,
      );

      // Build a timeout promise that REJECTS, so Promise.race will abort
      // the migration flow when the timer fires. This is the only way to
      // actually cancel the in-flight async chain — a plain setTimeout that
      // only writes to the DB has no effect on the running promise chain.
      let timeoutHandle: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<never>((_resolve, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(
            Object.assign(
              new Error(
                `Migration timed out after ${this.config.timeout / 1000}s`,
              ),
              { code: MigrationErrorCode.TIMEOUT },
            ),
          );
        }, this.config.timeout);
      });

      try {
        // Step 3: Validate Better-Auth session
        stateMachine.transitionTo(MigrationState.VALIDATING_SESSION);
        await this.updateMigrationState(
          migrationId,
          MigrationState.VALIDATING_SESSION,
        );

        // Validate session with detailed error capture.
        // Wrap in Promise.race so the global timeout can abort a hanging
        // kirana-fe API call — a missing await would otherwise stall forever.
        const validationResult = await Promise.race([
          timeoutPromise,
          this.betterAuthValidator.validateSessionWithDetails(betterAuthToken),
        ]);

        if (!validationResult.success) {
          const failedResult = validationResult as {
            success: false;
            errorDetails: ValidationErrorDetails;
            errorMessage: string;
          };
          const errorDetails = failedResult.errorDetails;
          const extractedUserId = errorDetails.extractedUserId || '';

          // Build comprehensive error message with all debugging info
          const errorMessage = failedResult.errorMessage;

          this.logger.error(
            `Session validation failed for migration ${migrationId}: ${errorMessage}`,
          );

          // Write full structured details to errorStack for maximum debuggability
          const errorStack = JSON.stringify(
            {
              httpStatus: errorDetails.httpStatus,
              responseBody: errorDetails.responseBody,
              durationMs: errorDetails.durationMs,
              kiranaFeUrl: errorDetails.kiranaFeUrl,
              tokenType: errorDetails.tokenType,
              tokenLength: errorDetails.tokenLength,
              errorType: errorDetails.errorType,
              suggestion: errorDetails.suggestion,
            },
            null,
            2,
          );

          // Update migration log with detailed error info
          await this.updateMigrationStatus(migrationId, MigrationState.FAILED, {
            errorCode: MigrationErrorCode.SESSION_INVALID,
            errorMessage: errorMessage,
            errorStack,
          });

          // Also update the migration log with userId if we could extract it from JWT
          if (extractedUserId) {
            await this.db
              .update(schema.migrationLogs)
              .set({ userId: extractedUserId })
              .where(eq(schema.migrationLogs.id, migrationId));
          }

          // Return structured error response
          return {
            success: false,
            migrationId,
            userId: extractedUserId,
            error: {
              code: MigrationErrorCode.SESSION_INVALID,
              message: errorMessage,
            },
            migratedTables: [],
            recordsMigrated: 0,
            duration: Date.now() - startTime,
          };
        }

        // Store timing from successful validation
        if (validationResult.timing) {
          httpTimings.push(validationResult.timing);
        }

        const sessionData = validationResult.session;

        userId = sessionData.userId;
        const phoneNumber =
          normalizePhoneNumber(sessionData.phoneNumber) ||
          sessionData.phoneNumber;

        // OPTIMIZATION: Run in-progress check and old system status check in parallel
        // DB query + HTTP call can happen simultaneously
        const parallelCheckStart = Date.now();

        const [inProgressMigration, oldSystemStatus] = await Promise.all([
          // Check for in-progress migration for this specific user (DB query)
          this.db
            .select()
            .from(schema.migrationLogs)
            .where(
              and(
                eq(schema.migrationLogs.userId, userId),
                eq(schema.migrationLogs.status, MigrationState.PENDING),
                eq(schema.migrationLogs.isLocked, true),
              ),
            )
            .limit(1),

          // Check if user is already migrated in old system (HTTP call)
          this.kiranaFeDataService.checkMigrationStatusInOldSystem(userId),
        ]);

        this.logger.log(
          `Parallel checks completed in ${Date.now() - parallelCheckStart}ms ` +
            `(in-progress: ${inProgressMigration.length > 0 ? 'yes' : 'no'}, ` +
            `old-system-migrated: ${oldSystemStatus.isMigrated ? 'yes' : 'no'})`,
        );

        // Store timing from migration status check
        if (oldSystemStatus.timing) {
          httpTimings.push(oldSystemStatus.timing);
        }

        if (inProgressMigration.length > 0) {
          this.logger.warn(
            `Migration already in progress for user ${userId} (migrationId: ${inProgressMigration[0].id}). Cannot start new migration.`,
          );
          return {
            success: false,
            migrationId,
            userId,
            error: {
              code: MigrationErrorCode.MAX_RETRIES_EXCEEDED,
              message:
                'Migration already in progress for this user. Please wait for it to complete.',
            },
            migratedTables: [],
            recordsMigrated: 0,
            duration: 0,
          };
        }

        if (oldSystemStatus.isMigrated) {
          this.logger.log(
            `User ${userId} already marked as migrated in old system at ${oldSystemStatus.migratedAt}`,
          );
        }

        // Check if user is already migrated in new system
        const existingMigration = await this.db
          .select()
          .from(schema.migrationLogs)
          .where(
            and(
              eq(schema.migrationLogs.userId, userId),
              eq(schema.migrationLogs.status, MigrationState.COMPLETED),
            ),
          )
          .limit(1);

        if (existingMigration.length > 0) {
          // User already migrated - return existing JWT token
          this.logger.log(
            `User ${userId} already migrated (migrationId: ${existingMigration[0].id}). Returning existing token.`,
          );
          const token = this.jwtService.sign({
            sub: userId,
            appId: 'com.kiranaapps.app',
            authProvider: 'migration',
          });

          return {
            success: true,
            migrationId: existingMigration[0].id,
            userId,
            token,
            migratedTables: existingMigration[0].tablesMigrated || [],
            recordsMigrated: existingMigration[0].recordsCount || 0,
            duration: existingMigration[0].duration || 0,
          };
        }

        // Normalize phone number for consistency
        const normalizedPhoneNumber =
          normalizePhoneNumber(phoneNumber) || phoneNumber;

        // Step 4: Fetch source data
        stateMachine.transitionTo(MigrationState.FETCHING_SOURCE_DATA);
        await this.updateMigrationState(
          migrationId,
          MigrationState.FETCHING_SOURCE_DATA,
          { userId, phoneNumber: normalizedPhoneNumber },
        );

        const sourceData = await this.fetchAllUserData(
          userId,
          normalizedPhoneNumber,
        );

        // Step 5: Check for partial data
        stateMachine.transitionTo(MigrationState.CHECKING_PARTIAL_DATA);
        await this.updateMigrationState(
          migrationId,
          MigrationState.CHECKING_PARTIAL_DATA,
        );

        const partialCheck = await this.checkPartialData(userId);
        if (partialCheck.hasPartialData) {
          stateMachine.forceTransition(MigrationState.PARTIAL_DATA_DETECTED);
          await this.updateMigrationStatus(
            migrationId,
            MigrationState.PARTIAL_DATA_DETECTED,
            {
              errorCode: MigrationErrorCode.PARTIAL_DATA_DETECTED,
              errorMessage: `Existing data found in tables: ${partialCheck.tablesWithData.join(', ')}`,
              tablesFailed: partialCheck.tablesWithData,
            },
          );

          throw new BadRequestException({
            code: MigrationErrorCode.PARTIAL_DATA_DETECTED,
            message: `Migration cannot proceed. Existing data found in tables: ${partialCheck.tablesWithData.join(', ')}. Please contact support team with error code: ERR_PARTIAL_001`,
            details: {
              tablesWithData: partialCheck.tablesWithData,
            },
          });
        }

        // Step 6: Calculate source hash
        stateMachine.transitionTo(MigrationState.CALCULATING_HASH);
        await this.updateMigrationState(
          migrationId,
          MigrationState.CALCULATING_HASH,
        );

        const sourceHash = HashCalculator.calculateDataHash(sourceData);
        await this.updateSourceHash(migrationId, sourceHash);

        // Step 7: Migrate data in transaction
        const migratedTables: string[] = [];
        let totalRecords = 0;

        const tables = getMigrationOrder();

        for (const tableName of tables) {
          // Update state
          const tableState = this.getTableMigrationState(tableName);
          stateMachine.transitionTo(tableState);
          await this.updateMigrationState(migrationId, tableState, {
            currentTable: tableName,
          });

          // Emit progress
          this.emitProgress(migrationId, userId, {
            migrationId,
            userId,
            state: tableState,
            progress: calculateProgress(migratedTables, tableName, 0),
            currentTable: tableName,
            recordsProcessed: totalRecords,
            totalRecords: this.countTotalRecords(sourceData),
            estimatedTimeRemaining: 0,
            message: `Migrating ${tableName}...`,
            timestamp: new Date(),
          });

          // Get source records for this table
          const propertyName = this.getTablePropertyName(tableName);
          let sourceRecords: any[];

          // User is a single object, others are arrays
          if (tableName === 'user') {
            sourceRecords = sourceData.user ? [sourceData.user] : [];
          } else {
            sourceRecords = sourceData[propertyName] as any[];
          }
          const sourceCount = sourceRecords?.length || 0;

          // Migrate table
          const records = await this.migrateTable(
            tableName,
            sourceRecords,
            idMapper,
            userId,
          );

          // Track success/failure
          if (records.length > 0) {
            migratedTables.push(tableName);
            totalRecords += records.length;
            this.logger.log(
              `Successfully migrated ${records.length}/${sourceCount} records to ${tableName}`,
            );
          } else if (sourceCount > 0) {
            // Had source data but failed to migrate any
            failedTables.push(tableName);
            if (nonCriticalTables.includes(tableName)) {
              this.logger.warn(
                `Non-critical table ${tableName} failed to migrate ${sourceCount} records - migration will continue`,
              );
            } else {
              this.logger.error(
                `FAILED to migrate ${sourceCount} records from ${tableName} - all records failed`,
              );
            }
          } else {
            this.logger.log(`No source data for ${tableName} - skipping`);
          }
        }

        // Step 8: Calculate destination hash
        stateMachine.transitionTo(MigrationState.VERIFYING_HASH);
        await this.updateMigrationState(
          migrationId,
          MigrationState.VERIFYING_HASH,
        );

        const destData = await this.fetchAllUserData(userId, phoneNumber);
        const destHash = HashCalculator.calculateDataHash(destData);

        // VALIDATION: Check if any data was actually migrated
        const destRecordCount = this.countTotalRecords(destData);
        if (destRecordCount === 0 && totalRecords > 0) {
          stateMachine.forceTransition(MigrationState.FAILED);
          await this.updateMigrationStatus(migrationId, MigrationState.FAILED, {
            errorCode: MigrationErrorCode.DATA_INTEGRITY_ERROR,
            errorMessage: `Migration reported ${totalRecords} records but destination database is empty.`,
            tablesMigrated: migratedTables,
          });

          throw new InternalServerErrorException({
            code: MigrationErrorCode.DATA_INTEGRITY_ERROR,
            message:
              'Data integrity check failed. No records found in destination database.',
          });
        }

        // Check if any CRITICAL tables failed (non-critical tables can fail gracefully)
        const criticalFailedTables = failedTables.filter(
          (t) => !nonCriticalTables.includes(t),
        );
        if (criticalFailedTables.length > 0) {
          stateMachine.forceTransition(MigrationState.FAILED);
          await this.updateMigrationStatus(migrationId, MigrationState.FAILED, {
            errorCode: MigrationErrorCode.DATA_INTEGRITY_ERROR,
            errorMessage: `Critical tables failed to migrate: ${criticalFailedTables.join(', ')}`,
            tablesMigrated: migratedTables,
            tablesFailed: failedTables,
          });

          throw new InternalServerErrorException({
            code: MigrationErrorCode.DATA_INTEGRITY_ERROR,
            message: `Migration failed: Critical tables could not be migrated: ${criticalFailedTables.join(', ')}`,
          });
        }

        // If only non-critical tables failed, add them to migratedTables and log warning
        const nonCriticalFailedTables = failedTables.filter((t) =>
          nonCriticalTables.includes(t),
        );
        if (nonCriticalFailedTables.length > 0) {
          this.logger.warn(
            `Non-critical tables failed but migration will continue: ${nonCriticalFailedTables.join(', ')}`,
          );
          // Add non-critical failed tables to migratedTables so they're counted as "complete"
          for (const tableName of nonCriticalFailedTables) {
            if (!migratedTables.includes(tableName)) {
              migratedTables.push(tableName);
            }
          }
        }

        // Verify hashes match (only if all tables migrated successfully)
        if (!HashCalculator.compareHashes(sourceHash, destHash)) {
          stateMachine.forceTransition(MigrationState.FAILED);
          await this.updateMigrationStatus(migrationId, MigrationState.FAILED, {
            errorCode: MigrationErrorCode.HASH_MISMATCH,
            errorMessage:
              'Data verification failed. Source and destination hashes do not match.',
            destinationHash: destHash,
            tablesMigrated: migratedTables,
          });

          throw new InternalServerErrorException({
            code: MigrationErrorCode.HASH_MISMATCH,
            message: 'Data verification failed. Migration rolled back.',
          });
        }

        // Step 9: Issue JWT
        const token = this.jwtService.sign({
          sub: userId,
          appId: 'com.kiranaapps.app',
          authProvider: 'migration',
        });

        // Success! (Possibly with some non-critical tables failed)
        if (failedTables.length > 0) {
          const criticalFailed = failedTables.filter(
            (t) => !nonCriticalTables.includes(t),
          );
          const nonCriticalFailed = failedTables.filter((t) =>
            nonCriticalTables.includes(t),
          );
          if (nonCriticalFailed.length > 0) {
            this.logger.warn(
              `Migration completed with non-critical table failures: ${nonCriticalFailed.join(', ')}`,
            );
          }
          if (criticalFailed.length > 0) {
            this.logger.error(
              `Migration has critical table failures: ${criticalFailed.join(', ')}`,
            );
          }
        }

        stateMachine.transitionTo(MigrationState.COMPLETED);
        await this.updateMigrationStatus(
          migrationId,
          MigrationState.COMPLETED,
          {
            destinationHash: destHash,
            tablesMigrated: migratedTables,
            tablesFailed: failedTables,
            recordsCount: totalRecords,
          },
        );

        // Mark user as migrated in old system
        await this.kiranaFeDataService.markUserAsMigratedInOldSystem(
          userId,
          userId,
        );

        clearTimeout(timeoutHandle!);
        clearInterval(heartbeatInterval);

        const duration = Date.now() - startTime;

        return {
          success: true,
          migrationId,
          userId,
          token,
          migratedTables,
          recordsMigrated: totalRecords,
          duration,
        };
      } catch (error) {
        clearTimeout(timeoutHandle!);
        clearInterval(heartbeatInterval);

        // Rollback: Delete all inserted data for atomicity
        await this.rollbackMigration(userId, migratedTables);

        // Release lock on error
        await this.releaseLock(migrationId);

        throw error;
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log failure
      await this.logMigrationFailure(
        migrationId,
        error,
        stateMachine.getCurrentState(),
      );

      return {
        success: false,
        migrationId,
        userId: '',
        error: {
          code: this.getErrorCode(error),
          message: this.getErrorMessage(error),
        },
        migratedTables: [],
        recordsMigrated: 0,
        duration,
      };
    }
  }

  /**
   * Create initial migration log
   */
  private async createMigrationLog(
    migrationId: string,
    sessionToken: string,
    deviceId: string,
    deviceInfo?: DeviceInfo,
  ): Promise<void> {
    await this.db.insert(schema.migrationLogs).values({
      id: migrationId,
      userId: '',
      phoneNumber: '',
      status: MigrationState.PENDING,
      currentState: MigrationState.PENDING,
      sessionToken: sessionToken.substring(0, 20), // Truncated for security
      deviceId,
      deviceInfo: deviceInfo || null,
      isLocked: false,
      retryCount: 0,
      tablesMigrated: [],
      tablesFailed: [],
      recordsCount: 0,
    });
  }

  /**
   * Acquire DB-based lock
   */
  private async acquireLock(migrationId: string): Promise<boolean> {
    // Check if any migration is locked for this user
    // Implementation depends on how you identify the user at this point
    // For now, lock by migration ID
    await this.db
      .update(schema.migrationLogs)
      .set({
        isLocked: true,
        lockedAt: new Date(),
        lastHeartbeat: new Date(),
      })
      .where(eq(schema.migrationLogs.id, migrationId));

    return true;
  }

  /**
   * Release DB-based lock
   */
  private async releaseLock(migrationId: string): Promise<void> {
    await this.db
      .update(schema.migrationLogs)
      .set({ isLocked: false })
      .where(eq(schema.migrationLogs.id, migrationId));
  }

  /**
   * Update heartbeat
   */
  private async updateHeartbeat(migrationId: string): Promise<void> {
    await this.db
      .update(schema.migrationLogs)
      .set({ lastHeartbeat: new Date() })
      .where(eq(schema.migrationLogs.id, migrationId));
  }

  /**
   * Handle timeout
   */
  private async handleTimeout(migrationId: string): Promise<void> {
    await this.updateMigrationStatus(migrationId, MigrationState.TIMEOUT, {
      errorCode: MigrationErrorCode.TIMEOUT,
      errorMessage: `Migration timed out after ${this.config.timeout / 1000}s`,
    });
  }

  /**
   * Update migration state
   */
  private async updateMigrationState(
    migrationId: string,
    state: MigrationState,
    updates?: { userId?: string; phoneNumber?: string; currentTable?: string },
  ): Promise<void> {
    const updateData: any = { currentState: state };

    if (updates?.userId) {
      updateData.userId = updates.userId;
    }
    if (updates?.phoneNumber) {
      updateData.phoneNumber = updates.phoneNumber;
    }

    await this.db
      .update(schema.migrationLogs)
      .set(updateData)
      .where(eq(schema.migrationLogs.id, migrationId));
  }

  /**
   * Update source hash
   */
  private async updateSourceHash(
    migrationId: string,
    hash: string,
  ): Promise<void> {
    await this.db
      .update(schema.migrationLogs)
      .set({ sourceHash: hash })
      .where(eq(schema.migrationLogs.id, migrationId));
  }

  /**
   * Update migration status (final states)
   */
  private async updateMigrationStatus(
    migrationId: string,
    status: MigrationState,
    updates: {
      errorCode?: string;
      errorMessage?: string;
      errorStack?: string;
      destinationHash?: string;
      tablesMigrated?: string[];
      tablesFailed?: string[];
      recordsCount?: number;
    },
  ): Promise<void> {
    // Fetch the migration log to calculate actual duration
    const migration = await this.db
      .select({ startedAt: schema.migrationLogs.startedAt })
      .from(schema.migrationLogs)
      .where(eq(schema.migrationLogs.id, migrationId))
      .limit(1);

    const startedAt = migration[0]?.startedAt;
    const duration = startedAt ? Date.now() - startedAt.getTime() : 0;

    const updateData: any = {
      status,
      completedAt: new Date(),
      duration,
    };

    if (updates.errorCode) updateData.errorCode = updates.errorCode;
    if (updates.errorMessage) updateData.errorMessage = updates.errorMessage;
    if (updates.errorStack) updateData.errorStack = updates.errorStack;
    if (updates.destinationHash)
      updateData.destinationHash = updates.destinationHash;
    if (updates.tablesMigrated)
      updateData.tablesMigrated = updates.tablesMigrated;
    if (updates.tablesFailed) updateData.tablesFailed = updates.tablesFailed;
    if (updates.recordsCount) updateData.recordsCount = updates.recordsCount;

    await this.db
      .update(schema.migrationLogs)
      .set(updateData)
      .where(eq(schema.migrationLogs.id, migrationId));
  }

  /**
   * Fetch all user data from kirana-fe via HTTP API
   */
  private async fetchAllUserData(
    userId: string,
    phoneNumber: string,
  ): Promise<MigratableUserData & { timing: FetchTiming }> {
    return this.kiranaFeDataService.fetchAllUserData(userId, phoneNumber);
  }

  /**
   * Check for partial data and clean it up if found
   * This handles cases where previous migration attempts failed mid-way
   *
   * OPTIMIZED: All table checks run in parallel for faster execution
   */
  private async checkPartialData(
    userId: string,
  ): Promise<PartialDataCheckResult> {
    const tables = getMigrationOrder();

    // OPTIMIZATION: Check all tables in parallel instead of sequentially
    // Reduces time from ~130ms (13 tables × 10ms) to ~15ms
    const checkStartTime = Date.now();
    const tableChecks = await Promise.all(
      tables.map(async (tableName) => {
        const hasData = await this.checkTableHasData(tableName, userId);
        return { tableName, hasData };
      }),
    );

    const tablesWithData = tableChecks
      .filter((check) => check.hasData)
      .map((check) => check.tableName);

    this.logger.log(
      `Partial data check completed in ${Date.now() - checkStartTime}ms. ` +
        `Tables with data: ${tablesWithData.length}`,
    );

    // If partial data found, clean it up (it's from a failed previous attempt)
    if (tablesWithData.length > 0) {
      this.logger.warn(
        `Found partial data from previous failed migration for user ${userId}. ` +
          `Cleaning up tables: ${tablesWithData.join(', ')}`,
      );
      await this.rollbackMigration(userId, tablesWithData);
    }

    return {
      hasPartialData: false, // After cleanup, no partial data remains
      tablesWithData: [],
    };
  }

  /**
   * Check if table has data for user
   */
  private async checkTableHasData(
    tableName: string,
    userId: string,
  ): Promise<boolean> {
    const tableMap: Record<string, any> = {
      user: schema.user,
      user_metadata: schema.userMetadata,
      accounts: schema.account,
      pushTokens: schema.pushTokens,
      deviceSessions: schema.deviceSessions,
      userImages: schema.userImages,
      playStoreRatings: schema.playStoreRatings,
      subscriptions: schema.subscriptions,
      orders: schema.orders,
      abandonedCheckouts: schema.abandonedCheckouts,
      // Note: webhookLogs are not migrated - old subscription_logs are not compatible with new schema
      phonepeOrders: schema.phonepeOrders,
      phonepeSubscriptions: schema.phonepeSubscriptions,
      enhancedNotifications: schema.enhancedNotifications,
    };

    const table = tableMap[tableName];
    if (!table) {
      this.logger.warn(`Unknown table for partial data check: ${tableName}`);
      return false;
    }

    try {
      // User table uses 'id' column, others use 'userId'
      const column = tableName === 'user' ? table.id : table.userId;
      const result = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(table)
        .where(eq(column, userId));

      return (result[0]?.count ?? 0) > 0;
    } catch (error) {
      this.logger.error(
        `Error checking ${tableName} for user ${userId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Migrate a single table using TableMigrationService
   */
  private async migrateTable(
    tableName: string,
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    console.log(
      `[MIGRATION_DEBUG] migrateTable called: tableName=${tableName}, userId=${userId}, recordsCount=${records?.length || 0}`,
    );
    if (!records || records.length === 0) {
      return [];
    }

    // Route to appropriate migration method
    const methodMap: Record<string, keyof TableMigrationService> = {
      user: 'migrateUser',
      user_metadata: 'migrateMetadata',
      accounts: 'migrateAccounts',
      pushTokens: 'migratePushTokens',
      deviceSessions: 'migrateDeviceSessions',
      userImages: 'migrateUserImages',
      playStoreRatings: 'migratePlayStoreRatings',
      subscriptions: 'migrateSubscriptions',
      orders: 'migrateOrders',
      abandonedCheckouts: 'migrateAbandonedCheckouts',
      // Note: webhookLogs are not migrated - old subscription_logs are not compatible with new schema
      phonepeOrders: 'migratePhonepeOrders',
      phonepeSubscriptions: 'migratePhonepeSubscriptions',
      enhancedNotifications: 'migrateEnhancedNotifications',
    };

    const methodName = methodMap[tableName];
    if (!methodName) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    const method = this.tableMigrationService[methodName] as (
      records: any[],
      idMapper: IdMapper,
      userId: string,
    ) => Promise<any[]>;

    return await method.call(
      this.tableMigrationService,
      records,
      idMapper,
      userId,
    );
  }

  /**
   * Count total records
   */
  private countTotalRecords(data: MigratableUserData): number {
    return (
      (data.user ? 1 : 0) +
      data.metadata.length +
      data.accounts.length +
      data.pushTokens.length +
      data.deviceSessions.length +
      data.userImages.length +
      data.playStoreRatings.length +
      data.subscriptions.length +
      data.orders.length +
      data.abandonedCheckouts.length +
      // Note: webhookLogs are not migrated
      data.phonepeOrders.length +
      data.phonepeSubscriptions.length +
      data.enhancedNotifications.length
    );
  }

  /**
   * Get table property name from table name
   */
  private getTablePropertyName(tableName: string): keyof MigratableUserData {
    const mapping: Record<string, keyof MigratableUserData> = {
      user: 'user',
      user_metadata: 'metadata',
      accounts: 'accounts',
      pushTokens: 'pushTokens',
      deviceSessions: 'deviceSessions',
      userImages: 'userImages',
      playStoreRatings: 'playStoreRatings',
      subscriptions: 'subscriptions',
      orders: 'orders',
      abandonedCheckouts: 'abandonedCheckouts',
      // Note: webhookLogs are not migrated
      phonepeOrders: 'phonepeOrders',
      phonepeSubscriptions: 'phonepeSubscriptions',
      enhancedNotifications: 'enhancedNotifications',
    };

    return mapping[tableName] || 'metadata';
  }

  /**
   * Get migration state for table
   */
  private getTableMigrationState(tableName: string): MigrationState {
    const mapping: Record<string, MigrationState> = {
      user: MigrationState.MIGRATING_USER,
      user_metadata: MigrationState.MIGRATING_METADATA,
      accounts: MigrationState.MIGRATING_ACCOUNTS,
      pushTokens: MigrationState.MIGRATING_PUSH_TOKENS,
      deviceSessions: MigrationState.MIGRATING_DEVICE_SESSIONS,
      userImages: MigrationState.MIGRATING_USER_IMAGES,
      playStoreRatings: MigrationState.MIGRATING_PLAYSTORE_RATINGS,
      subscriptions: MigrationState.MIGRATING_SUBSCRIPTIONS,
      orders: MigrationState.MIGRATING_ORDERS,
      abandonedCheckouts: MigrationState.MIGRATING_ABANDONED_CHECKOUTS,
      // Note: webhookLogs are not migrated
      phonepeOrders: MigrationState.MIGRATING_PHONEPE_ORDERS,
      phonepeSubscriptions: MigrationState.MIGRATING_PHONEPE_SUBSCRIPTIONS,
      enhancedNotifications: MigrationState.MIGRATING_ENHANCED_NOTIFICATIONS,
    };

    return mapping[tableName] || MigrationState.MIGRATING_METADATA;
  }

  /**
   * Emit progress update
   */
  private emitProgress(
    migrationId: string,
    userId: string,
    progress: MigrationProgress,
  ): void {
    // TODO: Implement SSE or WebSocket emission
    this.logger.log(
      `[Migration ${migrationId}] Progress: ${progress.progress}%, State: ${progress.state}`,
    );
  }

  /**
   * Log migration failure
   */
  private async logMigrationFailure(
    migrationId: string,
    error: any,
    finalState: MigrationState,
  ): Promise<void> {
    this.logger.error(
      `Migration ${migrationId} failed in state ${finalState}`,
      error instanceof Error ? error.message : 'Unknown error',
    );

    await this.updateMigrationStatus(migrationId, finalState, {
      errorCode: this.getErrorCode(error),
      errorMessage: this.getErrorMessage(error),
    });
  }

  /**
   * Get error code from error
   */
  private getErrorCode(error: any): MigrationErrorCode {
    if (error.code && Object.values(MigrationErrorCode).includes(error.code)) {
      return error.code as MigrationErrorCode;
    }
    return MigrationErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Get error message from error
   */
  private getErrorMessage(error: any): string {
    if (error.message) {
      return error.message;
    }
    if (error.response?.message) {
      return error.response.message;
    }
    return 'Unknown error occurred during migration';
  }

  /**
   * Get migration status by ID
   */
  async getMigrationStatus(migrationId: string): Promise<any> {
    const [migration] = await this.db
      .select()
      .from(schema.migrationLogs)
      .where(eq(schema.migrationLogs.id, migrationId));

    if (!migration) {
      return null;
    }

    return {
      migrationId: migration.id,
      userId: migration.userId,
      phoneNumber: migration.phoneNumber,
      status: migration.status,
      currentState: migration.currentState,
      startedAt: migration.startedAt,
      completedAt: migration.completedAt,
      duration: migration.duration,
      tablesMigrated: migration.tablesMigrated,
      tablesFailed: migration.tablesFailed,
      recordsCount: migration.recordsCount,
      errorCode: migration.errorCode,
      errorMessage: migration.errorMessage,
      isLocked: migration.isLocked,
      lockedAt: migration.lockedAt,
      lastHeartbeat: migration.lastHeartbeat,
      sourceHash: migration.sourceHash,
      destinationHash: migration.destinationHash,
      deviceId: migration.deviceId,
      deviceInfo: migration.deviceInfo,
      retryCount: migration.retryCount,
    };
  }

  /**
   * Rollback migration by deleting all inserted data
   * Ensures atomicity - all or nothing
   *
   * SAFETY: This ONLY deletes data from kwiktwik-kirana-be (new system)
   * It NEVER deletes data from kirana-fe (old system) - that data is read-only
   * When MIGRATION_SAFE_MODE is enabled, rollback is skipped entirely
   */
  private async rollbackMigration(
    userId: string,
    migratedTables: string[],
  ): Promise<void> {
    if (!userId || migratedTables.length === 0) {
      return;
    }

    // SAFETY CHECK: If safe mode is enabled, skip rollback to preserve all data
    if (this.config.safeMode) {
      this.logger.warn(
        `[SAFE MODE] Migration failed for user ${userId}, but rollback is DISABLED. ` +
          `Data in migrated tables will NOT be deleted. ` +
          `Tables that would have been rolled back: ${migratedTables.join(', ')}. ` +
          `Note: Original data in kirana-fe (old system) is NEVER affected.`,
      );
      return;
    }

    this.logger.warn(
      `Rolling back migration for user ${userId}, tables: ${migratedTables.join(', ')}`,
    );

    try {
      // Delete in reverse order to respect foreign key constraints
      const reverseTables = [...migratedTables].reverse();

      for (const tableName of reverseTables) {
        try {
          await this.deleteTableData(tableName, userId);
          this.logger.log(`Rolled back table: ${tableName}`);
        } catch (deleteError) {
          this.logger.error(
            `Failed to rollback table ${tableName}:`,
            deleteError instanceof Error
              ? deleteError.message
              : 'Unknown error',
          );
          // Continue trying to delete other tables even if one fails
        }
      }

      this.logger.log(`Rollback completed for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Rollback failed for user ${userId}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Delete data from a specific table for a user
   *
   * SAFETY: This ONLY deletes from kwiktwik-kirana-be tables (schema.*)
   * It NEVER touches kirana-fe (old system) data - those are accessed via HTTP API only
   */
  private async deleteTableData(
    tableName: string,
    userId: string,
  ): Promise<void> {
    const tableMap: Record<string, any> = {
      user: schema.user,
      user_metadata: schema.userMetadata,
      accounts: schema.account,
      pushTokens: schema.pushTokens,
      deviceSessions: schema.deviceSessions,
      userImages: schema.userImages,
      playStoreRatings: schema.playStoreRatings,
      subscriptions: schema.subscriptions,
      orders: schema.orders,
      abandonedCheckouts: schema.abandonedCheckouts,
      // Note: webhookLogs are not migrated
      phonepeOrders: schema.phonepeOrders,
      phonepeSubscriptions: schema.phonepeSubscriptions,
      enhancedNotifications: schema.enhancedNotifications,
    };

    const table = tableMap[tableName];
    if (!table) {
      this.logger.warn(`Unknown table for rollback: ${tableName}`);
      return;
    }

    // User table uses 'id' column, others use 'userId'
    if (tableName === 'user') {
      await this.db.delete(table).where(eq(table.id, userId));
    } else {
      await this.db.delete(table).where(eq(table.userId, userId));
    }
  }

  /**
   * Cleanup stale migrations (cron job)
   */
  async cleanupStaleMigrations(): Promise<void> {
    const staleThreshold = new Date(Date.now() - this.config.staleThreshold);

    const staleMigrations = await this.db
      .select()
      .from(schema.migrationLogs)
      .where(
        and(
          eq(schema.migrationLogs.isLocked, true),
          lt(schema.migrationLogs.lastHeartbeat, staleThreshold),
          not(eq(schema.migrationLogs.status, MigrationState.COMPLETED)),
        ),
      );

    for (const migration of staleMigrations) {
      this.logger.warn(`Cleaning up stale migration: ${migration.id}`);

      await this.db
        .update(schema.migrationLogs)
        .set({
          isLocked: false,
          status: MigrationState.FAILED,
          currentState: MigrationState.FAILED,
          errorCode: MigrationErrorCode.TIMEOUT,
          errorMessage:
            'Migration timed out - no heartbeat received (cleaned up by cron)',
          completedAt: new Date(),
        })
        .where(eq(schema.migrationLogs.id, migration.id));
    }
  }
}
