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
  ): Promise<MigratableUserData> {
    this.logger.log(`Fetching all data for user: ${userId}`);

    try {
      const response = await fetch(
        `${this.kiranaFeBaseUrl}/api/internal/user/data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': this.internalApiKey,
            'X-App-ID': 'com.kiranaapps.app',
          },
          body: JSON.stringify({ userId, phoneNumber }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data = await response.json();

      return {
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        metadata: data.metadata || [],
        accounts: data.accounts || [],
        pushTokens: data.pushTokens || [],
        deviceSessions: data.deviceSessions || [],
        userImages: data.userImages || [],
        playStoreRatings: data.playStoreRatings || [],
        subscriptions: data.subscriptions || [],
        orders: data.orders || [],
        abandonedCheckouts: data.abandonedCheckouts || [],
        subscriptionLogs: data.subscriptionLogs || [],
        phonepeOrders: data.phonepeOrders || [],
        phonepeSubscriptions: data.phonepeSubscriptions || [],
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch user data:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }
}
