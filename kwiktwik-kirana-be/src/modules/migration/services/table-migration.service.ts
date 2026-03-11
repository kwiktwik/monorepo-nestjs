/**
 * Table Migration Service
 *
 * SAFETY NOTICE: This service ONLY inserts data into kwiktwik-kirana-be tables
 * - All operations are INSERT only into the new system's database
 * - NO delete or update operations on kirana-fe (old system)
 * - Original data in kirana-fe is ALWAYS preserved
 */

import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { IdMapper } from '../utils/id-mapper.util';

@Injectable()
export class TableMigrationService {
  private readonly logger = new Logger(TableMigrationService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Migrate user_metadata table
   */
  async migrateMetadata(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('user_metadata', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
        // Keep other fields as-is
      };

      await this.db.insert(schema.userMetadata).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    this.logger.log(`Migrated ${migrated.length} metadata records`);
    return migrated;
  }

  /**
   * Migrate accounts table (Google, Truecaller, etc)
   */
  async migrateAccounts(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('account', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
        // Map FK references
      };

      await this.db.insert(schema.account).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    this.logger.log(`Migrated ${migrated.length} account records`);
    return migrated;
  }

  /**
   * Migrate push tokens
   */
  async migratePushTokens(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('pushToken', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.pushTokens).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    return migrated;
  }

  /**
   * Migrate device sessions
   */
  async migrateDeviceSessions(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('deviceSession', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.deviceSessions).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    return migrated;
  }

  /**
   * Migrate user images
   */
  async migrateUserImages(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('userImage', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.userImages).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    return migrated;
  }

  /**
   * Migrate play store ratings
   */
  async migratePlayStoreRatings(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('playStoreRating', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.playStoreRatings).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    return migrated;
  }

  /**
   * Migrate subscriptions
   */
  async migrateSubscriptions(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('subscription', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.subscriptions).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    this.logger.log(`Migrated ${migrated.length} subscription records`);
    return migrated;
  }

  /**
   * Migrate orders
   */
  async migrateOrders(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('order', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.orders).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    this.logger.log(`Migrated ${migrated.length} order records`);
    return migrated;
  }

  /**
   * Migrate abandoned checkouts
   */
  async migrateAbandonedCheckouts(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('abandonedCheckout', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.abandonedCheckouts).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    return migrated;
  }

  /**
   * Migrate subscription logs
   */
  async migrateSubscriptionLogs(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('subscriptionLog', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
        // Map subscriptionId reference if exists
      };

      const mappedSubscriptionId = idMapper.getNewId(
        'subscription',
        record.subscriptionId,
      );
      if (mappedSubscriptionId && mappedRecord.subscriptionId) {
        mappedRecord.subscriptionId = mappedSubscriptionId;
      }

      await this.db.insert(schema.subscriptionLogs).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    return migrated;
  }

  /**
   * Migrate PhonePe orders
   */
  async migratePhonepeOrders(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('phonepeOrder', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.phonepeOrders).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    return migrated;
  }

  /**
   * Migrate PhonePe subscriptions
   */
  async migratePhonepeSubscriptions(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    const migrated: any[] = [];
    for (const record of records) {
      const newId = idMapper.generateNewId('phonepeSubscription', record.id);
      const mappedRecord = {
        ...record,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.phonepeSubscriptions).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    return migrated;
  }
}
