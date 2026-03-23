import { Injectable, Inject } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
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
        updatedAt: subscription.updatedAt,
        metadata: subscription.metadata,
        nextBillingDate: subscription.nextBillingDate,
        billingCycleCount: subscription.billingCycleCount,
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
    const results = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(and(eq(schema.phonepeSubscriptions.state, 'ACTIVE')));

    const due = results.filter(
      (sub) =>
        sub.nextBillingDate && new Date(sub.nextBillingDate) <= beforeDate,
    );

    return due.map((r) => this.toDomain(r));
  }

  async findFailedRedemptionsRetryable(
    maxRetries: number,
    daysOld: number,
  ): Promise<Subscription[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const results = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(and(eq(schema.phonepeSubscriptions.state, 'ACTIVE')));

    const retryable = results.filter((sub: any) => {
      const meta = sub.metadata || {};
      const retryCount = Number(meta.retryCount) || 0;
      const lastRedemptionStatus = meta.lastRedemptionStatus as string;
      const lastRedemptionDate = meta.lastRedemptionDate
        ? new Date(meta.lastRedemptionDate as string)
        : null;

      return (
        retryCount < maxRetries &&
        lastRedemptionStatus === 'failed' &&
        lastRedemptionDate &&
        lastRedemptionDate >= cutoffDate
      );
    });

    return retryable.map((r) => this.toDomain(r));
  }

  async findStuckActivations(minutesOld: number): Promise<Subscription[]> {
    const cutoff = new Date(Date.now() - minutesOld * 60 * 1000);

    const results = await this.db
      .select()
      .from(schema.phonepeSubscriptions)
      .where(
        and(
          eq(schema.phonepeSubscriptions.state, 'ACTIVATION_IN_PROGRESS'),
          sql`${schema.phonepeSubscriptions.createdAt} < ${cutoff}`
        )
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
    });
  }
}
