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

/**
 * Parse a date string or Date object into a valid Date
 * Returns null if the value is null/undefined or invalid
 */
function parseDate(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

/**
 * Common date field names that need parsing
 */
const DATE_FIELDS = [
  'createdAt',
  'updatedAt',
  'created_at',
  'updated_at',
  'expiresAt',
  'expires_at',
  'deletedAt',
  'deleted_at',
  'timestamp',
  'lastHeartbeat',
  'last_heartbeat',
  'lockedAt',
  'locked_at',
  'startAt',
  'start_at',
  'endAt',
  'end_at',
  'chargeAt',
  'charge_at',
  'currentStart',
  'current_start',
  'currentEnd',
  'current_end',
  'expireAt',
  'expire_at',
  'activatedAt',
  'activated_at',
  'cancelledAt',
  'cancelled_at',
  'notifiedAt',
  'notified_at',
  'validAfter',
  'valid_after',
  'validUpto',
  'valid_upto',
  'sentAt',
  'sent_at',
  'submittedToPlayStoreAt',
  'submitted_to_play_store_at',
  'offerExpiresAt',
  'offer_expires_at',
  'discountNotificationSentAt',
  'discount_notification_sent_at',
  'lastNotificationSentAt',
  'last_notification_sent_at',
  'nextNotificationScheduledAt',
  'next_notification_scheduled_at',
  'checkoutStartedAt',
  'checkout_started_at',
  'lastMessageAt',
  'last_message_at',
  'joinedAt',
  'joined_at',
  'lastReadAt',
  'last_read_at',
  'mutedUntil',
  'muted_until',
  'editedAt',
  'edited_at',
  'readAt',
  'read_at',
  'sendAt',
  'send_at',
  'processedAt',
  'processed_at',
  'accessTokenExpiresAt',
  'accessTokenExpires_at',
  'refreshTokenExpiresAt',
  'refreshTokenExpires_at',
];

/**
 * Parse all date fields in a record
 */
function parseRecordDates(record: any): any {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const parsed: any = {};
  for (const [key, value] of Object.entries(record)) {
    if (DATE_FIELDS.includes(key)) {
      parsed[key] = parseDate(value);
    } else if (typeof value === 'object' && value !== null) {
      parsed[key] = parseRecordDates(value);
    } else {
      parsed[key] = value;
    }
  }
  return parsed;
}

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
      const parsedRecord = parseRecordDates(record);
      const mappedRecord = {
        userId: userId,
        appId: parsedRecord.appId,
        upiVpa: parsedRecord.upiVpa,
        audioLanguage: parsedRecord.audioLanguage,
        createdAt: parsedRecord.createdAt || new Date(),
        updatedAt: parsedRecord.updatedAt || new Date(),
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
      const parsedRecord = parseRecordDates(record);
      const mappedRecord = {
        ...parsedRecord,
        id: newId,
        userId: userId,
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
      const parsedRecord = parseRecordDates(record);
      const mappedRecord = {
        ...parsedRecord,
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
      const parsedRecord = parseRecordDates(record);
      const mappedRecord = {
        ...parsedRecord,
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
      const parsedRecord = parseRecordDates(record);
      const mappedRecord = {
        ...parsedRecord,
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
