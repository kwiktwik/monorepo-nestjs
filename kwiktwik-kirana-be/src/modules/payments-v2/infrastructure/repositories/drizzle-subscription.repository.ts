/**
 * Drizzle Subscription Repository
 * 
 * Implements ISubscriptionRepository using Drizzle ORM.
 * Provides persistent storage for subscriptions in PostgreSQL.
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { eq, and, inArray, isNotNull, gt, lte, or, desc, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  Subscription,
  createSubscription,
  reconstructSubscription,
  transitionSubscriptionStatus,
  recordPaymentFailure,
  recordSuccessfulPayment,
  updateProviderData,
  updatePremiumStatus,
  SubscriptionPricing,
  ProviderSubscriptionData,
  RetryConfig,
  PaymentFailure,
  SubscriptionMetadata,
} from '../../domain/entities/subscription.entity';
import type { ISubscriptionRepository, SubscriptionQueryOptions } from '../../infrastructure/repositories/subscription.repository.interface';
import type { SubscriptionStatus } from '../../types/subscription-status.enum';
import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { BillingFrequency } from '../../types/frequency.enum';
import {
  subscriptionsV2,
  type SubscriptionV2,
  type NewSubscriptionV2,
} from '../../database/schema';
import { DRIZZLE_TOKEN } from '../../../../database/drizzle.module';
import * as schema from '../../../../database/schema';

/**
 * Drizzle-based subscription repository
 */
@Injectable()
export class DrizzleSubscriptionRepository implements ISubscriptionRepository {
  private readonly logger = new Logger(DrizzleSubscriptionRepository.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Find subscription by ID
   */
  async findById(id: string): Promise<Subscription | null> {
    try {
      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(eq(subscriptionsV2.id, id))
        .limit(1);

      return rows.length > 0 ? this.toDomain(rows[0]) : null;
    } catch (error) {
      this.logger.error(`Failed to find subscription by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find subscription by merchant subscription ID
   */
  async findByMerchantId(merchantSubscriptionId: string): Promise<Subscription | null> {
    try {
      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(eq(subscriptionsV2.merchantSubscriptionId, merchantSubscriptionId))
        .limit(1);

      return rows.length > 0 ? this.toDomain(rows[0]) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find subscription by merchant ID: ${merchantSubscriptionId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Find subscription by provider subscription ID
   */
  async findByProviderSubscriptionId(
    provider: string,
    providerSubscriptionId: string,
  ): Promise<Subscription | null> {
    try {
      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(
          and(
            eq(subscriptionsV2.provider, provider as PaymentProvider),
            sql`${subscriptionsV2.providerData}->>'subscriptionId' = ${providerSubscriptionId}`,
          ),
        )
        .limit(1);

      return rows.length > 0 ? this.toDomain(rows[0]) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find subscription by provider subscription ID: ${provider}/${providerSubscriptionId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Find all subscriptions for a user
   */
  async findByUserId(userId: string): Promise<readonly Subscription[]> {
    try {
      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(eq(subscriptionsV2.userId, userId))
        .orderBy(desc(subscriptionsV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find subscriptions for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Find all active subscriptions for a user
   */
  async findActiveByUserId(userId: string): Promise<readonly Subscription[]> {
    try {
      const activeStatuses: SubscriptionStatus[] = [
        'ACTIVE',
        'AUTHENTICATED',
        'PAUSED',
        'RETRYING',
      ];

      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(
          and(
            eq(subscriptionsV2.userId, userId),
            inArray(subscriptionsV2.status, activeStatuses),
            eq(subscriptionsV2.isPremium, true),
          ),
        )
        .orderBy(desc(subscriptionsV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find active subscriptions for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Find subscriptions by app ID
   */
  async findByAppId(appId: string): Promise<readonly Subscription[]> {
    try {
      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(eq(subscriptionsV2.appId, appId))
        .orderBy(desc(subscriptionsV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find subscriptions for app: ${appId}`, error);
      throw error;
    }
  }

  /**
   * Find subscriptions that need billing (for user-managed)
   */
  async findNeedingBilling(): Promise<readonly Subscription[]> {
    try {
      const now = new Date();

      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(
          and(
            eq(subscriptionsV2.subscriptionType, 'USER_MANAGED'),
            eq(subscriptionsV2.status, 'ACTIVE'),
            lte(subscriptionsV2.nextBillingDate, now),
          ),
        );

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error('Failed to find subscriptions needing billing', error);
      throw error;
    }
  }

  /**
   * Find subscriptions by user ID, app ID, and optional status filter
   */
  async findByUserAndApp(
    userId: string,
    appId: string,
    status?: string,
  ): Promise<readonly Subscription[]> {
    try {
      const conditions = [
        eq(subscriptionsV2.userId, userId),
        eq(subscriptionsV2.appId, appId),
      ];

      if (status) {
        conditions.push(eq(subscriptionsV2.status, status as SubscriptionStatus));
      }

      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(and(...conditions))
        .orderBy(desc(subscriptionsV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find subscriptions for user ${userId} in app ${appId}`, error);
      throw error;
    }
  }

  /**
   * Find subscriptions in retry state
   */
  async findInRetry(): Promise<readonly Subscription[]> {
    try {
      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(eq(subscriptionsV2.status, 'RETRYING'));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error('Failed to find subscriptions in retry', error);
      throw error;
    }
  }

  /**
   * Save subscription (create or update)
   * Uses upsert to avoid race conditions and N+1 queries.
   */
  async save(subscription: Subscription): Promise<Subscription> {
    try {
      const insertData = this.toInsertData(subscription);

      await this.db
        .insert(subscriptionsV2)
        .values(insertData)
        .onConflictDoUpdate({
          target: subscriptionsV2.id,
          set: {
            ...this.toUpdateFields(subscription),
            previousStatus: sql`${subscriptionsV2.status}`,
          },
        });

      return subscription;
    } catch (error) {
      this.logger.error(`Failed to save subscription: ${subscription.id}`, error);
      throw error;
    }
  }

  /**
   * Delete subscription
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(subscriptionsV2)
        .where(eq(subscriptionsV2.id, id))
        .returning({ id: subscriptionsV2.id });

      return result.length > 0;
    } catch (error) {
      this.logger.error(`Failed to delete subscription: ${id}`, error);
      throw error;
    }
  }

  /**
   * Check if subscription exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const rows = await this.db
        .select({ id: subscriptionsV2.id })
        .from(subscriptionsV2)
        .where(eq(subscriptionsV2.id, id))
        .limit(1);

      return rows.length > 0;
    } catch (error) {
      this.logger.error(`Failed to check subscription existence: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find subscriptions by status
   */
  async findByStatus(
    status: string | readonly string[],
    options?: SubscriptionQueryOptions,
  ): Promise<readonly Subscription[]> {
    try {
      const statuses = Array.isArray(status) ? [...status] : [status];

      let query = this.db
        .select()
        .from(subscriptionsV2)
        .where(inArray(subscriptionsV2.status, statuses as any[]))
        .orderBy(desc(subscriptionsV2.createdAt));

      if (options?.limit) {
        query = query.limit(options.limit) as typeof query;
      }

      if (options?.offset) {
        query = query.offset(options.offset) as typeof query;
      }

      const rows = await query;
      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find subscriptions by status`, error);
      throw error;
    }
  }

  /**
   * Find premium subscriptions for a user across apps
   */
  async findPremiumByUserId(
    userId: string,
    appIds?: string[],
  ): Promise<readonly Subscription[]> {
    try {
      const conditions = [eq(subscriptionsV2.userId, userId), eq(subscriptionsV2.isPremium, true)];

      if (appIds && appIds.length > 0) {
        conditions.push(inArray(subscriptionsV2.appId, appIds));
      }

      const rows = await this.db
        .select()
        .from(subscriptionsV2)
        .where(and(...conditions))
        .orderBy(desc(subscriptionsV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find premium subscriptions for user: ${userId}`, error);
      throw error;
    }
  }

  // ============================================================================
  // Mapping Methods
  // ============================================================================

  /**
   * Convert database row to domain entity
   */
  private toDomain(row: SubscriptionV2): Subscription {
    const pricing: SubscriptionPricing = {
      initialAmount: row.initialAmount,
      recurringAmount: row.recurringAmount,
      currency: row.currency,
      frequency: this.mapFrequencyToDomain(row.frequency),
      totalCycles: row.totalCycles,
    };

    const providerData: ProviderSubscriptionData = {
      subscriptionId: row.providerData.subscriptionId,
      orderId: row.providerData.orderId,
      customerId: row.providerData.customerId,
      planId: row.providerData.planId,
      mandateId: row.providerData.mandateId,
      raw: row.providerData.raw,
      lastSyncedAt: new Date(row.providerData.lastSyncedAt),
    };

    const retryConfig: RetryConfig | null = row.retryConfig
      ? {
          maxAttempts: row.retryConfig.maxAttempts,
          baseDelayMinutes: row.retryConfig.baseDelayMinutes,
          backoffMultiplier: row.retryConfig.backoffMultiplier,
          currentAttempt: row.retryConfig.currentAttempt,
          nextRetryAt: row.retryConfig.nextRetryAt ? new Date(row.retryConfig.nextRetryAt) : null,
          gracePeriodEndAt: row.retryConfig.gracePeriodEndAt
            ? new Date(row.retryConfig.gracePeriodEndAt)
            : null,
        }
      : null;

    const paymentFailures: PaymentFailure[] = row.paymentFailures.map((f) => ({
      failedAt: new Date(f.failedAt),
      reason: f.reason,
      errorCode: f.errorCode,
      errorMessage: f.errorMessage,
      providerResponse: null,
      orderId: f.orderId,
    }));

    const metadata: SubscriptionMetadata = {
      environment: row.metadata.environment as 'SANDBOX' | 'PRODUCTION',
      configId: row.metadata.configId,
      source: row.metadata.source,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      tags: row.metadata.tags,
      custom: row.metadata.custom,
    };

    return reconstructSubscription({
      id: row.id,
      merchantSubscriptionId: row.merchantSubscriptionId,
      userId: row.userId,
      appId: row.appId,
      subscriptionType: row.subscriptionType as SubscriptionType,
      provider: row.provider as PaymentProvider,
      planId: row.planId,
      pricing,
      status: row.status as SubscriptionStatus,
      billingCycleCount: row.billingCycleCount,
      nextBillingDate: row.nextBillingDate,
      lastBillingDate: row.lastBillingDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      activatedAt: row.activatedAt,
      cancelledAt: row.cancelledAt,
      expiredAt: row.expiredAt,
      providerData,
      retryConfig,
      paymentFailures,
      consecutiveFailures: row.consecutiveFailures,
      isPremium: row.isPremium,
      metadata,
    });
  }

  /**
   * Convert domain entity to insert data
   */
  private toInsertData(subscription: Subscription): NewSubscriptionV2 {
    return {
      id: subscription.id,
      merchantSubscriptionId: subscription.merchantSubscriptionId,
      userId: subscription.userId,
      appId: subscription.appId,
      subscriptionType: subscription.subscriptionType,
      provider: subscription.provider,
      configId: subscription.metadata.configId,
      environment: subscription.metadata.environment,
      planId: subscription.planId,
      initialAmount: subscription.pricing.initialAmount,
      recurringAmount: subscription.pricing.recurringAmount,
      currency: subscription.pricing.currency,
      frequency: this.mapFrequencyToDatabase(subscription.pricing.frequency),
      maxAmount: null,
      totalCycles: subscription.pricing.totalCycles,
      status: subscription.status,
      previousStatus: null,
      billingCycleCount: subscription.billingCycleCount,
      nextBillingDate: subscription.nextBillingDate,
      lastBillingDate: subscription.lastBillingDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      activatedAt: subscription.activatedAt,
      cancelledAt: subscription.cancelledAt,
      expiredAt: subscription.expiredAt,
      providerData: {
        subscriptionId: subscription.providerData.subscriptionId,
        orderId: subscription.providerData.orderId,
        customerId: subscription.providerData.customerId,
        planId: subscription.providerData.planId,
        mandateId: subscription.providerData.mandateId,
        raw: subscription.providerData.raw,
        lastSyncedAt: subscription.providerData.lastSyncedAt.toISOString(),
      },
      retryConfig: subscription.retryConfig
        ? {
            maxAttempts: subscription.retryConfig.maxAttempts,
            baseDelayMinutes: subscription.retryConfig.baseDelayMinutes,
            backoffMultiplier: subscription.retryConfig.backoffMultiplier,
            currentAttempt: subscription.retryConfig.currentAttempt,
            nextRetryAt: subscription.retryConfig.nextRetryAt?.toISOString() ?? null,
            gracePeriodEndAt: subscription.retryConfig.gracePeriodEndAt?.toISOString() ?? null,
          }
        : null,
      paymentFailures: subscription.paymentFailures.map((f) => ({
        failedAt: f.failedAt.toISOString(),
        reason: f.reason,
        errorCode: f.errorCode,
        errorMessage: f.errorMessage,
        orderId: f.orderId,
      })),
      consecutiveFailures: subscription.consecutiveFailures,
      isPremium: subscription.isPremium,
      metadata: {
        environment: subscription.metadata.environment,
        configId: subscription.metadata.configId,
        source: subscription.metadata.source,
        tags: [...subscription.metadata.tags],
        custom: subscription.metadata.custom,
      },
    };
  }

  /**
   * Convert domain entity to update data
   */
  private toUpdateFields(subscription: Subscription): Partial<NewSubscriptionV2> {
    return {
      status: subscription.status,
      billingCycleCount: subscription.billingCycleCount,
      nextBillingDate: subscription.nextBillingDate,
      lastBillingDate: subscription.lastBillingDate,
      updatedAt: new Date(),
      activatedAt: subscription.activatedAt,
      cancelledAt: subscription.cancelledAt,
      expiredAt: subscription.expiredAt,
      providerData: {
        subscriptionId: subscription.providerData.subscriptionId,
        orderId: subscription.providerData.orderId,
        customerId: subscription.providerData.customerId,
        planId: subscription.providerData.planId,
        mandateId: subscription.providerData.mandateId,
        raw: subscription.providerData.raw,
        lastSyncedAt: subscription.providerData.lastSyncedAt.toISOString(),
      },
      retryConfig: subscription.retryConfig
        ? {
            maxAttempts: subscription.retryConfig.maxAttempts,
            baseDelayMinutes: subscription.retryConfig.baseDelayMinutes,
            backoffMultiplier: subscription.retryConfig.backoffMultiplier,
            currentAttempt: subscription.retryConfig.currentAttempt,
            nextRetryAt: subscription.retryConfig.nextRetryAt?.toISOString() ?? null,
            gracePeriodEndAt: subscription.retryConfig.gracePeriodEndAt?.toISOString() ?? null,
          }
        : null,
      paymentFailures: subscription.paymentFailures.map((f) => ({
        failedAt: f.failedAt.toISOString(),
        reason: f.reason,
        errorCode: f.errorCode,
        errorMessage: f.errorMessage,
        orderId: f.orderId,
      })),
      consecutiveFailures: subscription.consecutiveFailures,
      isPremium: subscription.isPremium,
      metadata: {
        environment: subscription.metadata.environment,
        configId: subscription.metadata.configId,
        source: subscription.metadata.source,
        tags: [...subscription.metadata.tags],
        custom: subscription.metadata.custom,
      },
    };
  }

  /**
   * Map database frequency to domain frequency
   */
  private mapFrequencyToDomain(dbFrequency: string): BillingFrequency {
    const frequencyMap: Record<string, BillingFrequency> = {
      'DAILY': 'DAILY',
      'WEEKLY': 'WEEKLY',
      'BIWEEKLY': 'FORTNIGHTLY',
      'MONTHLY': 'MONTHLY',
      'QUARTERLY': 'QUARTERLY',
      'SEMIANNUALLY': 'HALF_YEARLY',
      'YEARLY': 'YEARLY',
      'ONDEMAND': 'ON_DEMAND',
    };
    return frequencyMap[dbFrequency] ?? 'MONTHLY';
  }

  /**
   * Map domain frequency to database frequency
   */
  private mapFrequencyToDatabase(domainFrequency: BillingFrequency): 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY' | 'ONDEMAND' {
    const frequencyMap: Record<string, 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY' | 'ONDEMAND'> = {
      'DAILY': 'DAILY',
      'WEEKLY': 'WEEKLY',
      'FORTNIGHTLY': 'BIWEEKLY',
      'MONTHLY': 'MONTHLY',
      'BIMONTHLY': 'MONTHLY', // Approximation
      'QUARTERLY': 'QUARTERLY',
      'HALF_YEARLY': 'SEMIANNUALLY',
      'YEARLY': 'YEARLY',
      'ON_DEMAND': 'ONDEMAND',
    };
    return frequencyMap[domainFrequency] ?? 'MONTHLY';
  }
}
