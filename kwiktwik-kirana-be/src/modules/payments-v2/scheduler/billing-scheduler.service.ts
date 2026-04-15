/**
 * Billing Scheduler Service
 * 
 * Handles scheduled billing for user-managed subscriptions.
 * Uses @nestjs/schedule for cron-based scheduling.
 * 
 * Responsibilities:
 * - Process subscriptions that need billing
 * - Charge user-managed subscriptions
 * - Handle retry logic with exponential backoff
 * - Track billing attempts and failures
 * - Update subscription status based on billing results
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject } from '@nestjs/common';
import { SubscriptionManagerService } from '../services/subscription-manager.service';
import { SubscriptionStateMachineService } from '../services/subscription-state-machine.service';
import type { ISubscriptionRepository } from '../infrastructure/repositories/subscription.repository.interface';
import type { Subscription } from '../domain/entities/subscription.entity';
import { SubscriptionStatus, StateMachineEvent } from '../types/subscription-status.enum';
import { SubscriptionType } from '../types/subscription-type.enum';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Billing scheduler configuration
 */
export interface BillingSchedulerConfig {
  /** Enable/disable the scheduler */
  readonly enabled: boolean;
  /** Maximum concurrent billing operations */
  readonly maxConcurrency: number;
  /** Batch size for processing subscriptions */
  readonly batchSize: number;
  /** Maximum retry attempts for failed charges */
  readonly maxRetryAttempts: number;
  /** Base delay in minutes for retry backoff */
  readonly retryBaseDelayMinutes: number;
  /** Grace period in days before cancelling failed subscriptions */
  readonly gracePeriodDays: number;
}

/**
 * Default scheduler configuration
 */
const DEFAULT_CONFIG: BillingSchedulerConfig = {
  enabled: true,
  maxConcurrency: 5,
  batchSize: 50,
  maxRetryAttempts: 3,
  retryBaseDelayMinutes: 60,
  gracePeriodDays: 7,
};

// ============================================================================
// Billing Result Types
// ============================================================================

/**
 * Result of processing a single subscription
 */
export interface BillingProcessResult {
  readonly subscriptionId: string;
  readonly success: boolean;
  readonly orderId?: string;
  readonly transactionId?: string;
  readonly error?: string;
  readonly nextBillingDate?: Date;
}

/**
 * Result of a billing batch run
 */
export interface BillingBatchResult {
  readonly processed: number;
  readonly successful: number;
  readonly failed: number;
  readonly skipped: number;
  readonly results: readonly BillingProcessResult[];
  readonly durationMs: number;
}

// ============================================================================
// Billing Scheduler Service
// ============================================================================

/**
 * Billing Scheduler Service
 * 
 * Runs scheduled jobs to process subscriptions that need billing.
 * Primarily handles USER_MANAGED subscriptions where we control the billing cycle.
 */
@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);
  private readonly config: BillingSchedulerConfig;
  private isRunning = false;
  private lastRunAt: Date | null = null;
  private lastRunResult: BillingBatchResult | null = null;

  constructor(
    private readonly subscriptionManager: SubscriptionManagerService,
    private readonly stateMachine: SubscriptionStateMachineService,
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {
    this.config = this.loadConfig();
    this.logger.log(`Billing scheduler initialized (enabled: ${this.config.enabled})`);
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    enabled: boolean;
    isRunning: boolean;
    lastRunAt: Date | null;
    lastRunResult: BillingBatchResult | null;
  } {
    return {
      enabled: this.config.enabled,
      isRunning: this.isRunning,
      lastRunAt: this.lastRunAt,
      lastRunResult: this.lastRunResult,
    };
  }

  /**
   * Main billing cron job
   * Runs every hour to process subscriptions that need billing
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'processBilling',
    timeZone: 'Asia/Kolkata',
  })
  async processBillingCron(): Promise<BillingBatchResult> {
    if (!this.config.enabled) {
      this.logger.debug('Billing scheduler is disabled, skipping');
      return this.createEmptyResult();
    }

    if (this.isRunning) {
      this.logger.warn('Billing job already running, skipping');
      return this.createEmptyResult();
    }

    return this.executeBillingRun();
  }

  /**
   * Manual trigger for billing (for testing/admin use)
   */
  async triggerBillingRun(): Promise<BillingBatchResult> {
    if (this.isRunning) {
      this.logger.warn('Billing job already running, skipping manual trigger');
      return this.createEmptyResult();
    }
    this.logger.log('Manual billing run triggered');
    return this.executeBillingRun();
  }

  /**
   * Execute a billing run
   */
  private async executeBillingRun(): Promise<BillingBatchResult> {
    const startTime = Date.now();
    this.isRunning = true;
    this.lastRunAt = new Date();

    const results: BillingProcessResult[] = [];
    let processed = 0;
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    try {
      this.logger.log('Starting billing run');

      // Get subscriptions that need billing
      const subscriptions = await this.subscriptionRepo.findNeedingBilling();
      this.logger.log(`Found ${subscriptions.length} subscriptions needing billing`);

      // Process in batches
      for (let i = 0; i < subscriptions.length; i += this.config.batchSize) {
        const batch = subscriptions.slice(i, i + this.config.batchSize);
        const batchResults = await this.processBatch(batch);
        
        for (const result of batchResults) {
          results.push(result);
          processed++;
          if (result.success) {
            successful++;
          } else if (result.error?.startsWith('Skipped')) {
            skipped++;
          } else {
            failed++;
          }
        }

        // Log progress
        this.logger.debug(
          `Processed batch ${Math.floor(i / this.config.batchSize) + 1}: ` +
          `${processed}/${subscriptions.length} subscriptions`,
        );
      }

      const durationMs = Date.now() - startTime;
      this.lastRunResult = { processed, successful, failed, skipped, results, durationMs };

      this.logger.log(
        `Billing run completed: ${processed} processed, ` +
        `${successful} successful, ${failed} failed, ${skipped} skipped ` +
        `in ${durationMs}ms`,
      );

      return this.lastRunResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Billing run failed: ${errorMessage}`);
      
      const durationMs = Date.now() - startTime;
      return {
        processed,
        successful,
        failed,
        skipped,
        results,
        durationMs,
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process a batch of subscriptions
   */
  private async processBatch(subscriptions: readonly Subscription[]): Promise<BillingProcessResult[]> {
    const results: BillingProcessResult[] = [];

    // Process with concurrency limit
    const chunks = this.chunkArray(subscriptions, this.config.maxConcurrency);
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(sub => this.processSubscription(sub)),
      );
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * Process a single subscription
   */
  private async processSubscription(subscription: Subscription): Promise<BillingProcessResult> {
    try {
      // Skip if not a user-managed subscription
      if (subscription.subscriptionType !== SubscriptionType.USER_MANAGED) {
        return {
          subscriptionId: subscription.id,
          success: false,
          error: 'Skipped',
        };
      }

      // Check if subscription is in a billable state
      if (!this.isBillable(subscription)) {
        return {
          subscriptionId: subscription.id,
          success: false,
          error: 'Skipped',
        };
      }

      // Check if subscription has completed all billing cycles
      if (this.hasCompletedAllCycles(subscription)) {
        await this.handleCompletedSubscription(subscription);
        return {
          subscriptionId: subscription.id,
          success: false,
          error: 'Skipped - all cycles completed',
        };
      }

      // Check retry limits
      if (this.hasExceededRetryLimit(subscription)) {
        await this.handleFailedSubscription(subscription);
        return {
          subscriptionId: subscription.id,
          success: false,
          error: 'Exceeded retry limit',
        };
      }

      // Check if we're in a retry backoff period
      if (this.isInRetryBackoff(subscription)) {
        return {
          subscriptionId: subscription.id,
          success: false,
          error: 'Skipped - in retry backoff',
        };
      }

      // Attempt to charge
      this.logger.debug(`Charging subscription ${subscription.id}`);
      
      const chargeResult = await this.subscriptionManager.chargeSubscription({
        subscriptionId: subscription.id,
        amount: subscription.pricing.recurringAmount,
      });

      if (chargeResult.success) {
        this.logger.log(
          `Successfully charged subscription ${subscription.id}: ` +
          `order ${chargeResult.order?.id}`,
        );
        
        return {
          subscriptionId: subscription.id,
          success: true,
          orderId: chargeResult.order?.id,
          transactionId: chargeResult.transactionId ?? undefined,
          nextBillingDate: subscription.nextBillingDate ?? undefined,
        };
      } else {
        this.logger.warn(
          `Failed to charge subscription ${subscription.id}: ${chargeResult.error}`,
        );
        
        return {
          subscriptionId: subscription.id,
          success: false,
          error: chargeResult.error ?? 'Unknown error',
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing subscription ${subscription.id}: ${errorMessage}`);
      
      return {
        subscriptionId: subscription.id,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if subscription is in a billable state
   */
  private isBillable(subscription: Subscription): boolean {
    return (
      subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.RETRYING
    );
  }

  /**
   * Check if subscription has exceeded retry limit
   */
  private hasExceededRetryLimit(subscription: Subscription): boolean {
    return subscription.consecutiveFailures >= this.config.maxRetryAttempts;
  }

  /**
   * Check if subscription has completed all billing cycles
   */
  private hasCompletedAllCycles(subscription: Subscription): boolean {
    const totalCycles = subscription.pricing.totalCycles;
    
    // If totalCycles is null or undefined, subscription runs indefinitely
    if (totalCycles === null || totalCycles === undefined) {
      return false;
    }
    
    return subscription.billingCycleCount >= totalCycles;
  }

  /**
   * Check if subscription is in retry backoff period
   */
  private isInRetryBackoff(subscription: Subscription): boolean {
    if (!subscription.retryConfig?.nextRetryAt) {
      return false;
    }
    
    return new Date(subscription.retryConfig.nextRetryAt) > new Date();
  }

  /**
   * Handle a subscription that has failed too many times
   * Transitions the subscription to FAILED status and persists to database
   */
  private async handleFailedSubscription(subscription: Subscription): Promise<void> {
    this.logger.warn(
      `Subscription ${subscription.id} has exceeded retry limit ` +
      `(${subscription.consecutiveFailures} failures), marking as FAILED`,
    );

    try {
      // Use state machine to transition to FAILED status
      const result = await this.stateMachine.transition(
        subscription,
        StateMachineEvent.PAYMENT_FAILED_PERMANENTLY,
        {
          reason: 'Exceeded maximum retry attempts',
          consecutiveFailures: subscription.consecutiveFailures,
          lastFailureAt: new Date().toISOString(),
        },
      );

      if (result.success) {
        // Persist the updated subscription to database
        await this.subscriptionRepo.save(result.subscription);
        this.logger.log(
          `Subscription ${subscription.id} transitioned to FAILED status and saved`,
        );
      } else {
        this.logger.error(
          `Failed to transition subscription ${subscription.id} to FAILED: ${result.error}`,
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error handling failed subscription ${subscription.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Handle a subscription that has completed all billing cycles
   * Transitions the subscription to COMPLETED status and persists to database
   */
  private async handleCompletedSubscription(subscription: Subscription): Promise<void> {
    this.logger.log(
      `Subscription ${subscription.id} has completed all billing cycles ` +
      `(${subscription.billingCycleCount}/${subscription.pricing.totalCycles}), marking as COMPLETED`,
    );

    try {
      // Use state machine to transition to COMPLETED status
      const result = await this.stateMachine.transition(
        subscription,
        StateMachineEvent.ALL_CYCLES_COMPLETED,
        {
          completedAt: new Date().toISOString(),
          totalCycles: subscription.pricing.totalCycles,
          billingCycleCount: subscription.billingCycleCount,
        },
      );

      if (result.success) {
        // Persist the updated subscription to database
        await this.subscriptionRepo.save(result.subscription);
        this.logger.log(
          `Subscription ${subscription.id} transitioned to COMPLETED status and saved`,
        );
      } else {
        this.logger.error(
          `Failed to transition subscription ${subscription.id} to COMPLETED: ${result.error}`,
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error handling completed subscription ${subscription.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Load configuration from environment
   */
  private loadConfig(): BillingSchedulerConfig {
    return {
      enabled: process.env.PAYMENT_BILLING_SCHEDULER_ENABLED !== 'false',
      maxConcurrency: parseInt(process.env.PAYMENT_BILLING_MAX_CONCURRENCY ?? '5', 10),
      batchSize: parseInt(process.env.PAYMENT_BILLING_BATCH_SIZE ?? '50', 10),
      maxRetryAttempts: parseInt(process.env.PAYMENT_BILLING_MAX_RETRIES ?? '3', 10),
      retryBaseDelayMinutes: parseInt(process.env.PAYMENT_BILLING_RETRY_DELAY ?? '60', 10),
      gracePeriodDays: parseInt(process.env.PAYMENT_BILLING_GRACE_PERIOD ?? '7', 10),
    };
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: readonly T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size) as T[]);
    }
    return chunks;
  }

  /**
   * Create an empty result
   */
  private createEmptyResult(): BillingBatchResult {
    return {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      results: [],
      durationMs: 0,
    };
  }
}
