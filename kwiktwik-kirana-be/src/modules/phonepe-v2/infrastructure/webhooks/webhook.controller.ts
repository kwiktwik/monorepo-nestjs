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
import { Inject, forwardRef } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  SUBSCRIPTION_REPOSITORY,
  REDEMPTION_REPOSITORY,
  SUBSCRIPTION_SETUP,
} from '../../constants';
import type {
  SubscriptionRepository,
  RedemptionRepository,
} from '../../application/interfaces/repository.interface';
import type { PhonePeWebhookEvent } from '../../domain/enums/subscription.enum';
import { RedemptionStates } from '../../domain/enums/subscription.enum';
import { WebhookPayloadSchema } from '../validation/schemas';
import { RedemptionSchedulerService } from '../../application/services/redemption-scheduler.service';
import { DRIZZLE_TOKEN } from '../../../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../database/schema';
import { NotificationService } from '../../../../modules/notification/notification.service';
import * as admin from 'firebase-admin';

// Webhook payload types
interface SubscriptionSetupPayload {
  merchantId: string;
  merchantOrderId: string;
  orderId: string;
  state: 'COMPLETED' | 'FAILED';
  paymentFlow: {
    type: typeof SUBSCRIPTION_SETUP;
    merchantSubscriptionId: string;
    subscriptionId?: string;
    expireAt?: number;
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

interface RefundPayload {
  merchantId: string;
  merchantOrderId: string;
  orderId: string;
  refundId: string;
  transactionId: string;
  state: 'ACCEPTED' | 'COMPLETED' | 'FAILED';
  currency: string;
  amount: number;
  errorCode?: string;
  detailedErrorCode?: string;
}

interface WebhookBody {
  event: PhonePeWebhookEvent;
  payload:
    | SubscriptionSetupPayload
    | SubscriptionStateChangePayload
    | RedemptionPayload
    | RefundPayload;
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
    @Inject(forwardRef(() => RedemptionSchedulerService))
    private readonly redemptionScheduler: RedemptionSchedulerService,
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly notificationService: NotificationService,
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
        case 'subscription.setup.order.completed':
          await this.handleSetupCompleted(
            body.payload as SubscriptionSetupPayload,
          );
          break;
        case 'subscription.setup.order.failed':
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

        // Refund callbacks
        case 'pg.refund.accepted':
          await this.handleRefundAccepted(body.payload as RefundPayload);
          break;
        case 'pg.refund.completed':
          await this.handleRefundCompleted(body.payload as RefundPayload);
          break;
        case 'pg.refund.failed':
          await this.handleRefundFailed(body.payload as RefundPayload);
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
      `Processing subscription.setup.order.completed for order: ${payload.orderId}, merchantOrderId: ${payload.merchantOrderId}`,
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
      subscription.activate(
        phonepeSubscriptionId || payload.orderId,
        payload.paymentFlow.expireAt,
      );
      await this.subscriptionRepo.update(subscription);

      this.logger.log(
        `Subscription activated: ${merchantSubscriptionId}, new state: ACTIVE`,
      );

      await this.redemptionScheduler.scheduleFirstRedemption(subscription);
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

    // Idempotency check: skip if already notified or in terminal state
    if (redemption.state === RedemptionStates.NOTIFIED) {
      this.logger.log(
        `Redemption already notified: ${payload.merchantOrderId}`,
      );
      return;
    }

    if (redemption.isTerminal()) {
      this.logger.warn(
        `Redemption in terminal state ${redemption.state}, cannot mark as notified: ${payload.merchantOrderId}`,
      );
      return;
    }

    // Mark as notified with 48 hour expiration from PhonePe
    const expireAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    redemption.markAsNotified(payload.orderId, expireAt);
    await this.redemptionRepo.update(redemption);

    this.logger.log(
      `Redemption notified: ${payload.merchantOrderId}, expireAt: ${expireAt.toISOString()}`,
    );
  }

  private async handleNotificationFailed(payload: RedemptionPayload) {
    const redemption = await this.redemptionRepo.findByMerchantOrderId(
      payload.merchantOrderId,
    );

    if (!redemption) {
      this.logger.warn(`Redemption not found: ${payload.merchantOrderId}`);
      return;
    }

    // Idempotency check: skip if already in terminal state
    if (redemption.isTerminal()) {
      this.logger.warn(
        `Redemption in terminal state ${redemption.state}, cannot mark notification as failed: ${payload.merchantOrderId}`,
      );
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

    // Idempotency check: skip if already completed
    if (redemption.state === RedemptionStates.COMPLETED) {
      this.logger.log(
        `Redemption already completed: ${payload.merchantOrderId}`,
      );
      return;
    }

    // Skip if already in FAILED state (cannot transition to COMPLETED)
    if (redemption.state === RedemptionStates.FAILED) {
      this.logger.warn(
        `Redemption in FAILED state, cannot complete: ${payload.merchantOrderId}`,
      );
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

    // Idempotency check: skip if already failed
    if (redemption.state === RedemptionStates.FAILED) {
      this.logger.log(`Redemption already failed: ${payload.merchantOrderId}`);
      return;
    }

    // Skip if already completed (cannot transition to FAILED)
    if (redemption.state === RedemptionStates.COMPLETED) {
      this.logger.warn(
        `Redemption already completed, cannot fail: ${payload.merchantOrderId}`,
      );
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

  private async handleRefundAccepted(payload: RefundPayload) {
    this.logger.log(
      `Refund accepted: ${payload.refundId} for order ${payload.merchantOrderId}, amount: ${payload.amount}`,
    );
    await this.handleRefundEvent(payload, 'pg.refund.accepted', 'ACCEPTED');
  }

  private async handleRefundCompleted(payload: RefundPayload) {
    this.logger.log(
      `Refund completed: ${payload.refundId} for order ${payload.merchantOrderId}, amount: ${payload.amount}`,
    );
    await this.handleRefundEvent(payload, 'pg.refund.completed', 'COMPLETED');
  }

  private async handleRefundFailed(payload: RefundPayload) {
    this.logger.warn(
      `Refund failed: ${payload.refundId} for order ${payload.merchantOrderId}, error: ${payload.errorCode || 'Unknown'}`,
    );
    await this.handleRefundEvent(payload, 'pg.refund.failed', 'FAILED');
  }

  /**
   * Shared helper for all refund webhook events.
   * Throws if the redemption cannot be found — no silent defaults.
   */
  private async handleRefundEvent(
    payload: RefundPayload,
    action: 'pg.refund.accepted' | 'pg.refund.completed' | 'pg.refund.failed',
    status: 'ACCEPTED' | 'COMPLETED' | 'FAILED',
  ): Promise<void> {
    try {
      const redemption = await this.redemptionRepo.findByMerchantOrderId(
        payload.merchantOrderId,
      );

      if (!redemption) {
        throw new Error(
          `Redemption not found for refund event ${action}: merchantOrderId=${payload.merchantOrderId}, refundId=${payload.refundId}`,
        );
      }

      await this.db.insert(schema.webhookLogs).values({
        userId: redemption.userId,
        appId: redemption.appId,
        entityType: 'refund',
        entityId: payload.refundId,
        orderId: payload.merchantOrderId,
        provider: 'phonepe',
        action,
        status,
        errorMessage: payload.errorCode,
        metadata: {
          orderId: payload.orderId,
          merchantOrderId: payload.merchantOrderId,
          transactionId: payload.transactionId,
          amount: payload.amount,
          currency: payload.currency,
          errorCode: payload.errorCode,
          detailedErrorCode: payload.detailedErrorCode,
          refundId: payload.refundId,
          refundStatus: status,
          redemptionId: redemption.id,
        } as Record<string, unknown>,
      });

      this.logger.log(
        `Refund event logged: action=${action}, redemptionId=${redemption.id}`,
      );

      await this.sendRefundNotification(
        redemption.userId,
        redemption.appId,
        status.toLowerCase() as 'accepted' | 'completed' | 'failed',
        payload,
      );
    } catch (error) {
      this.logger.error(
        `Error handling refund event ${action}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async sendRefundNotification(
    userId: string,
    appId: string,
    status: 'accepted' | 'completed' | 'failed',
    payload: RefundPayload,
  ): Promise<void> {
    try {
      // Get user's push tokens
      const tokens = await this.db
        .select({ token: schema.pushTokens.token })
        .from(schema.pushTokens)
        .where(
          and(
            eq(schema.pushTokens.userId, userId),
            eq(schema.pushTokens.appId, appId),
            eq(schema.pushTokens.isActive, true),
          ),
        );

      if (tokens.length === 0) {
        this.logger.warn(
          `No active push tokens found for user: ${userId}, app: ${appId}`,
        );
        return;
      }

      const tokenList = tokens.map((t) => t.token);
      const amountInRupees = (payload.amount / 100).toFixed(2);

      let title: string;
      let body: string;

      switch (status) {
        case 'accepted':
          title = 'Refund Request Accepted';
          body = `Your refund request for ₹${amountInRupees} has been accepted and is being processed.`;
          break;
        case 'completed':
          title = 'Refund Completed';
          body = `Your refund of ₹${amountInRupees} has been successfully processed. The amount will be credited to your account within 5-7 business days.`;
          break;
        case 'failed':
          title = 'Refund Failed';
          body = `We apologize, but your refund request for ₹${amountInRupees} could not be processed. Please contact support for assistance.`;
          break;
      }

      // Send push notification via Firebase
      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokenList,
        notification: {
          title,
          body,
        },
        data: {
          type: 'refund_update',
          status,
          refundId: payload.refundId,
          orderId: payload.merchantOrderId,
          amount: amountInRupees,
          currency: payload.currency,
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'high_importance_channel',
            priority: 'high',
          },
        },
      });

      this.logger.log(
        `Refund notification sent: ${status}, success: ${response.successCount}, failed: ${response.failureCount}`,
      );

      // Handle invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const code = resp.error?.code;
            if (
              code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(tokenList[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          for (const token of invalidTokens) {
            await this.db
              .update(schema.pushTokens)
              .set({ isActive: false, updatedAt: new Date() })
              .where(eq(schema.pushTokens.token, token));
          }
          this.logger.log(
            `Deactivated ${invalidTokens.length} invalid push tokens`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to send refund notification: ${error.message}`,
        error.stack,
      );
    }
  }
}
