import { Injectable, Inject } from '@nestjs/common';
import { eq, and, lt, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { RedemptionRepository } from '../../application/interfaces/repository.interface';
import { Redemption } from '../../domain/entities/redemption.entity';
import { DRIZZLE_TOKEN } from '../../../../database/drizzle.module';
import * as schema from '../../../../database/schema';
import { RedemptionState } from '../../domain/enums/subscription.enum';

/**
 * Drizzle implementation of RedemptionRepository
 */
@Injectable()
export class RedemptionDrizzleRepository implements RedemptionRepository {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(redemption: Redemption): Promise<Redemption> {
    await this.db.insert(schema.phonepeRedemptions).values({
      id: redemption.id,
      merchantOrderId: redemption.merchantOrderId,
      merchantSubscriptionId: redemption.merchantSubscriptionId,
      phonepeOrderId: redemption.phonepeOrderId,
      userId: redemption.userId,
      appId: redemption.appId,
      amount: redemption.amount,
      state: redemption.state,
      autoDebit: redemption.autoDebit,
      transactionId: redemption.transactionId,
      notifiedAt: redemption.notifiedAt,
      validAfter: null, // deprecated, using expireAt instead
      validUpto: redemption.expireAt,
      errorCode: redemption.errorCode,
      detailedErrorCode: redemption.detailedErrorCode,
      attemptCount: redemption.attemptCount,
      processedAt: redemption.processedAt,
      correlationId: redemption.correlationId,
      metadata: redemption.metadata,
      createdAt: redemption.createdAt,
      updatedAt: redemption.updatedAt,
    });

    return redemption;
  }

  async findById(id: string): Promise<Redemption | null> {
    const result = await this.db
      .select()
      .from(schema.phonepeRedemptions)
      .where(eq(schema.phonepeRedemptions.id, id))
      .limit(1);

    if (result.length === 0) return null;
    return this.toDomain(result[0]);
  }

  async findByMerchantOrderId(
    merchantOrderId: string,
  ): Promise<Redemption | null> {
    const result = await this.db
      .select()
      .from(schema.phonepeRedemptions)
      .where(eq(schema.phonepeRedemptions.merchantOrderId, merchantOrderId))
      .limit(1);

    if (result.length === 0) return null;
    return this.toDomain(result[0]);
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Redemption[]> {
    const results = await this.db
      .select()
      .from(schema.phonepeRedemptions)
      .where(
        eq(schema.phonepeRedemptions.merchantSubscriptionId, subscriptionId),
      )
      .orderBy(schema.phonepeRedemptions.createdAt);

    return results.map((r) => this.toDomain(r));
  }

  async findActiveBySubscriptionId(
    subscriptionId: string,
  ): Promise<Redemption | null> {
    const results = await this.db
      .select()
      .from(schema.phonepeRedemptions)
      .where(
        and(
          eq(schema.phonepeRedemptions.merchantSubscriptionId, subscriptionId),
          inArray(schema.phonepeRedemptions.state, [
            'NOTIFICATION_IN_PROGRESS',
            'NOTIFIED',
            'PENDING',
          ]),
        ),
      )
      .limit(1);

    if (results.length === 0) return null;
    return this.toDomain(results[0]);
  }

  async update(redemption: Redemption): Promise<Redemption> {
    await this.db
      .update(schema.phonepeRedemptions)
      .set({
        state: redemption.state,
        phonepeOrderId: redemption.phonepeOrderId,
        transactionId: redemption.transactionId,
        notifiedAt: redemption.notifiedAt,
        validAfter: null, // deprecated, using expireAt instead
        validUpto: redemption.expireAt,
        errorCode: redemption.errorCode,
        detailedErrorCode: redemption.detailedErrorCode,
        attemptCount: redemption.attemptCount,
        processedAt: redemption.processedAt,
        correlationId: redemption.correlationId,
        metadata: redemption.metadata,
        updatedAt: redemption.updatedAt,
      })
      .where(eq(schema.phonepeRedemptions.id, redemption.id));

    return redemption;
  }

  async findPendingNotifications(limit: number): Promise<Redemption[]> {
    const results = await this.db
      .select()
      .from(schema.phonepeRedemptions)
      .where(
        eq(
          schema.phonepeRedemptions.state,
          'NOTIFICATION_IN_PROGRESS' as RedemptionState,
        ),
      )
      .limit(limit);

    return results.map((r) => this.toDomain(r));
  }

  async findStuckRedemptions(hoursOld: number): Promise<Redemption[]> {
    const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

    const results = await this.db
      .select()
      .from(schema.phonepeRedemptions)
      .where(
        and(
          inArray(schema.phonepeRedemptions.state, [
            'NOTIFICATION_IN_PROGRESS',
            'NOTIFIED',
            'PENDING',
          ]),
          lt(schema.phonepeRedemptions.createdAt, cutoff),
        ),
      );

    return results.map((r) => this.toDomain(r));
  }

  private toDomain(data: any): Redemption {
    return Redemption.reconstruct({
      id: data.id,
      merchantOrderId: data.merchantOrderId,
      merchantSubscriptionId: data.merchantSubscriptionId,
      userId: data.userId,
      appId: data.appId,
      amount: data.amount,
      state: data.state as RedemptionState,
      phonepeOrderId: data.phonepeOrderId,
      transactionId: data.transactionId,
      notifiedAt: data.notifiedAt,
      expireAt: data.validUpto, // Map validUpto to expireAt
      errorCode: data.errorCode,
      detailedErrorCode: data.detailedErrorCode,
      autoDebit: data.autoDebit,
      metadata: data.metadata || {},
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      attemptCount: data.attemptCount,
      processedAt: data.processedAt,
      correlationId: data.correlationId,
    });
  }
}
