import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, or, isNull, gt, sql } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import { premiumEntitlements, type PremiumEntitlement } from '../database/schema';

export interface GrantFromSubscriptionParams {
  subscriptionId: string;
  userId: string;
  appId: string;
  planId: string;
}

export interface GrantFromOrderParams {
  orderId: string;
  userId: string;
  appId: string;
  planId: string;
  durationDays: number;
}

export interface ActiveEntitlement {
  id: string;
  userId: string;
  appId: string;
  sourceType: string;
  sourceId: string;
  planId: string | null;
  validFrom: Date;
  validUntil: Date | null;
}

@Injectable()
export class EntitlementService {
  private readonly logger = new Logger(EntitlementService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<any>,
  ) {}

  async grantFromSubscription(params: GrantFromSubscriptionParams): Promise<void> {
    const id = `ent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    try {
      await this.db
        .insert(premiumEntitlements)
        .values({
          id,
          userId: params.userId,
          appId: params.appId,
          sourceType: 'SUBSCRIPTION',
          sourceId: params.subscriptionId,
          planId: params.planId,
          isActive: true,
          validFrom: now,
          validUntil: null,
          revokedAt: null,
          revocationReason: null,
          metadata: {},
        })
        .onConflictDoUpdate({
          target: [premiumEntitlements.sourceType, premiumEntitlements.sourceId],
          set: {
            isActive: true,
            validUntil: null,
            revokedAt: null,
            revocationReason: null,
            updatedAt: now,
          },
        });

      this.logger.log(`Granted subscription entitlement | userId=${params.userId} | subscriptionId=${params.subscriptionId}`);
    } catch (error) {
      this.logger.error(
        `Failed to grant subscription entitlement: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async revokeFromSubscription(subscriptionId: string, reason: string): Promise<void> {
    const now = new Date();

    try {
      await this.db
        .update(premiumEntitlements)
        .set({
          isActive: false,
          validUntil: now,
          revokedAt: now,
          revocationReason: reason,
          updatedAt: now,
        })
        .where(
          and(
            eq(premiumEntitlements.sourceType, 'SUBSCRIPTION'),
            eq(premiumEntitlements.sourceId, subscriptionId),
          ),
        );

      this.logger.log(`Revoked subscription entitlement | subscriptionId=${subscriptionId} | reason=${reason}`);
    } catch (error) {
      this.logger.error(
        `Failed to revoke subscription entitlement: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async grantFromOrder(params: GrantFromOrderParams): Promise<void> {
    const id = `ent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    const validUntil = new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000);

    try {
      await this.db
        .insert(premiumEntitlements)
        .values({
          id,
          userId: params.userId,
          appId: params.appId,
          sourceType: 'ONE_TIME_ORDER',
          sourceId: params.orderId,
          planId: params.planId,
          isActive: true,
          validFrom: now,
          validUntil,
          revokedAt: null,
          revocationReason: null,
          metadata: { durationDays: params.durationDays },
        })
        .onConflictDoUpdate({
          target: [premiumEntitlements.sourceType, premiumEntitlements.sourceId],
          set: {
            isActive: true,
            validFrom: now,
            validUntil,
            revokedAt: null,
            revocationReason: null,
            updatedAt: now,
          },
        });

      this.logger.log(`Granted order entitlement | userId=${params.userId} | orderId=${params.orderId} | durationDays=${params.durationDays}`);
    } catch (error) {
      this.logger.error(
        `Failed to grant order entitlement: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async revokeFromOrder(orderId: string, reason: string): Promise<void> {
    const now = new Date();

    try {
      await this.db
        .update(premiumEntitlements)
        .set({
          isActive: false,
          revokedAt: now,
          revocationReason: reason,
          updatedAt: now,
        })
        .where(
          and(
            eq(premiumEntitlements.sourceType, 'ONE_TIME_ORDER'),
            eq(premiumEntitlements.sourceId, orderId),
          ),
        );

      this.logger.log(`Revoked order entitlement | orderId=${orderId} | reason=${reason}`);
    } catch (error) {
      this.logger.error(
        `Failed to revoke order entitlement: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async isUserPremium(userId: string, appId: string): Promise<boolean> {
    const now = new Date();

    const rows = await this.db
      .select({ id: premiumEntitlements.id })
      .from(premiumEntitlements)
      .where(
        and(
          eq(premiumEntitlements.userId, userId),
          eq(premiumEntitlements.appId, appId),
          eq(premiumEntitlements.isActive, true),
          or(
            isNull(premiumEntitlements.validUntil),
            gt(premiumEntitlements.validUntil, now),
          ),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  async getActiveEntitlement(userId: string, appId: string): Promise<ActiveEntitlement | null> {
    const now = new Date();

    const rows = await this.db
      .select({
        id: premiumEntitlements.id,
        userId: premiumEntitlements.userId,
        appId: premiumEntitlements.appId,
        sourceType: premiumEntitlements.sourceType,
        sourceId: premiumEntitlements.sourceId,
        planId: premiumEntitlements.planId,
        validFrom: premiumEntitlements.validFrom,
        validUntil: premiumEntitlements.validUntil,
      })
      .from(premiumEntitlements)
      .where(
        and(
          eq(premiumEntitlements.userId, userId),
          eq(premiumEntitlements.appId, appId),
          eq(premiumEntitlements.isActive, true),
          or(
            isNull(premiumEntitlements.validUntil),
            gt(premiumEntitlements.validUntil, now),
          ),
        ),
      )
      .limit(1);

    return rows.length > 0 ? rows[0] : null;
  }

  async getUserEntitlements(userId: string, appId: string): Promise<ActiveEntitlement[]> {
    const rows = await this.db
      .select({
        id: premiumEntitlements.id,
        userId: premiumEntitlements.userId,
        appId: premiumEntitlements.appId,
        sourceType: premiumEntitlements.sourceType,
        sourceId: premiumEntitlements.sourceId,
        planId: premiumEntitlements.planId,
        validFrom: premiumEntitlements.validFrom,
        validUntil: premiumEntitlements.validUntil,
      })
      .from(premiumEntitlements)
      .where(
        and(
          eq(premiumEntitlements.userId, userId),
          eq(premiumEntitlements.appId, appId),
        ),
      );

    return rows;
  }
}