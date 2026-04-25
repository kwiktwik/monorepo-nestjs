import { Injectable, Inject } from '@nestjs/common';
import { eq, and, lt, or, lte, isNotNull, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SubscriptionRepository } from '../../application/interfaces/repository.interface';
import { Subscription } from '../../domain/entities/subscription.entity';
import { DRIZZLE_TOKEN } from '../../../../database/drizzle.module';
import * as schema from '../../../../database/schema';
import {
  SubscriptionState,
  SubscriptionFrequency,
  AuthWorkflowType,
  AmountType,
  ProductType,
} from '../../domain/enums/subscription.enum';

/**
 * Drizzle implementation of SubscriptionRepository
 */
@Injectable()
export class SubscriptionDrizzleRepository implements SubscriptionRepository {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(subscription: Subscription): Promise<Subscription> {
    await this.db.insert(schema.phonepeSubscriptions).values({
      id: subscription.id,
      merchantSubscriptionId: subscription.merchantSubscriptionId,
      userId: subscription.userId,
      appId: subscription.appId,
      phonepeSubscriptionId: subscription.phonepeSubscriptionId,
      state: subscription.state,
      maxAmount: subscription.maxAmount,
      frequency: subscription.frequency,
      authWorkflowType: subscription.authWorkflowType,
      amountType: subscription.amountType,
      productType: subscription.productType,
      expireAt: subscription.expireAt,
      metadata: subscription.metadata,
      nextBillingDate: subscription.nextBillingDate,
      billingCycleCount: subscription.billingCycleCount,
      activatedAt: subscription.activatedAt,
      cancelledAt: subscription.cancelledAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      // Payment failure tracking fields
      consecutiveFailures: subscription.consecutiveFailures,
      lastFailureAt: subscription.lastFailureAt,
      lastFailureReason: subscription.lastFailureReason,
      gracePeriodEndAt: subscription.gracePeriodEndAt,
      isPremium: subscription.isPremium,
    });

    return subscription;
  }

  async findById(id: string): Promise<Subscription | null> {
    const result = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(eq(schema.phonepeSubscriptions.id, id))
      .limit(1);

    if (result.length === 0) return null;
    return this.toDomain(result[0]);
  }

  async findByMerchantSubscriptionId(
    merchantSubscriptionId: string,
  ): Promise<Subscription | null> {
    const result = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(
        eq(
          schema.phonepeSubscriptions.merchantSubscriptionId,
          merchantSubscriptionId,
        ),
      )
      .limit(1);

    if (result.length === 0) return null;
    return this.toDomain(result[0]);
  }

  async findByUserId(userId: string, appId: string): Promise<Subscription[]> {
    const results = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(
        and(
          eq(schema.phonepeSubscriptions.userId, userId),
          eq(schema.phonepeSubscriptions.appId, appId),
        ),
      );

    return results.map((r) => this.toDomain(r));
  }

  async findActive(appId: string): Promise<Subscription[]> {
    const results = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(
        and(
          eq(schema.phonepeSubscriptions.appId, appId),
          eq(schema.phonepeSubscriptions.state, 'ACTIVE'),
        ),
      );

    return results.map((r) => this.toDomain(r));
  }

  async update(subscription: Subscription): Promise<Subscription> {
    await this.db
      .update(schema.phonepeSubscriptions)
      .set({
        state: subscription.state,
        phonepeSubscriptionId: subscription.phonepeSubscriptionId,
        activatedAt: subscription.activatedAt,
        cancelledAt: subscription.cancelledAt,
        expireAt: subscription.expireAt,
        updatedAt: subscription.updatedAt,
        metadata: subscription.metadata,
        nextBillingDate: subscription.nextBillingDate,
        billingCycleCount: subscription.billingCycleCount,
        // Payment failure tracking fields
        consecutiveFailures: subscription.consecutiveFailures,
        lastFailureAt: subscription.lastFailureAt,
        lastFailureReason: subscription.lastFailureReason,
        gracePeriodEndAt: subscription.gracePeriodEndAt,
        isPremium: subscription.isPremium,
      })
      .where(eq(schema.phonepeSubscriptions.id, subscription.id));

    return subscription;
  }

  async existsByMerchantSubscriptionId(
    merchantSubscriptionId: string,
  ): Promise<boolean> {
    const result = await this.db
      .select({ id: schema.phonepeSubscriptions.id })
      .from(schema.phonepeSubscriptions)
      .where(
        eq(
          schema.phonepeSubscriptions.merchantSubscriptionId,
          merchantSubscriptionId,
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async findDueForRedemption(beforeDate: Date): Promise<Subscription[]> {
    // Find both ACTIVE subscriptions and EXPIRED subscriptions due for redemption in SQL
    const results = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(
        and(
          or(
            eq(schema.phonepeSubscriptions.state, 'ACTIVE'),
            eq(schema.phonepeSubscriptions.state, 'EXPIRED'),
          ),
          isNotNull(schema.phonepeSubscriptions.nextBillingDate),
          lte(schema.phonepeSubscriptions.nextBillingDate, beforeDate),
        ),
      );

    return results.map((r) => this.toDomain(r));
  }

  async findDueForRedemptionWithLock(
    beforeDate: Date,
    limit: number,
  ): Promise<Subscription[]> {
    // Uses FOR UPDATE SKIP LOCKED to allow multiple instances to process different rows safely
    const results = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(
        and(
          or(
            eq(schema.phonepeSubscriptions.state, 'ACTIVE'),
            eq(schema.phonepeSubscriptions.state, 'EXPIRED'),
          ),
          isNotNull(schema.phonepeSubscriptions.nextBillingDate),
          lte(schema.phonepeSubscriptions.nextBillingDate, beforeDate),
        ),
      )
      .limit(limit)
      .for('update', { skipLocked: true });

    return results.map((r) => this.toDomain(r));
  }

  async findFailedRedemptionsRetryable(
    maxRetries: number,
    daysOld: number,
  ): Promise<Subscription[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Filter by JSONB fields in SQL to avoid full table scan
    // Using ->> operator to extract text from JSONB and casting where necessary
    const results = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(
        and(
          eq(schema.phonepeSubscriptions.state, 'ACTIVE'),
          sql`${schema.phonepeSubscriptions.metadata}->>'lastRedemptionStatus' = 'failed'`,
          sql`(${schema.phonepeSubscriptions.metadata}->>'retryCount')::int < ${maxRetries}`,
          sql`(${schema.phonepeSubscriptions.metadata}->>'lastRedemptionDate')::timestamp >= ${cutoffDate}`,
        ),
      );

    return results.map((r) => this.toDomain(r));
  }

  async findStuckActivations(minutesOld: number): Promise<Subscription[]> {
    const cutoff = new Date(Date.now() - minutesOld * 60 * 1000);

    const results = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(
        and(
          eq(schema.phonepeSubscriptions.state, 'ACTIVATION_IN_PROGRESS'),
          lt(schema.phonepeSubscriptions.createdAt, cutoff),
        ),
      );

    return results.map((r) => this.toDomain(r));
  }

  private toDomain(data: any): Subscription {
    return Subscription.reconstruct({
      id: data.id,
      merchantSubscriptionId: data.merchantSubscriptionId,
      userId: data.userId,
      appId: data.appId,
      state: data.state as SubscriptionState,
      maxAmount: data.maxAmount,
      frequency: data.frequency as SubscriptionFrequency,
      authWorkflowType: data.authWorkflowType as AuthWorkflowType,
      amountType: data.amountType as AmountType,
      productType: (data.productType as ProductType) || 'UPI_MANDATE',
      expireAt: data.expireAt,
      metadata: data.metadata || {},
      phonepeSubscriptionId: data.phonepeSubscriptionId,
      activatedAt: data.activatedAt,
      cancelledAt: data.cancelledAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      nextBillingDate: data.nextBillingDate,
      billingCycleCount: data.billingCycleCount,
      // Payment failure tracking fields
      consecutiveFailures: data.consecutiveFailures,
      lastFailureAt: data.lastFailureAt,
      lastFailureReason: data.lastFailureReason,
      gracePeriodEndAt: data.gracePeriodEndAt,
      isPremium: data.isPremium,
    });
  }
}
