import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { Inject } from '@nestjs/common';
import {
  SUBSCRIPTION_REPOSITORY,
  REDEMPTION_REPOSITORY,
} from '../../constants';
import type {
  SubscriptionRepository,
  RedemptionRepository,
} from '../../application/interfaces/repository.interface';
import type { PhonePeWebhookEvent } from '../../domain/enums/subscription.enum';
import { WebhookPayloadSchema } from '../validation/schemas';

// Webhook payload types
interface SubscriptionSetupPayload {
  merchantId: string;
  merchantOrderId: string;
  orderId: string;
  state: 'COMPLETED' | 'FAILED';
  paymentFlow: {
    type: 'SUBSCRIPTION_CHECKOUT_SETUP';
    merchantSubscriptionId: string;
    subscriptionId?: string;
  };
  paymentDetails?: Array<{
    transactionId: string;
    state: string;
  }>;
  errorCode?: string;
  detailedErrorCode?: string;
}

interface SubscriptionStateChangePayload {
  merchantSubscriptionId: string;
  subscriptionId: string;
  state: string;
}

interface RedemptionPayload {
  merchantId: string;
  merchantOrderId: string;
  orderId: string;
  state: 'COMPLETED' | 'FAILED' | 'PENDING';
  paymentFlow: {
    type: 'SUBSCRIPTION_REDEMPTION';
    merchantSubscriptionId: string;
    notifiedAt?: number;
  };
  paymentDetails?: Array<{
    transactionId: string;
    state: string;
    errorCode?: string;
    detailedErrorCode?: string;
  }>;
  errorCode?: string;
  detailedErrorCode?: string;
}

interface WebhookBody {
  event: PhonePeWebhookEvent;
  payload:
    | SubscriptionSetupPayload
    | SubscriptionStateChangePayload
    | RedemptionPayload;
}

/**
 * Webhook controller for receiving PhonePe callbacks
 * Handles subscription setup, state changes, and redemption status
 */
@ApiTags('PhonePe Webhooks')
@Controller('webhooks/phonepe-v2')
export class PhonePeWebhookController {
  private readonly logger = new Logger(PhonePeWebhookController.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: SubscriptionRepository,
    @Inject(REDEMPTION_REPOSITORY)
    private readonly redemptionRepo: RedemptionRepository,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Receive PhonePe webhook events',
    description:
      'Endpoint for PhonePe to send subscription and redemption updates',
  })
  async handleWebhook(
    @Body() body: WebhookBody,
    @Headers('authorization') authHeader: string,
  ): Promise<{ received: boolean }> {
    // Validate webhook signature
    if (!this.validateWebhook(authHeader)) {
      this.logger.warn('Invalid webhook authorization');
      throw new UnauthorizedException('Invalid authorization');
    }

    // Validate webhook payload structure
    const validationResult = WebhookPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      this.logger.warn(
        `Invalid webhook payload: ${validationResult.error.message}`,
      );
      throw new BadRequestException('Invalid webhook payload structure');
    }

    this.logger.log(`Received webhook: ${body.event}`);

    try {
      switch (body.event) {
        // Setup callbacks
        case 'checkout.order.completed':
          await this.handleSetupCompleted(
            body.payload as SubscriptionSetupPayload,
          );
          break;
        case 'checkout.order.failed':
          await this.handleSetupFailed(
            body.payload as SubscriptionSetupPayload,
          );
          break;

        // State change callbacks
        case 'subscription.paused':
          await this.handleSubscriptionPaused(
            body.payload as SubscriptionStateChangePayload,
          );
          break;
        case 'subscription.unpaused':
          await this.handleSubscriptionUnpaused(
            body.payload as SubscriptionStateChangePayload,
          );
          break;
        case 'subscription.revoked':
          await this.handleSubscriptionRevoked(
            body.payload as SubscriptionStateChangePayload,
          );
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(
            body.payload as SubscriptionStateChangePayload,
          );
          break;

        // Notification callbacks
        case 'subscription.notification.completed':
          await this.handleNotificationCompleted(
            body.payload as RedemptionPayload,
          );
          break;
        case 'subscription.notification.failed':
          await this.handleNotificationFailed(
            body.payload as RedemptionPayload,
          );
          break;

        // Redemption callbacks (auto-debit results)
        case 'subscription.redemption.order.completed':
        case 'subscription.redemption.transaction.completed':
          await this.handleRedemptionCompleted(
            body.payload as RedemptionPayload,
          );
          break;
        case 'subscription.redemption.order.failed':
        case 'subscription.redemption.transaction.failed':
          await this.handleRedemptionFailed(body.payload as RedemptionPayload);
          break;

        default:
          this.logger.warn(`Unhandled webhook event: ${body.event}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(
        `Error processing webhook: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to process webhook: ${error.message}`,
      );
    }
  }

  private validateWebhook(authHeader: string): boolean {
    const expectedAuth = this.config.get<string>('PHONEPE_WEBHOOK_AUTH');
    if (!expectedAuth) {
      this.logger.warn('PHONEPE_WEBHOOK_AUTH not configured');
      return true; // Allow in development
    }

    if (!authHeader) return false;

    // Extract hash from Authorization header
    // Format: SHA256(username:password)
    const hash = authHeader.replace('SHA256 ', '');
    const expectedHash = createHash('sha256')
      .update(expectedAuth)
      .digest('hex');

    return hash === expectedHash;
  }

  private async handleSetupCompleted(payload: SubscriptionSetupPayload) {
    this.logger.log(
      `Processing checkout.order.completed for order: ${payload.orderId}, merchantOrderId: ${payload.merchantOrderId}`,
    );

    // Log full payload for debugging
    this.logger.debug(`Full webhook payload: ${JSON.stringify(payload)}`);

    let merchantSubscriptionId: string | undefined;
    let phonepeSubscriptionId: string | undefined;

    // Try to get merchantSubscriptionId from paymentFlow
    if (payload.paymentFlow?.merchantSubscriptionId) {
      merchantSubscriptionId = payload.paymentFlow.merchantSubscriptionId;
      phonepeSubscriptionId = payload.paymentFlow.subscriptionId;
    }

    // If not found in paymentFlow, try to extract from other fields
    if (!merchantSubscriptionId) {
      this.logger.warn(
        `paymentFlow.merchantSubscriptionId missing, attempting fallback lookup for order: ${payload.orderId}`,
      );

      // Try to find subscription by merchantOrderId from the payload
      // This is a fallback mechanism
      this.logger.warn(
        `Unable to process webhook without merchantSubscriptionId. Order: ${payload.orderId}`,
      );
      return;
    }

    const subscription =
      await this.subscriptionRepo.findByMerchantSubscriptionId(
        merchantSubscriptionId,
      );

    if (!subscription) {
      this.logger.warn(`Subscription not found: ${merchantSubscriptionId}`);
      return;
    }

    this.logger.log(
      `Found subscription: ${subscription.merchantSubscriptionId}, current state: ${subscription.state}`,
    );

    try {
      subscription.activate(phonepeSubscriptionId || payload.orderId);
      await this.subscriptionRepo.update(subscription);

      this.logger.log(
        `Subscription activated: ${merchantSubscriptionId}, new state: ACTIVE`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to activate subscription: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleSetupFailed(payload: SubscriptionSetupPayload) {
    this.logger.log(
      `Processing checkout.order.failed for order: ${payload.orderId}, merchantOrderId: ${payload.merchantOrderId}`,
    );

    // Try to get merchantSubscriptionId from paymentFlow
    const merchantSubscriptionId = payload.paymentFlow?.merchantSubscriptionId;

    if (!merchantSubscriptionId) {
      this.logger.warn(
        `merchantSubscriptionId missing in paymentFlow for order: ${payload.orderId}`,
      );
      return;
    }

    const subscription =
      await this.subscriptionRepo.findByMerchantSubscriptionId(
        merchantSubscriptionId,
      );

    if (!subscription) {
      this.logger.warn(`Subscription not found: ${merchantSubscriptionId}`);
      return;
    }

    subscription.markAsFailed();
    await this.subscriptionRepo.update(subscription);

    this.logger.log(`Subscription failed: ${merchantSubscriptionId}`);
  }

  private async handleSubscriptionPaused(
    payload: SubscriptionStateChangePayload,
  ) {
    const subscription =
      await this.subscriptionRepo.findByMerchantSubscriptionId(
        payload.merchantSubscriptionId,
      );

    if (!subscription) return;

    subscription.pause();
    await this.subscriptionRepo.update(subscription);

    this.logger.log(`Subscription paused: ${payload.merchantSubscriptionId}`);
  }

  private async handleSubscriptionUnpaused(
    payload: SubscriptionStateChangePayload,
  ) {
    const subscription =
      await this.subscriptionRepo.findByMerchantSubscriptionId(
        payload.merchantSubscriptionId,
      );

    if (!subscription) return;

    subscription.unpause();
    await this.subscriptionRepo.update(subscription);

    this.logger.log(`Subscription unpaused: ${payload.merchantSubscriptionId}`);
  }

  private async handleSubscriptionRevoked(
    payload: SubscriptionStateChangePayload,
  ) {
    const subscription =
      await this.subscriptionRepo.findByMerchantSubscriptionId(
        payload.merchantSubscriptionId,
      );

    if (!subscription) return;

    subscription.revoke();
    await this.subscriptionRepo.update(subscription);

    this.logger.log(`Subscription revoked: ${payload.merchantSubscriptionId}`);
  }

  private async handleSubscriptionCancelled(
    payload: SubscriptionStateChangePayload,
  ) {
    const subscription =
      await this.subscriptionRepo.findByMerchantSubscriptionId(
        payload.merchantSubscriptionId,
      );

    if (!subscription) return;

    subscription.initiateCancellation();
    subscription.confirmCancellation();
    await this.subscriptionRepo.update(subscription);

    this.logger.log(
      `Subscription cancelled: ${payload.merchantSubscriptionId}`,
    );
  }

  private async handleNotificationCompleted(payload: RedemptionPayload) {
    const redemption = await this.redemptionRepo.findByMerchantOrderId(
      payload.merchantOrderId,
    );

    if (!redemption) {
      this.logger.warn(`Redemption not found: ${payload.merchantOrderId}`);
      return;
    }

    // Mark as notified
    redemption.markAsNotified(
      payload.orderId,
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      new Date(Date.now() + 48 * 60 * 60 * 1000),
    );
    await this.redemptionRepo.update(redemption);

    this.logger.log(`Redemption notified: ${payload.merchantOrderId}`);
  }

  private async handleNotificationFailed(payload: RedemptionPayload) {
    const redemption = await this.redemptionRepo.findByMerchantOrderId(
      payload.merchantOrderId,
    );

    if (!redemption) {
      this.logger.warn(`Redemption not found: ${payload.merchantOrderId}`);
      return;
    }

    redemption.markNotificationFailed(
      payload.errorCode || 'NOTIFICATION_FAILED',
      payload.detailedErrorCode || 'Unknown',
    );
    await this.redemptionRepo.update(redemption);

    this.logger.log(
      `Redemption notification failed: ${payload.merchantOrderId}`,
    );
  }

  private async handleRedemptionCompleted(payload: RedemptionPayload) {
    const redemption = await this.redemptionRepo.findByMerchantOrderId(
      payload.merchantOrderId,
    );

    if (!redemption) {
      this.logger.warn(`Redemption not found: ${payload.merchantOrderId}`);
      return;
    }

    // Get transaction ID from payment details
    const transactionId =
      payload.paymentDetails?.[0]?.transactionId || payload.orderId;

    redemption.complete(transactionId);
    await this.redemptionRepo.update(redemption);

    this.logger.log(
      `Redemption completed: ${payload.merchantOrderId}, tx: ${transactionId}`,
    );
  }

  private async handleRedemptionFailed(payload: RedemptionPayload) {
    const redemption = await this.redemptionRepo.findByMerchantOrderId(
      payload.merchantOrderId,
    );

    if (!redemption) {
      this.logger.warn(`Redemption not found: ${payload.merchantOrderId}`);
      return;
    }

    // Get error from payment details or payload
    const errorCode =
      payload.paymentDetails?.[0]?.errorCode ||
      payload.errorCode ||
      'REDEMPTION_FAILED';
    const detailedErrorCode =
      payload.paymentDetails?.[0]?.detailedErrorCode ||
      payload.detailedErrorCode ||
      'Unknown';

    redemption.fail(errorCode, detailedErrorCode);
    await this.redemptionRepo.update(redemption);

    this.logger.log(
      `Redemption failed: ${payload.merchantOrderId}, error: ${errorCode}`,
    );
  }
}
