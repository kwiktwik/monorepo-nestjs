/**
 * Kirana-FE Data Service
 *
 * SAFETY NOTICE: This service ONLY reads data from kirana-fe (old system)
 * - All operations are read-only via HTTP API
 * - NO write, update, or delete operations are performed on kirana-fe
 * - Original data in kirana-fe is ALWAYS preserved
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MigratableUserData } from '../interfaces/migration.interfaces';
import {
  fetchWithTimeout,
  FetchTiming,
  formatTimingLog,
  formatTimingLogs,
  FetchTimeoutError,
} from '../utils/fetch-with-timeout.util';

// Timeout configuration for different operations
const FETCH_USER_DATA_TIMEOUT_MS = 30000; // 30 seconds - heavy operation
const CHECK_MIGRATION_STATUS_TIMEOUT_MS = 5000; // 5 seconds - lightweight
const MARK_MIGRATED_TIMEOUT_MS = 10000; // 10 seconds - write operation

@Injectable()
export class KiranaFeDataService {
  private readonly logger = new Logger(KiranaFeDataService.name);
  private readonly kiranaFeBaseUrl: string;
  private readonly internalApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.kiranaFeBaseUrl = this.configService.get<string>(
      'KIRANA_FE_BASE_URL',
      'http://localhost:3000',
    );
    this.internalApiKey = this.configService.get<string>(
      'INTERNAL_API_KEY',
      '',
    );
  }

  /**
   * Fetch all user data from kirana-fe
   * Calls internal API endpoint to get all tables
   *
   * SAFETY: This is a READ-ONLY operation. No data is modified in kirana-fe.
   */
  async fetchAllUserData(
    userId: string,
    phoneNumber: string,
  ): Promise<MigratableUserData & { timing: FetchTiming }> {
    this.logger.log(`Fetching all data for user: ${userId}`);
    const url = `${this.kiranaFeBaseUrl}/api/internal/user/data`;

    try {
      const { response, timing } = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': this.internalApiKey,
            'X-App-ID': 'com.kiranaapps.app',
          },
          body: JSON.stringify({ userId, phoneNumber }),
        },
        FETCH_USER_DATA_TIMEOUT_MS,
        'fetch_user_data',
      );

      this.logger.log(`Fetch user data timing: ${formatTimingLog(timing)}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user data: HTTP ${response.status} (${timing.durationMs}ms)`,
        );
      }

      const data = await response.json();

      // Log data size for debugging
      const dataSize = JSON.stringify(data).length;
      this.logger.log(
        `Fetched user data: ${dataSize} bytes, ` +
          `subscriptions: ${(data.subscriptions || []).length}, ` +
          `orders: ${(data.orders || []).length}, ` +
          `accounts: ${(data.accounts || []).length}`,
      );

      return {
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        user: data.user || null,
        metadata: data.metadata || [],
        accounts: data.accounts || [],
        pushTokens: data.pushTokens || [],
        deviceSessions: data.deviceSessions || [],
        userImages: data.userImages || [],
        playStoreRatings: data.playStoreRatings || [],
        subscriptions: data.subscriptions || [],
        orders: data.orders || [],
        abandonedCheckouts: data.abandonedCheckouts || [],
        webhookLogs: [], // Not migrated - old subscription_logs are not compatible with new schema
        phonepeOrders: data.phonepeOrders || [],
        phonepeSubscriptions: data.phonepeSubscriptions || [],
        enhancedNotifications: data.enhancedNotifications || [],
        timing,
      };
    } catch (error) {
      if (error instanceof FetchTimeoutError) {
        const timeoutMsg =
          `Failed to fetch user data: Timeout after ${FETCH_USER_DATA_TIMEOUT_MS}ms. ` +
          `kirana-fe may be slow or unresponsive. ` +
          `User has many records or kirana-fe is under heavy load.`;
        this.logger.error(timeoutMsg);
        throw new Error(timeoutMsg);
      }

      this.logger.error(
        `Failed to fetch user data:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  /**
   * Check if user is already migrated in old system
   */
  async checkMigrationStatusInOldSystem(userId: string): Promise<{
    isMigrated: boolean;
    migratedAt?: string;
    kwiktwikUserId?: string;
    timing?: FetchTiming;
  }> {
    const url = `${this.kiranaFeBaseUrl}/api/internal/user/${userId}/migration-status`;

    try {
      const { response, timing } = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers: {
            'X-Internal-Key': this.internalApiKey,
            'X-App-ID': 'com.kiranaapps.app',
          },
        },
        CHECK_MIGRATION_STATUS_TIMEOUT_MS,
        'check_migration_status',
      );

      if (!response.ok) {
        return { isMigrated: false, timing };
      }

      const result = await response.json();
      return { ...result, timing };
    } catch (error) {
      if (error instanceof FetchTimeoutError) {
        this.logger.warn(
          `Timeout checking migration status for ${userId} after ${CHECK_MIGRATION_STATUS_TIMEOUT_MS}ms. ` +
            `Assuming not migrated.`,
        );
      } else {
        this.logger.error(
          `Failed to check migration status in old system:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
      return { isMigrated: false };
    }
  }

  /**
   * Mark user as migrated in old system after successful migration
   */
  async markUserAsMigratedInOldSystem(
    userId: string,
    kwiktwikUserId: string,
  ): Promise<{ success: boolean; timing?: FetchTiming }> {
    const url = `${this.kiranaFeBaseUrl}/api/internal/user/mark-migrated`;

    try {
      const { response, timing } = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': this.internalApiKey,
            'X-App-ID': 'com.kiranaapps.app',
          },
          body: JSON.stringify({ userId, kwiktwikUserId }),
        },
        MARK_MIGRATED_TIMEOUT_MS,
        'mark_migrated',
      );

      if (!response.ok) {
        this.logger.error(
          `Failed to mark user as migrated in old system: HTTP ${response.status} (${timing.durationMs}ms)`,
        );
        return { success: false, timing };
      }

      this.logger.log(
        `User ${userId} marked as migrated in old system (${timing.durationMs}ms)`,
      );
      return { success: true, timing };
    } catch (error) {
      if (error instanceof FetchTimeoutError) {
        this.logger.error(
          `Timeout marking user ${userId} as migrated after ${MARK_MIGRATED_TIMEOUT_MS}ms. ` +
            `Migration succeeded but old system not updated.`,
        );
      } else {
        this.logger.error(
          `Failed to mark user as migrated in old system:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
      return { success: false };
    }
  }

  /**
   * Get formatted timing logs for all HTTP operations
   * Useful for storing detailed timing in database
   */
  formatTimingLogsForStorage(timings: FetchTiming[]): string {
    return formatTimingLogs(timings);
  }
}
