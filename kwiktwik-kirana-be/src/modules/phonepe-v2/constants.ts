/**
 * Dependency injection tokens for PhonePe V2 module
 */

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');
export const REDEMPTION_REPOSITORY = Symbol('REDEMPTION_REPOSITORY');

export const SUBSCRIPTION_SETUP = 'SUBSCRIPTION_SETUP';

/**
 * Webhook action constants
 */
export const WEBHOOK_ACTIONS = {
  SUBSCRIPTION_EXPIRED_PAYMENT_FAILURE: 'subscription.expired.payment_failure',
} as const;
