/**
 * Drizzle Order Repository
 * 
 * Implements IOrderRepository using Drizzle ORM.
 * Provides persistent storage for orders in PostgreSQL.
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { eq, and, inArray, desc, lte } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  Order,
  createOrder,
  type ProviderOrderData,
  type OrderMetadata,
} from '../../domain/entities/order.entity';
import type { IOrderRepository } from '../../infrastructure/repositories/order.repository.interface';
import type { OrderStatus } from '../../types/order-status.enum';
import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { PaymentMethodType } from '../../types/payment-method.types';
import {
  ordersV2,
  type OrderV2,
  type NewOrderV2,
} from '../../database/schema';
import { DRIZZLE_TOKEN } from '../../../../database/drizzle.module';
import * as schema from '../../../../database/schema';

/**
 * Drizzle-based order repository
 */
@Injectable()
export class DrizzleOrderRepository implements IOrderRepository {
  private readonly logger = new Logger(DrizzleOrderRepository.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Find order by ID
   */
  async findById(id: string): Promise<Order | null> {
    try {
      const rows = await this.db
        .select()
        .from(ordersV2)
        .where(eq(ordersV2.id, id))
        .limit(1);

      return rows.length > 0 ? this.toDomain(rows[0]) : null;
    } catch (error) {
      this.logger.error(`Failed to find order by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find order by merchant order ID
   */
  async findByMerchantId(merchantOrderId: string): Promise<Order | null> {
    try {
      const rows = await this.db
        .select()
        .from(ordersV2)
        .where(eq(ordersV2.merchantOrderId, merchantOrderId))
        .limit(1);

      return rows.length > 0 ? this.toDomain(rows[0]) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find order by merchant ID: ${merchantOrderId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Find order by provider order ID
   */
  async findByProviderOrderId(
    provider: string,
    providerOrderId: string,
  ): Promise<Order | null> {
    try {
      const rows = await this.db
        .select()
        .from(ordersV2)
        .where(
          and(
            eq(ordersV2.provider, provider as PaymentProvider),
          ),
        );

      // Filter in memory for JSONB field
      const filtered = rows.filter(
        (row) => row.providerData?.orderId === providerOrderId,
      );

      return filtered.length > 0 ? this.toDomain(filtered[0]) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find order by provider order ID: ${provider}/${providerOrderId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Find all orders for a user
   */
  async findByUserId(userId: string): Promise<readonly Order[]> {
    try {
      const rows = await this.db
        .select()
        .from(ordersV2)
        .where(eq(ordersV2.userId, userId))
        .orderBy(desc(ordersV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find orders for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Find orders by subscription ID
   */
  async findBySubscriptionId(subscriptionId: string): Promise<readonly Order[]> {
    try {
      const rows = await this.db
        .select()
        .from(ordersV2)
        .where(eq(ordersV2.subscriptionId, subscriptionId))
        .orderBy(desc(ordersV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find orders for subscription: ${subscriptionId}`, error);
      throw error;
    }
  }

  /**
   * Find orders by status
   */
  async findByStatus(
    status: OrderStatus | OrderStatus[],
    limit?: number,
  ): Promise<readonly Order[]> {
    try {
      const statuses = Array.isArray(status) ? status : [status];

      let query = this.db
        .select()
        .from(ordersV2)
        .where(inArray(ordersV2.status, statuses))
        .orderBy(desc(ordersV2.createdAt));

      if (limit) {
        query = query.limit(limit) as typeof query;
      }

      const rows = await query;
      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find orders by status`, error);
      throw error;
    }
  }

  /**
   * Find orders that are expired
   */
  async findExpired(): Promise<readonly Order[]> {
    try {
      const now = new Date();

      const rows = await this.db
        .select()
        .from(ordersV2)
        .where(
          and(
            eq(ordersV2.status, 'CREATED'),
            lte(ordersV2.expiresAt, now),
          ),
        );

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error('Failed to find expired orders', error);
      throw error;
    }
  }

  /**
   * Find pending orders
   */
  async findPending(): Promise<readonly Order[]> {
    try {
      const rows = await this.db
        .select()
        .from(ordersV2)
        .where(eq(ordersV2.status, 'PENDING'))
        .orderBy(desc(ordersV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error('Failed to find pending orders', error);
      throw error;
    }
  }

  /**
   * Find orders needing capture
   */
  async findNeedingCapture(): Promise<readonly Order[]> {
    try {
      const rows = await this.db
        .select()
        .from(ordersV2)
        .where(eq(ordersV2.status, 'AUTHORIZED'))
        .orderBy(desc(ordersV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error('Failed to find orders needing capture', error);
      throw error;
    }
  }

  /**
   * Find orders by app ID
   */
  async findByAppId(appId: string): Promise<readonly Order[]> {
    try {
      const rows = await this.db
        .select()
        .from(ordersV2)
        .where(eq(ordersV2.appId, appId))
        .orderBy(desc(ordersV2.createdAt));

      return rows.map((row) => this.toDomain(row));
    } catch (error) {
      this.logger.error(`Failed to find orders for app: ${appId}`, error);
      throw error;
    }
  }

  /**
   * Save order (create or update)
   */
  async save(order: Order): Promise<Order> {
    try {
      const existing = await this.findById(order.id);

      if (existing) {
        // Update existing order
        const updateData = this.toUpdateData(order);
        await this.db
          .update(ordersV2)
          .set(updateData)
          .where(eq(ordersV2.id, order.id));

        return order;
      } else {
        // Create new order
        const insertData = this.toInsertData(order);
        await this.db.insert(ordersV2).values(insertData);

        return order;
      }
    } catch (error) {
      this.logger.error(`Failed to save order: ${order.id}`, error);
      throw error;
    }
  }

  /**
   * Delete order
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(ordersV2)
        .where(eq(ordersV2.id, id))
        .returning({ id: ordersV2.id });

      return result.length > 0;
    } catch (error) {
      this.logger.error(`Failed to delete order: ${id}`, error);
      throw error;
    }
  }

  /**
   * Check if order exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const rows = await this.db
        .select({ id: ordersV2.id })
        .from(ordersV2)
        .where(eq(ordersV2.id, id))
        .limit(1);

      return rows.length > 0;
    } catch (error) {
      this.logger.error(`Failed to check order existence: ${id}`, error);
      throw error;
    }
  }

  /**
   * Count orders by status
   */
  async countByStatus(status: OrderStatus): Promise<number> {
    try {
      const rows = await this.db
        .select({ id: ordersV2.id })
        .from(ordersV2)
        .where(eq(ordersV2.status, status));

      return rows.length;
    } catch (error) {
      this.logger.error(`Failed to count orders by status: ${status}`, error);
      throw error;
    }
  }

  // ============================================================================
  // Mapping Methods
  // ============================================================================

  /**
   * Convert database row to domain entity
   */
  private toDomain(row: OrderV2): Order {
    const providerData: ProviderOrderData = {
      orderId: row.providerData.orderId,
      paymentId: row.providerData.paymentId,
      refundId: row.providerData.refundId,
      tokenId: row.providerData.tokenId,
      transactionId: row.providerData.transactionId,
      raw: row.providerData.raw,
      intentUrl: row.providerData.intentUrl,
    };

    const metadata: OrderMetadata = {
      environment: row.metadata.environment as 'SANDBOX' | 'PRODUCTION',
      configId: row.metadata.configId,
      description: row.metadata.description,
      notes: row.metadata.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return {
      id: row.id,
      merchantOrderId: row.merchantOrderId,
      userId: row.userId,
      appId: row.appId,
      orderType: row.orderType as 'ONE_TIME' | 'SUBSCRIPTION_SETUP' | 'SUBSCRIPTION_RECURRING' | 'SUBSCRIPTION_RETRY',
      subscriptionType: row.subscriptionType as SubscriptionType,
      provider: row.provider as PaymentProvider,
      configId: row.configId,
      environment: row.environment as 'SANDBOX' | 'PRODUCTION',
      subscriptionId: row.subscriptionId,
      amount: row.amount,
      currency: row.currency,
      status: row.status as OrderStatus,
      paymentMethodType: row.paymentMethodType as PaymentMethodType | undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      paidAt: row.paidAt,
      refundedAt: row.refundedAt,
      expiresAt: row.expiresAt,
      providerData,
      metadata,
    };
  }

  /**
   * Convert domain entity to insert data
   */
  private toInsertData(order: Order): NewOrderV2 {
    return {
      id: order.id,
      merchantOrderId: order.merchantOrderId,
      userId: order.userId,
      appId: order.appId,
      orderType: order.orderType,
      subscriptionType: order.subscriptionType,
      provider: order.provider,
      configId: order.configId,
      environment: order.environment,
      subscriptionId: order.subscriptionId,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      paymentMethodType: order.paymentMethodType,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      refundedAt: order.refundedAt,
      expiresAt: order.expiresAt,
      providerData: {
        orderId: order.providerData.orderId,
        paymentId: order.providerData.paymentId,
        refundId: order.providerData.refundId,
        tokenId: order.providerData.tokenId,
        transactionId: order.providerData.transactionId,
        raw: order.providerData.raw,
        intentUrl: order.providerData.intentUrl,
      },
      metadata: {
        environment: order.metadata.environment,
        configId: order.metadata.configId,
        description: order.metadata.description,
        notes: order.metadata.notes,
      },
    };
  }

  /**
   * Convert domain entity to update data
   */
  private toUpdateData(order: Order): Partial<NewOrderV2> {
    return {
      status: order.status,
      paymentMethodType: order.paymentMethodType,
      updatedAt: new Date(),
      paidAt: order.paidAt,
      refundedAt: order.refundedAt,
      expiresAt: order.expiresAt,
      providerData: {
        orderId: order.providerData.orderId,
        paymentId: order.providerData.paymentId,
        refundId: order.providerData.refundId,
        tokenId: order.providerData.tokenId,
        transactionId: order.providerData.transactionId,
        raw: order.providerData.raw,
        intentUrl: order.providerData.intentUrl,
      },
      metadata: {
        environment: order.metadata.environment,
        configId: order.metadata.configId,
        description: order.metadata.description,
        notes: order.metadata.notes,
      },
    };
  }
}
