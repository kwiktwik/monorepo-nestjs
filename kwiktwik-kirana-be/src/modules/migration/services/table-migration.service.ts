/**
 * Table Migration Service - Refactored
 *
 * Uses DataTransformationService for proper schema mapping
 * SAFETY NOTICE: This service ONLY inserts data into kwiktwik-kirana-be tables
 */

import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { IdMapper } from '../utils/id-mapper.util';
import { and, eq } from 'drizzle-orm';
import { DataTransformationService } from './data-transformation.service';

@Injectable()
export class TableMigrationService {
  private readonly logger = new Logger(TableMigrationService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly transformationService: DataTransformationService,
  ) {}

  /**
   * Ensure user exists before migrating related data
   */
  private async ensureUserExists(userId: string, record: any): Promise<void> {
    const existingUser = await this.db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      this.logger.log(`Creating user with id=${userId}`);

      await this.db.insert(schema.user).values({
        id: userId,
        name: record?.name || 'Unknown',
        email: record?.email || `${userId}@placeholder.com`,
        emailVerified: record?.emailVerified || false,
        phoneNumber: record?.phoneNumber,
        phoneNumberVerified: record?.phoneNumberVerified || false,
        image: record?.image,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.logger.log(`User ${userId} created successfully`);
    }
  }

  /**
   * Generic migration handler with transformation
   */
  private async migrateTable<T>(
    records: any[],
    tableName: string,
    schemaTable: any,
    transformFn: (
      records: any[],
      idMapper: IdMapper,
    ) => { success: any[]; failed: any[] },
    idMapper: IdMapper,
    userId: string,
  ): Promise<T[]> {
    if (!records || records.length === 0) return [];

    const { success, failed } = transformFn(records, idMapper);

    if (failed.length > 0) {
      this.logger.warn(
        `Failed to transform ${failed.length} ${tableName} records`,
      );
    }

    const migrated: T[] = [];
    for (const record of success) {
      try {
        await this.db.insert(schemaTable).values(record);
        migrated.push(record);
      } catch (error) {
        this.logger.error(
          `Failed to insert ${tableName} record:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
        // Continue with other records
      }
    }

    this.logger.log(
      `Migrated ${migrated.length}/${records.length} ${tableName} records`,
    );
    return migrated;
  }

  /**
   * Migrate user_metadata table
   */
  async migrateMetadata(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    if (!records || records.length === 0) return [];

    // Ensure user exists first
    await this.ensureUserExists(userId, records[0]);

    const { success, failed } =
      this.transformationService.transformUserMetadata(records, userId);

    if (failed.length > 0) {
      this.logger.warn(`Failed to transform ${failed.length} metadata records`);
    }

    const migrated: any[] = [];
    for (const record of success) {
      try {
        // Check if record exists
        const existing = await this.db
          .select()
          .from(schema.userMetadata)
          .where(
            and(
              eq(schema.userMetadata.userId, userId),
              eq(schema.userMetadata.appId, record.appId),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await this.db
            .update(schema.userMetadata)
            .set({
              upiVpa: record.upiVpa,
              audioLanguage: record.audioLanguage,
              updatedAt: new Date(),
            })
            .where(eq(schema.userMetadata.id, existing[0].id));
        } else {
          // Insert new
          await this.db.insert(schema.userMetadata).values(record);
        }

        migrated.push(record);
      } catch (error) {
        this.logger.error(
          `Failed to migrate metadata:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }

    this.logger.log(`Migrated ${migrated.length} metadata records`);
    return migrated;
  }

  /**
   * Migrate accounts table
   */
  async migrateAccounts(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    return this.migrateTable(
      records,
      'accounts',
      schema.account,
      (recs, mapper) =>
        this.transformationService.transformAccounts(recs, mapper),
      idMapper,
      userId,
    );
  }

  /**
   * Migrate push tokens
   */
  async migratePushTokens(
    records: any[],
    idMapper: IdMapper,
    userId: string,
  ): Promise<any[]> {
    const { success, failed } = this.transformationService.transformPushTokens(
      records,
      userId,
    );

    if (failed.length > 0) {
      this.logger.warn(
        `Failed to transform ${failed.length} push token records`,
      );
    }

    const migrated: any[] = [];
    for (const record of success) {
      try {
        // Check if token already exists
        const existing = await this.db
          .select()
          .from(schema.pushTokens)
          .where(eq(schema.pushTokens.token, record.token))
          .limit(1);

        if (existing.length > 0) {
          this.logger.log(
            `Push token already exists, skipping: ${record.token.substring(0, 20)}...`,
          );
          continue;
        }

        await this.db.insert(schema.pushTokens).values(record);
        migrated.push(record);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as any)?.code || '';
        this.logger.error(
          `Failed to insert push token: ${errorMessage} (code: ${errorCode})`,
        );
      }
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
    const { success, failed } =
      this.transformationService.transformDeviceSessions(records, userId);

    if (failed.length > 0) {
      this.logger.warn(
        `Failed to transform ${failed.length} device session records`,
      );
    }

    const migrated: any[] = [];
    for (const record of success) {
      try {
        await this.db.insert(schema.deviceSessions).values(record);
        migrated.push(record);
      } catch (error) {
        this.logger.error(
          `Failed to insert device session:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
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
    const { success, failed } = this.transformationService.transformUserImages(
      records,
      userId,
    );

    if (failed.length > 0) {
      this.logger.warn(
        `Failed to transform ${failed.length} user image records`,
      );
    }

    const migrated: any[] = [];
    for (const record of success) {
      try {
        await this.db.insert(schema.userImages).values(record);
        migrated.push(record);
      } catch (error) {
        this.logger.error(
          `Failed to insert user image:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
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
    const { success, failed } =
      this.transformationService.transformPlayStoreRatings(records, userId);

    if (failed.length > 0) {
      this.logger.warn(
        `Failed to transform ${failed.length} play store rating records`,
      );
    }

    const migrated: any[] = [];
    for (const record of success) {
      try {
        await this.db.insert(schema.playStoreRatings).values(record);
        migrated.push(record);
      } catch (error) {
        this.logger.error(
          `Failed to insert play store rating:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
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
    this.logger.log(`Migrating ${records?.length || 0} subscriptions`);

    const { success, failed } =
      this.transformationService.transformSubscriptions(records, idMapper);

    if (failed.length > 0) {
      this.logger.warn(
        `Failed to transform ${failed.length} subscription records:`,
        failed.map((f) => f.errors).flat(),
      );
    }

    this.logger.log(`Successfully transformed ${success.length} subscriptions`);

    const migrated: any[] = [];
    for (const record of success) {
      try {
        // Check if subscription already exists by razorpaySubscriptionId
        if (record.razorpaySubscriptionId) {
          const existing = await this.db
            .select()
            .from(schema.subscriptions)
            .where(eq(schema.subscriptions.razorpaySubscriptionId, record.razorpaySubscriptionId))
            .limit(1);

          if (existing.length > 0) {
            this.logger.log(`Subscription already exists, skipping: ${record.razorpaySubscriptionId}`);
            continue;
          }
        }

        this.logger.debug(`Inserting subscription: ${record.id}`);
        await this.db.insert(schema.subscriptions).values(record);
        migrated.push(record);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as any)?.code || '';
        this.logger.error(
          `Failed to insert subscription ${record.id}: ${errorMessage} (code: ${errorCode})`
        );
      }
    }

    this.logger.log(
      `Migrated ${migrated.length}/${records.length} subscription records`,
    );
    return migrated;
  }
    }

    this.logger.log(
      `Migrated ${migrated.length}/${records.length} subscription records`,
    );
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
    const { success, failed } = this.transformationService.transformOrders(
      records,
      idMapper,
    );

    if (failed.length > 0) {
      this.logger.warn(`Failed to transform ${failed.length} order records`);
    }

    const migrated: any[] = [];
    for (const record of success) {
      try {
        await this.db.insert(schema.orders).values(record);
        migrated.push(record);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorDetail = (error as any)?.detail || '';
        const errorCode = (error as any)?.code || '';
        const errorTable = (error as any)?.table || '';
        const errorConstraint = (error as any)?.constraint || '';
        const errorRoutine = (error as any)?.routine || '';
        const errorCause = (error as any)?.cause;

        this.logger.error(
          `Failed to insert order ${record.id}: ${errorMessage}`,
        );
        this.logger.error(
          `Error details - code: ${errorCode}, table: ${errorTable}, constraint: ${errorConstraint}, detail: ${errorDetail}, routine: ${errorRoutine}`,
        );

        // Log cause if exists
        if (errorCause) {
          this.logger.error(
            `Error cause: ${JSON.stringify(errorCause, Object.getOwnPropertyNames(errorCause))}`,
          );
        }

        // Log full error object
        this.logger.error(
          `Full error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`,
        );

        // Log the problematic record for debugging
        this.logger.error(
          `Problematic order record: ${JSON.stringify(record, null, 2)}`,
        );
      }
    }

    this.logger.log(
      `Migrated ${migrated.length}/${success.length} order records`,
    );
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
    const { success, failed } =
      this.transformationService.transformAbandonedCheckouts(records, userId);

    if (failed.length > 0) {
      this.logger.warn(
        `Failed to transform ${failed.length} abandoned checkout records`,
      );
    }

    const migrated: any[] = [];
    for (const record of success) {
      try {
        await this.db.insert(schema.abandonedCheckouts).values(record);
        migrated.push(record);
      } catch (error) {
        this.logger.error(
          `Failed to insert abandoned checkout:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
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
    const { success, failed } =
      this.transformationService.transformPhonepeOrders(records, idMapper);

    if (failed.length > 0) {
      this.logger.warn(
        `Failed to transform ${failed.length} PhonePe order records`,
      );
    }

    const migrated: any[] = [];
    for (const record of success) {
      try {
        await this.db.insert(schema.phonepeOrders).values(record);
        migrated.push(record);
      } catch (error) {
        this.logger.error(
          `Failed to insert PhonePe order:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
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
    const { success, failed } =
      this.transformationService.transformPhonepeSubscriptions(
        records,
        idMapper,
      );

    if (failed.length > 0) {
      this.logger.warn(
        `Failed to transform ${failed.length} PhonePe subscription records`,
      );
    }

    const migrated: any[] = [];
    for (const record of success) {
      try {
        await this.db.insert(schema.phonepeSubscriptions).values(record);
        migrated.push(record);
      } catch (error) {
        this.logger.error(
          `Failed to insert PhonePe subscription:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }

    return migrated;
  }
}
