import { Subscription } from '../../domain/entities/subscription.entity';
import { Redemption } from '../../domain/entities/redemption.entity';

/**
 * Repository interface for Subscription aggregate
 */
export interface SubscriptionRepository {
  /**
   * Save a new subscription
   */
  create(subscription: Subscription): Promise<Subscription>;

  /**
   * Find subscription by ID
   */
  findById(id: string): Promise<Subscription | null>;

  /**
   * Find subscription by merchant subscription ID
   */
  findByMerchantSubscriptionId(
    merchantSubscriptionId: string,
  ): Promise<Subscription | null>;

  /**
   * Find all subscriptions for a user
   */
  findByUserId(userId: string, appId: string): Promise<Subscription[]>;

  /**
   * Find all active subscriptions
   */
  findActive(appId: string): Promise<Subscription[]>;

  /**
   * Update subscription state
   */
  update(subscription: Subscription): Promise<Subscription>;

  /**
   * Check if merchant subscription ID exists
   */
  existsByMerchantSubscriptionId(
    merchantSubscriptionId: string,
  ): Promise<boolean>;

  /**
   * Find subscriptions due for redemption (nextBillingDate <= now)
   */
  findDueForRedemption(beforeDate: Date): Promise<Subscription[]>;

  /**
   * Find subscriptions due for redemption and lock them for processing
   */
  findDueForRedemptionWithLock(
    beforeDate: Date,
    limit: number,
  ): Promise<Subscription[]>;

  /**
   * Find subscriptions with failed redemptions that can be retried
   */
  findFailedRedemptionsRetryable(
    maxRetries: number,
    daysOld: number,
  ): Promise<Subscription[]>;

  /**
   * Find subscriptions stuck in activation
   */
  findStuckActivations(minutesOld: number): Promise<Subscription[]>;
}

/**
 * Repository interface for Redemption aggregate
 */
export interface RedemptionRepository {
  /**
   * Save a new redemption
   */
  create(redemption: Redemption): Promise<Redemption>;

  /**
   * Find redemption by ID
   */
  findById(id: string): Promise<Redemption | null>;

  /**
   * Find redemption by merchant order ID
   */
  findByMerchantOrderId(merchantOrderId: string): Promise<Redemption | null>;

  /**
   * Find all redemptions for a subscription
   */
  findBySubscriptionId(subscriptionId: string): Promise<Redemption[]>;

  /**
   * Find active redemption for a subscription
   */
  findActiveBySubscriptionId(
    subscriptionId: string,
  ): Promise<Redemption | null>;

  /**
   * Update redemption
   */
  update(redemption: Redemption): Promise<Redemption>;

  /**
   * Get redemptions pending notification (for monitoring)
   */
  findPendingNotifications(limit: number): Promise<Redemption[]>;

  /**
   * Get stuck redemptions (for monitoring)
   */
  findStuckRedemptions(hoursOld: number): Promise<Redemption[]>;
}
