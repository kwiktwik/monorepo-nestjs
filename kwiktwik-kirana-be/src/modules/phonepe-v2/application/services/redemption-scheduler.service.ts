import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  SUBSCRIPTION_REPOSITORY,
  REDEMPTION_REPOSITORY,
} from '../../constants';
import type {
  SubscriptionRepository,
  RedemptionRepository,
} from '../interfaces/repository.interface';
import { SubscriptionService } from './subscription.service';
import { PhonePeHttpClient } from '../../infrastructure/http/phonepe-http.client';
import { PAYWALL_PLANS } from '../../../config/config.data';

const MAX_RETRY_COUNT = 3;
const RETRY_DAYS_OLD = 3;

@Injectable()
export class RedemptionSchedulerService {
  private readonly logger = new Logger(RedemptionSchedulerService.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: SubscriptionRepository,
    @Inject(REDEMPTION_REPOSITORY)
    private readonly redemptionRepo: RedemptionRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly httpClient: PhonePeHttpClient,
  ) {}

  @Cron('0 1 * * *')
  async processDueRedemptions() {
    this.logger.log('Starting redemption processing cron job');

    try {
      const now = new Date();

      const dueSubscriptions =
        await this.subscriptionRepo.findDueForRedemptionWithLock(now, 100);
      this.logger.log(
        `Found ${dueSubscriptions.length} subscriptions due for redemption (locked for processing)`,
      );

      for (const subscription of dueSubscriptions) {
        await this.processRedemption(subscription);
      }

      const failedRedemptions =
        await this.subscriptionRepo.findFailedRedemptionsRetryable(
          MAX_RETRY_COUNT,
          RETRY_DAYS_OLD,
        );
      this.logger.log(
        `Found ${failedRedemptions.length} failed redemptions to retry`,
      );

      for (const subscription of failedRedemptions) {
        await this.processRedemption(subscription);
      }

      this.logger.log('Redemption processing cron job completed');
    } catch (error) {
      this.logger.error('Error in redemption processing cron job', error);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async processStuckActivations() {
    this.logger.log('Starting stuck activations processing cron job');
    try {
      const stuckSubscriptions =
        await this.subscriptionRepo.findStuckActivations(30);
      this.logger.log(
        `Found ${stuckSubscriptions.length} subscriptions stuck in activation`,
      );

      for (const subscription of stuckSubscriptions) {
        try {
          const status = await this.httpClient.getSubscriptionStatus(
            subscription.appId,
            subscription.merchantSubscriptionId,
          );

          if (status.state === 'ACTIVE') {
            subscription.activate(status.subscriptionId);
            await this.subscriptionRepo.update(subscription);
            this.logger.log(
              `Subscription ${subscription.merchantSubscriptionId} successfully activated from fallback poll`,
            );

            // Schedule first redemption
            await this.scheduleFirstRedemption(subscription);
          } else if (
            status.state === 'FAILED' ||
            status.state === 'CANCELLED'
          ) {
            subscription.markAsFailed();
            await this.subscriptionRepo.update(subscription);
            this.logger.log(
              `Subscription ${subscription.merchantSubscriptionId} failed from fallback poll`,
            );
          }
        } catch (subErr) {
          this.logger.error(
            `Failed to sync status for stuck subscription ${subscription.merchantSubscriptionId}`,
            subErr,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in stuck activations cron job', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processStuckRedemptions() {
    this.logger.log('Starting stuck redemptions processing cron job');
    try {
      const stuckRedemptions =
        await this.redemptionRepo.findStuckRedemptions(2);
      this.logger.log(
        `Found ${stuckRedemptions.length} stuck redemptions to verify`,
      );

      for (const redemption of stuckRedemptions) {
        try {
          const status = await this.httpClient.getOrderStatus(
            redemption.appId,
            redemption.merchantOrderId,
            true,
          );

          if (status.state === 'COMPLETED') {
            const transactionId =
              status.paymentDetails?.[0]?.transactionId || status.orderId;
            redemption.complete(transactionId);
            await this.redemptionRepo.update(redemption);
            this.logger.log(
              `Redemption ${redemption.merchantOrderId} completed from fallback poll`,
            );
          } else if (status.state === 'FAILED') {
            const errorCode =
              status.paymentDetails?.[0]?.errorCode || 'POLL_FAILED';
            redemption.fail(
              errorCode,
              'Failed during fallback poll verification',
            );
            await this.redemptionRepo.update(redemption);
            this.logger.log(
              `Redemption ${redemption.merchantOrderId} failed from fallback poll`,
            );
          }
        } catch (redErr) {
          this.logger.error(
            `Failed to sync status for stuck redemption ${redemption.merchantOrderId}`,
            redErr,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in stuck redemptions cron job', error);
    }
  }

  async scheduleFirstRedemption(subscription: any) {
    this.logger.log(
      `Scheduling first redemption for subscription: ${subscription.merchantSubscriptionId}`,
    );

    try {
      const amount = this.getPlanAmount(
        subscription.metadata?.planName as string,
      );

      await this.subscriptionService.notifyRedemption({
        userId: subscription.userId,
        appId: subscription.appId,
        merchantSubscriptionId: subscription.merchantSubscriptionId,
        amount: amount,
        metadata: {
          billingCycleCount: 1,
          firstRedemption: true,
        },
      });

      subscription.nextBillingDate = this.calculateNextBillingDate(
        subscription.frequency,
      );
      subscription.billingCycleCount = 1;
      subscription.metadata = {
        ...subscription.metadata,
        lastRedemptionDate: new Date().toISOString(),
        lastRedemptionStatus: 'pending',
        retryCount: 0,
      };

      await this.subscriptionRepo.update(subscription);

      this.logger.log(
        `First redemption scheduled for subscription: ${subscription.merchantSubscriptionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to schedule first redemption for ${subscription.merchantSubscriptionId}`,
        error,
      );

      subscription.metadata = {
        ...subscription.metadata,
        lastRedemptionDate: new Date().toISOString(),
        lastRedemptionStatus: 'failed',
        retryCount: 1,
      };

      await this.subscriptionRepo.update(subscription);
    }
  }

  private async processRedemption(subscription: any) {
    this.logger.log(
      `Processing redemption for subscription: ${subscription.merchantSubscriptionId}`,
    );

    try {
      const amount = this.getPlanAmount(
        subscription.metadata?.planName as string,
      );

      const response = await this.subscriptionService.notifyRedemption({
        userId: subscription.userId,
        appId: subscription.appId,
        merchantSubscriptionId: subscription.merchantSubscriptionId,
        amount: amount,
        metadata: {
          billingCycleCount: subscription.billingCycleCount + 1,
          // Don't schedule next billing yet - wait for payment success
          expectedBillingDate: this.calculateNextBillingDate(
            subscription.frequency,
          ).toISOString(),
        },
      });

      // Don't update nextBillingDate yet - wait for webhook confirmation
      // This prevents scheduling next billing if current payment fails
      subscription.billingCycleCount =
        (subscription.billingCycleCount || 0) + 1;
      subscription.metadata = {
        ...subscription.metadata,
        lastRedemptionDate: new Date().toISOString(),
        lastRedemptionStatus: 'pending',
        lastRedemptionOrderId: response.orderId,
        retryCount: 0,
      };

      await this.subscriptionRepo.update(subscription);

      this.logger.log(
        `Redemption notified successfully for: ${subscription.merchantSubscriptionId}, orderId: ${response.orderId}. ` +
          `Next billing will be scheduled only after payment success.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process redemption for ${subscription.merchantSubscriptionId}`,
        error,
      );

      const retryCount =
        ((subscription.metadata?.retryCount as number) || 0) + 1;

      subscription.metadata = {
        ...subscription.metadata,
        lastRedemptionDate: new Date().toISOString(),
        lastRedemptionStatus: 'failed',
        lastRedemptionError: error.message,
        retryCount: retryCount,
      };

      await this.subscriptionRepo.update(subscription);

      if (retryCount >= MAX_RETRY_COUNT) {
        this.logger.warn(
          `Max retries (${MAX_RETRY_COUNT}) reached for subscription: ${subscription.merchantSubscriptionId}`,
        );
      }
    }
  }

  private getPlanAmount(planName?: string): number {
    // `planName` is the PAYWALL_PLANS object key (e.g. 'PHONEPE_AUTOPAY'),
    // NOT the plan_id value (e.g. 'plan_PHONEPE_AUTOPAY_001').
    // Both are stored in subscription.metadata — use planName for the lookup.
    const planConfig = planName
      ? PAYWALL_PLANS[planName as keyof typeof PAYWALL_PLANS]
      : PAYWALL_PLANS.PHONEPE_AUTOPAY;

    if (!planConfig) {
      this.logger.warn(
        `Plan not found for planName="${planName}", falling back to PHONEPE_AUTOPAY`,
      );
      return (PAYWALL_PLANS.PHONEPE_AUTOPAY as any)?.pricing?.recurringAmount
        ? parseInt(
            (
              PAYWALL_PLANS.PHONEPE_AUTOPAY as any
            ).pricing.recurringAmount.replace(/[^0-9]/g, ''),
            10,
          ) || 199
        : 199;
    }

    const pricing = (planConfig as any).pricing;
    if (!pricing?.recurringAmount) {
      this.logger.warn(
        `Plan "${planName}" has no recurringAmount, defaulting to 199`,
      );
      return 199;
    }

    const amountStr = pricing.recurringAmount.replace(/[^0-9]/g, '');
    return parseInt(amountStr, 10) || 199;
  }

  private calculateNextBillingDate(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'DAILY':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'WEEKLY':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'FORTNIGHTLY':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      case 'MONTHLY':
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'QUARTERLY':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      case 'HALFYEARLY':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      case 'YEARLY':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
  }
}
