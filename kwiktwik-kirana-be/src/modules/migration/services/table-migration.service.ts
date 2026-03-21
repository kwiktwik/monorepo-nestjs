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
import { and, eq } from 'drizzle-orm';

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
 * Parse all date fields in a record and convert undefined to null
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
      // Convert undefined to null for database compatibility
      parsed[key] = value === undefined ? null : value;
    }
  }
  return parsed;
}

/**
 * Clean object by removing undefined values (convert to null)
 */
function cleanUndefined(obj: any): any {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    cleaned[key] = value === undefined ? null : value;
  }
  return cleaned;
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
  private async ensureUserExists(userId: string, record: any): Promise<void> {
    // Check if user exists
    const existingUser = await this.db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      console.log(`[MIGRATION_DEBUG] Creating user with id=${userId}`);
      // Create user from metadata record
      await this.db.insert(schema.user).values({
        id: userId,
        name: record.name || 'Unknown',
        email: record.email || `${userId}@placeholder.com`,
        emailVerified: record.emailVerified || false,
        phoneNumber: record.phoneNumber,
        phoneNumberVerified: record.phoneNumberVerified || false,
        image: record.image,
        isDeleted: false,
        createdAt: parseDate(record.createdAt) || new Date(),
        updatedAt: parseDate(record.updatedAt) || new Date(),
      });
      console.log(`[MIGRATION_DEBUG] User created successfully`);
    } else {
      console.log(`[MIGRATION_DEBUG] User already exists`);
    }
  }

  async migrateMetadata(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    console.log(
      `[MIGRATION_DEBUG] migrateMetadata called with ${records?.length || 0} records for user ${userId}`,
    );
    if (!records || records.length === 0) return [];

    // Ensure user exists before migrating metadata
    await this.ensureUserExists(userId, records[0]);

    const migrated: any[] = [];
    for (const record of records) {
      const parsedRecord = parseRecordDates(record);
      console.log(`[MIGRATION_DEBUG] Processing record:`, {
        appId: parsedRecord.appId,
        hasUpiVpa: !!parsedRecord.upiVpa,
      });
      const mappedRecord = cleanUndefined({
        userId: userId,
        appId: parsedRecord.appId || 'com.kiranaapps.app',
        upiVpa: parsedRecord.upiVpa,
        audioLanguage: parsedRecord.audioLanguage,
        createdAt: parsedRecord.createdAt || new Date(),
        updatedAt: parsedRecord.updatedAt || new Date(),
      });

      // Check if record exists first
      console.log(
        `[MIGRATION_DEBUG] Checking if record exists for userId=${userId}, appId=${mappedRecord.appId}`,
      );
      const existing = await this.db
        .select()
        .from(schema.userMetadata)
        .where(
          and(
            eq(schema.userMetadata.userId, userId),
            eq(schema.userMetadata.appId, mappedRecord.appId),
          ),
        )
        .limit(1);

      console.log(
        `[MIGRATION_DEBUG] Found ${existing.length} existing records`,
      );

      if (existing.length > 0) {
        console.log(
          `[MIGRATION_DEBUG] Updating existing record with id=${existing[0].id}`,
        );
        // Update existing record
        await this.db
          .update(schema.userMetadata)
          .set({
            upiVpa: mappedRecord.upiVpa,
            audioLanguage: mappedRecord.audioLanguage,
            updatedAt: new Date(),
          })
          .where(eq(schema.userMetadata.id, existing[0].id));
      } else {
        console.log(`[MIGRATION_DEBUG] Inserting new record`);
        // Insert new record
        await this.db.insert(schema.userMetadata).values(mappedRecord);
      }
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
        id: newId,
        accountId: parsedRecord.accountId,
        providerId: parsedRecord.providerId,
        userId: userId,
        appId: parsedRecord.appId,
        accessToken: parsedRecord.accessToken,
        refreshToken: parsedRecord.refreshToken,
        idToken: parsedRecord.idToken,
        accessTokenExpiresAt: parsedRecord.accessTokenExpiresAt,
        refreshTokenExpiresAt: parsedRecord.refreshTokenExpiresAt,
        scope: parsedRecord.scope,
        password: parsedRecord.password,
        createdAt: parsedRecord.createdAt || new Date(),
        updatedAt: parsedRecord.updatedAt || new Date(),
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
      const parsedRecord = parseRecordDates(record);

      const mappedRecord = {
        userId: userId,
        appId: parsedRecord.appId,
        token: parsedRecord.token,
        deviceModel: parsedRecord.deviceModel,
        osVersion: parsedRecord.osVersion,
        isActive: parsedRecord.isActive ?? true,
        createdAt: parsedRecord.createdAt || new Date(),
        updatedAt: parsedRecord.updatedAt || new Date(),
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
      const parsedRecord = parseRecordDates(record);

      const mappedRecord = {
        userId: userId,
        appId: parsedRecord.appId,
        deviceModel: parsedRecord.deviceModel,
        osVersion: parsedRecord.osVersion,
        appVersion: parsedRecord.appVersion,
        buildNumber: parsedRecord.buildNumber,
        platform: parsedRecord.platform,
        manufacturer: parsedRecord.manufacturer,
        brand: parsedRecord.brand,
        locale: parsedRecord.locale,
        timezone: parsedRecord.timezone,
        createdAt: parsedRecord.createdAt || new Date(),
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
      const parsedRecord = parseRecordDates(record);

      const mappedRecord = {
        userId: userId,
        appId: parsedRecord.appId,
        imageUrl: parsedRecord.imageUrl,
        removedBgImageUrl: parsedRecord.removedBgImageUrl,
        createdAt: parsedRecord.createdAt || new Date(),
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
      const parsedRecord = parseRecordDates(record);

      const mappedRecord = {
        userId: userId,
        appId: parsedRecord.appId,
        rating: parsedRecord.rating,
        review: parsedRecord.review,
        reviewTitle: parsedRecord.reviewTitle,
        packageName: parsedRecord.packageName,
        appVersion: parsedRecord.appVersion,
        deviceModel: parsedRecord.deviceModel,
        osVersion: parsedRecord.osVersion,
        language: parsedRecord.language,
        submittedToPlayStoreAt: parsedRecord.submittedToPlayStoreAt,
        createdAt: parsedRecord.createdAt || new Date(),
        updatedAt: parsedRecord.updatedAt || new Date(),
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
      const parsedRecord = parseRecordDates(record);

      // Explicitly map only the fields in the new schema
      const mappedRecord = cleanUndefined({
        id: newId,
        userId: userId,
        razorpaySubscriptionId: parsedRecord.razorpaySubscriptionId,
        razorpayPlanId: parsedRecord.razorpayPlanId,
        appId: parsedRecord.appId,
        customerId: parsedRecord.customerId,
        razorpayCustomerId: parsedRecord.razorpayCustomerId,
        status: parsedRecord.status,
        quantity: parsedRecord.quantity,
        totalCount: parsedRecord.totalCount,
        paidCount: parsedRecord.paidCount,
        remainingCount: parsedRecord.remainingCount,
        startAt: parsedRecord.startAt,
        endAt: parsedRecord.endAt,
        chargeAt: parsedRecord.chargeAt,
        currentStart: parsedRecord.currentStart,
        currentEnd: parsedRecord.currentEnd,
        notes: parsedRecord.notes,
        razorpayPaymentId: parsedRecord.razorpayPaymentId,
        fourHourEventSent: parsedRecord.fourHourEventSent ?? false,
        metadata: parsedRecord.metadata,
        createdAt: parsedRecord.createdAt || new Date(),
        updatedAt: parsedRecord.updatedAt || new Date(),
      });

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
      const parsedRecord = parseRecordDates(record);
      const mappedRecord = {
        ...parsedRecord,
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
      const parsedRecord = parseRecordDates(record);
      const mappedRecord = {
        ...parsedRecord,
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
      const parsedRecord = parseRecordDates(record);
      const mappedRecord = {
        ...parsedRecord,
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
      const parsedRecord = parseRecordDates(record);
      const mappedRecord = {
        ...parsedRecord,
        id: newId,
        userId: userId,
      };

      await this.db.insert(schema.phonepeSubscriptions).values(mappedRecord);
      migrated.push(mappedRecord);
    }

    return migrated;
  }
}
