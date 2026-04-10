/**
 * Order Repository Interface
 * 
 * Defines the contract for order persistence.
 */

import type { Order } from '../../domain/entities/order.entity';

/**
 * Repository interface for Order entities
 */
export interface IOrderRepository {
  /**
   * Find order by ID
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Find order by merchant order ID
   */
  findByMerchantId(merchantOrderId: string): Promise<Order | null>;

  /**
   * Find order by provider order ID
   */
  findByProviderOrderId(
    provider: string,
    providerOrderId: string,
  ): Promise<Order | null>;

  /**
   * Find all orders for a user
   */
  findByUserId(userId: string): Promise<readonly Order[]>;

  /**
   * Find orders for a subscription
   */
  findBySubscriptionId(subscriptionId: string): Promise<readonly Order[]>;

  /**
   * Find orders by app ID
   */
  findByAppId(appId: string): Promise<readonly Order[]>;

  /**
   * Find pending orders
   */
  findPending(): Promise<readonly Order[]>;

  /**
   * Find orders needing capture
   */
  findNeedingCapture(): Promise<readonly Order[]>;

  /**
   * Save order (create or update)
   */
  save(order: Order): Promise<Order>;

  /**
   * Delete order
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if order exists
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Order filter criteria
 */
export interface OrderFilter {
  readonly userId?: string;
  readonly appId?: string;
  readonly subscriptionId?: string;
  readonly provider?: string;
  readonly orderType?: string;
  readonly status?: string | readonly string[];
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
}
