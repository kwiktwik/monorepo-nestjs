/**
 * Subscription Repository Interface
 * 
 * Defines the contract for subscription persistence.
 */

import type { Subscription } from '../../domain/entities/subscription.entity';

/**
 * Repository interface for Subscription entities
 */
export interface ISubscriptionRepository {
  /**
   * Find subscription by ID
   */
  findById(id: string): Promise<Subscription | null>;

  /**
   * Find subscription by merchant subscription ID
   */
  findByMerchantId(merchantSubscriptionId: string): Promise<Subscription | null>;

  /**
   * Find subscription by provider subscription ID
   */
  findByProviderSubscriptionId(
    provider: string,
    providerSubscriptionId: string,
  ): Promise<Subscription | null>;

  /**
   * Find all subscriptions for a user
   */
  findByUserId(userId: string): Promise<readonly Subscription[]>;

  /**
   * Find all active subscriptions for a user
   */
  findActiveByUserId(userId: string): Promise<readonly Subscription[]>;

  /**
   * Find subscriptions by app ID
   */
  findByAppId(appId: string): Promise<readonly Subscription[]>;

  /**
   * Find subscriptions that need billing (for user-managed)
   */
  findNeedingBilling(): Promise<readonly Subscription[]>;

  /**
   * Find subscriptions in retry state
   */
  findInRetry(): Promise<readonly Subscription[]>;

  /**
   * Save subscription (create or update)
   */
  save(subscription: Subscription): Promise<Subscription>;

  /**
   * Delete subscription
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if subscription exists
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Query options for subscription queries
 */
export interface SubscriptionQueryOptions {
  readonly limit?: number;
  readonly offset?: number;
  readonly orderBy?: 'createdAt' | 'updatedAt';
  readonly orderDirection?: 'asc' | 'desc';
}

/**
 * Subscription filter criteria
 */
export interface SubscriptionFilter {
  readonly userId?: string;
  readonly appId?: string;
  readonly provider?: string;
  readonly subscriptionType?: string;
  readonly status?: string | readonly string[];
  readonly isPremium?: boolean;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
}
