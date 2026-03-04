import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'crypto';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { RazorpayWebhookPayload } from './dto/webhook-payload.dto';
import {
  AnalyticsService,
  EventProperties,
} from '../analytics/analytics.service';
import { ANALYTICS_EVENTS } from '../analytics/analytics.constants';

@Injectable()
export class RazorpayWebhookService {
  private readonly logger = new Logger(RazorpayWebhookService.name);

  constructor(
    private config: ConfigService,
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
    private analyticsService: AnalyticsService,
  ) {}

  private async getUserInfoForAnalytics(userId: string) {
    try {
      console.log('[Razorpay] getUserInfoForAnalytics called with:', {
        userId,
        userIdType: typeof userId,
      });

      const userInfo = await this.db
        .select({
          email: schema.user.email,
          phone: schema.user.phoneNumber,
          name: schema.user.name,
        })
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);

      if (userInfo.length > 0) {
        const nameParts = userInfo[0].name?.split(' ') || [];
        return {
          userId,
          email: userInfo[0].email,
          phone: userInfo[0].phone || undefined,
          firstName: nameParts[0] || undefined,
          lastName: nameParts.slice(1).join(' ') || undefined,
        };
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to fetch user info for analytics:', error);
      return null;
    }
  }

  private async trackOrderAnalytics(
    requestId: string,
    orderId: string,
    eventName: string,
    eventProperties: EventProperties,
  ) {
    try {
      const orderInfo = await this.db
        .select({
          userId: schema.orders.userId,
          amount: schema.orders.amount,
          appId: schema.orders.appId,
        })
        .from(schema.orders)
        .where(eq(schema.orders.razorpayOrderId, orderId))
        .limit(1);

      if (orderInfo.length > 0 && orderInfo[0].userId) {
        const userInfo = await this.getUserInfoForAnalytics(
          orderInfo[0].userId,
        );
        if (userInfo) {
          await this.analyticsService.sendEvent({
            eventName,
            userData: userInfo,
            eventProperties,
            appId: orderInfo[0].appId,
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `[WEBHOOK ${requestId}] ⚠️  Failed to track ${eventName} analytics:`,
        error,
      );
    }
  }

  private async trackSubscriptionAnalytics(
    requestId: string,
    subscriptionId: string,
    eventName: string,
    eventProperties: EventProperties,
    facebookCustomData?: EventProperties,
  ) {
    try {
      const subInfo = await this.db
        .select({
          userId: schema.subscriptions.userId,
          appId: schema.subscriptions.appId,
        })
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.razorpaySubscriptionId, subscriptionId))
        .limit(1);

      if (subInfo.length > 0 && subInfo[0].userId) {
        const userInfo = await this.getUserInfoForAnalytics(subInfo[0].userId);
        if (userInfo) {
          await this.analyticsService.sendEvent({
            eventName,
            userData: userInfo,
            eventProperties,
            facebookCustomData,
            appId: subInfo[0].appId,
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `[WEBHOOK ${requestId}] ⚠️  Failed to track ${eventName} analytics:`,
        error,
      );
    }
  }

  /**
   * Get webhook secret for a specific app
   * Environment variable naming convention:
   * - RAZORPAY_WEBHOOK_SECRET_{APP_ID}
   *   where APP_ID is normalized (dots replaced with underscores, uppercase)
   */
  private getWebhookSecret(appId: string): string {
    if (!appId) {
      throw new InternalServerErrorException('App ID is required');
    }

    const normalizedAppId = appId.replace(/\./g, '_').toUpperCase();
    const secret = this.config.get<string>(
      `RAZORPAY_WEBHOOK_SECRET_${normalizedAppId}`,
    );

    if (!secret) {
      throw new InternalServerErrorException(
        `Webhook secret not found for app: ${appId}. Please set RAZORPAY_WEBHOOK_SECRET_${normalizedAppId} environment variable.`,
      );
    }

    return secret;
  }

  /**
   * Verify webhook signature
   */
  private verifySignature(
    body: string,
    signature: string,
    secret: string,
  ): boolean {
    const expectedSignature = createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  private extractWebhookIds(event: RazorpayWebhookPayload): {
    event: string;
    subscriptionId?: string;
    paymentId?: string;
    orderId?: string;
    tokenId?: string;
  } {
    const ids: {
      event: string;
      subscriptionId?: string;
      paymentId?: string;
      orderId?: string;
      tokenId?: string;
    } = { event: event.event };

    if (event.payload?.subscription?.entity?.id) {
      ids.subscriptionId = event.payload.subscription.entity.id;
    } else if (
      event.payload?.payment?.entity?.invoice_id &&
      event.payload.payment.entity.invoice_id.startsWith('inv_')
    ) {
      // In some cases we might only have invoice_id which could be linked to a subscription
    }

    if (event.payload?.payment?.entity?.id) {
      ids.paymentId = event.payload.payment.entity.id;
    }

    if (event.payload?.order?.entity?.id) {
      ids.orderId = event.payload.order.entity.id;
    }

    if (event.payload?.token?.entity?.id) {
      ids.tokenId = event.payload.token.entity.id;
    }

    return ids;
  }

  private formatWebhookIds(ids: {
    event: string;
    subscriptionId?: string;
    paymentId?: string;
    orderId?: string;
    tokenId?: string;
  }): string {
    const parts: string[] = [];
    if (ids.subscriptionId) parts.push(`Sub: ${ids.subscriptionId}`);
    if (ids.paymentId) parts.push(`Pay: ${ids.paymentId}`);
    if (ids.orderId) parts.push(`Ord: ${ids.orderId}`);
    if (ids.tokenId) parts.push(`Tok: ${ids.tokenId}`);
    return parts.length > 0 ? `| ${parts.join(' | ')}` : '| No IDs';
  }

  /**
   * Process webhook from Razorpay
   */
  async processWebhook(
    appId: string,
    body: string,
    signature: string,
  ): Promise<{ received: boolean }> {
    const requestId = randomBytes(8).toString('hex');
    const startTime = Date.now();

    try {
      // Get webhook secret for this app
      const webhookSecret = this.getWebhookSecret(appId);

      // Verify signature
      if (!this.verifySignature(body, signature, webhookSecret)) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Signature verification FAILED for app: ${appId}`,
        );
        throw new UnauthorizedException('Invalid signature');
      }

      const event: RazorpayWebhookPayload = JSON.parse(body);
      const ids = this.extractWebhookIds(event);
      this.logger.log(
        `[WEBHOOK ${requestId}] 🔔 Received ${event.event} ${this.formatWebhookIds(ids)} | App: ${appId}`,
      );

      // Generic Subscription Webhook Logging
      if (ids.subscriptionId) {
        try {
          // We log every webhook that contains a subscription ID, so we have a full history
          const statusToLog =
            event.payload?.subscription?.entity?.status || null;

          let userIdToLog: string | null = null;
          let appIdToLog = appId;

          const sub = await this.db
            .select({
              userId: schema.subscriptions.userId,
              appId: schema.subscriptions.appId,
            })
            .from(schema.subscriptions)
            .where(
              eq(
                schema.subscriptions.razorpaySubscriptionId,
                ids.subscriptionId,
              ),
            )
            .limit(1);

          if (sub.length > 0) {
            userIdToLog = sub[0].userId;
            appIdToLog = sub[0].appId;
          }

          await this.db.insert(schema.subscriptionLogs).values({
            userId: userIdToLog as any,
            appId: appIdToLog,
            subscriptionId: ids.subscriptionId,
            provider: 'razorpay',
            action: event.event,
            status: statusToLog,
            metadata: event as any,
          });
        } catch (logErr) {
          this.logger.error(
            `[WEBHOOK ${requestId}] ⚠️ Failed to insert generic subscription log:`,
            logErr,
          );
        }
      }

      // Handle different webhook events
      await this.handleEvent(event, requestId, appId);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `[WEBHOOK ${requestId}] ✅ Webhook processed successfully in ${processingTime}ms`,
      );

      return { received: true };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `[WEBHOOK ${requestId}] ❌ Webhook error after ${processingTime}ms:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle different webhook event types
   */
  private async handleEvent(
    event: RazorpayWebhookPayload,
    requestId: string,
    appId: string,
  ): Promise<void> {
    switch (event.event) {
      case 'payment.authorized':
        await this.handlePaymentAuthorized(event, requestId);
        break;
      case 'payment.captured':
        await this.handlePaymentCaptured(event, requestId);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(event, requestId);
        break;
      case 'token.confirmed':
        await this.handleTokenConfirmed(event, requestId);
        break;
      case 'subscription.activated':
        await this.handleSubscriptionActivated(event, requestId);
        break;
      case 'subscription.charged':
        await this.handleSubscriptionCharged(event, requestId);
        break;
      case 'subscription.pending':
        await this.handleSubscriptionPending(event, requestId);
        break;
      case 'subscription.halted':
      case 'subscription.paused':
        await this.handleSubscriptionHalted(event, requestId);
        break;
      case 'subscription.resumed':
        await this.handleSubscriptionResumed(event, requestId);
        break;
      case 'subscription.cancelled':
        await this.handleSubscriptionCancelled(event, requestId);
        break;
      case 'subscription.completed':
        await this.handleSubscriptionCompleted(event, requestId);
        break;
      case 'subscription.authenticated':
        await this.handleSubscriptionAuthenticated(event, requestId);
        break;
      case 'order.paid':
        await this.handleOrderPaid(event, requestId);
        break;
      case 'payment.downtime.resolved':
        this.logger.log(`[WEBHOOK ${requestId}] 🟢 Payment downtime resolved`);
        break;
      default:
        this.logger.log(
          `[WEBHOOK ${requestId}] ⚠️ Unhandled event type: ${event.event}`,
        );
    }
  }

  private async handlePaymentAuthorized(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] 💳 Payment authorized`);
    const payment = event.payload.payment?.entity;

    if (payment?.order_id && payment?.id) {
      try {
        await this.db
          .update(schema.orders)
          .set({
            status: 'authorized',
            razorpayPaymentId: payment.id,
            paymentMetadata: payment as any,
            updatedAt: new Date(),
          })
          .where(eq(schema.orders.razorpayOrderId, payment.order_id));
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Order ${payment.order_id} updated to AUTHORIZED`,
        );

        await this.trackOrderAnalytics(
          requestId,
          payment.order_id,
          ANALYTICS_EVENTS.PAYMENT_AUTHORIZED,
          {
            payment_id: payment.id,
            order_id: payment.order_id,
            amount: payment.amount / 100,
            currency: payment.currency || 'INR',
            method: payment.method,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to update order to authorized:`,
          error,
        );
      }
    }
  }

  private async handlePaymentCaptured(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] 💰 Payment captured`);
    const payment = event.payload.payment?.entity;

    if (payment?.order_id && payment?.id) {
      try {
        await this.db
          .update(schema.orders)
          .set({
            status: 'captured',
            razorpayPaymentId: payment.id,
            paymentMetadata: payment as any,
            updatedAt: new Date(),
          })
          .where(eq(schema.orders.razorpayOrderId, payment.order_id));
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Order ${payment.order_id} updated to CAPTURED`,
        );

        await this.trackOrderAnalytics(
          requestId,
          payment.order_id,
          ANALYTICS_EVENTS.PAYMENT_CAPTURED,
          {
            payment_id: payment.id,
            order_id: payment.order_id,
            amount: payment.amount / 100,
            currency: payment.currency || 'INR',
            method: payment.method,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to update order to captured:`,
          error,
        );
      }
    }
  }

  private async handlePaymentFailed(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] ❌ Payment failed`);
    const payment = event.payload.payment?.entity;

    if (!payment?.id) {
      this.logger.warn(
        `[WEBHOOK ${requestId}] ⚠️ Missing payment id in failed event`,
      );
      return;
    }

    try {
      // Update order if order_id exists
      if (payment.order_id) {
        const result = await this.db
          .update(schema.orders)
          .set({
            status: 'failed',
            razorpayPaymentId: payment.id,
            paymentMetadata: payment as any,
            updatedAt: new Date(),
          })
          .where(eq(schema.orders.razorpayOrderId, payment.order_id))
          .returning({ id: schema.orders.id });

        if (result.length > 0) {
          this.logger.log(
            `[WEBHOOK ${requestId}] ✅ Order ${payment.order_id} updated to FAILED`,
          );

          await this.trackOrderAnalytics(
            requestId,
            payment.order_id,
            ANALYTICS_EVENTS.PAYMENT_FAILED,
            {
              payment_id: payment.id,
              order_id: payment.order_id,
              amount: payment.amount / 100,
              currency: payment.currency || 'INR',
              error_code: payment.error_code,
              error_description: payment.error_description,
            },
          );
        }
      }

      // Update subscription metadata if invoice_id exists (recurring payment)
      if (payment.invoice_id) {
        // Note: We'd need to fetch the invoice to get the subscription_id
        // For now, skip this part as it requires additional API call
        this.logger.log(
          `[WEBHOOK ${requestId}] ℹ️ Invoice ${payment.invoice_id} - subscription metadata update skipped`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[WEBHOOK ${requestId}] ❌ Failed to process payment failure:`,
        error,
      );
    }
  }

  private async handleTokenConfirmed(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] 🎫 Token confirmed`);
    const token = event.payload.token?.entity;

    if (token?.id && token?.order_id) {
      try {
        await this.db
          .update(schema.orders)
          .set({
            tokenId: token.id,
            updatedAt: new Date(),
          })
          .where(eq(schema.orders.razorpayOrderId, token.order_id));
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Token ${token.id} saved for order ${token.order_id}`,
        );

        await this.trackOrderAnalytics(
          requestId,
          token.order_id,
          ANALYTICS_EVENTS.TOKEN_CONFIRMED,
          {
            token_id: token.id,
            order_id: token.order_id,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to save token:`,
          error,
        );
      }
    }
  }

  private async handleSubscriptionActivated(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] 🎉 Subscription activated`);
    const subscription = event.payload.subscription?.entity;

    if (subscription?.id) {
      try {
        await this.db
          .update(schema.subscriptions)
          .set({
            status: 'active',
            metadata: subscription as any,
            updatedAt: new Date(),
          })
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          );
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Subscription ${subscription.id} activated`,
        );

        await this.trackSubscriptionAnalytics(
          requestId,
          subscription.id,
          ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
          {
            subscription_id: subscription.id,
            plan_id: subscription.plan_id,
            quantity: subscription.quantity,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to activate subscription:`,
          error,
        );
      }
    }
  }

  private async handleSubscriptionCharged(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] 💵 Subscription charged`);
    const subscription = event.payload.subscription?.entity;

    if (subscription?.id) {
      try {
        const paidCount = subscription.paid_count || 0;
        const remainingCount = subscription.remaining_count;

        await this.db
          .update(schema.subscriptions)
          .set({
            paidCount,
            remainingCount,
            chargeAt: subscription.charge_at
              ? new Date(subscription.charge_at * 1000)
              : null,
            currentStart: subscription.current_start
              ? new Date(subscription.current_start * 1000)
              : null,
            currentEnd: subscription.current_end
              ? new Date(subscription.current_end * 1000)
              : null,
            metadata: subscription as any,
            updatedAt: new Date(),
          })
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          );
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Subscription ${subscription.id} billing info updated`,
        );

        const paymentAmount = event.payload?.payment?.entity?.amount
          ? event.payload.payment.entity.amount / 100
          : undefined;

        await this.trackSubscriptionAnalytics(
          requestId,
          subscription.id,
          ANALYTICS_EVENTS.SUBSCRIPTION_CHARGED,
          {
            subscription_id: subscription.id,
            paid_count: paidCount,
            remaining_count: remainingCount,
            amount: paymentAmount,
            currency: event.payload?.payment?.entity?.currency || 'INR',
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to update subscription billing info:`,
          error,
        );
      }
    }
  }

  private async handleSubscriptionPending(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] ⏳ Subscription pending`);
    const subscription = event.payload.subscription?.entity;

    if (subscription?.id) {
      try {
        await this.db
          .update(schema.subscriptions)
          .set({
            status: 'pending',
            metadata: subscription as any,
            updatedAt: new Date(),
          })
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          );
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Subscription ${subscription.id} set to pending`,
        );

        await this.trackSubscriptionAnalytics(
          requestId,
          subscription.id,
          ANALYTICS_EVENTS.SUBSCRIPTION_PENDING,
          {
            subscription_id: subscription.id,
            plan_id: subscription.plan_id,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to update subscription to pending:`,
          error,
        );
      }
    }
  }

  private async handleSubscriptionHalted(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] ⏸️ Subscription halted/paused`);
    const subscription = event.payload.subscription?.entity;

    if (subscription?.id) {
      try {
        await this.db
          .update(schema.subscriptions)
          .set({
            status: 'halted',
            metadata: subscription as any,
            updatedAt: new Date(),
          })
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          );
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Subscription ${subscription.id} halted`,
        );

        const eventName =
          event.event === 'subscription.paused'
            ? ANALYTICS_EVENTS.SUBSCRIPTION_PAUSED
            : ANALYTICS_EVENTS.SUBSCRIPTION_HALTED;
        await this.trackSubscriptionAnalytics(
          requestId,
          subscription.id,
          eventName,
          {
            subscription_id: subscription.id,
            plan_id: subscription.plan_id,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to halt subscription:`,
          error,
        );
      }
    }
  }

  private async handleSubscriptionResumed(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] ▶️ Subscription resumed`);
    const subscription = event.payload.subscription?.entity;

    if (subscription?.id) {
      try {
        await this.db
          .update(schema.subscriptions)
          .set({
            status: 'active',
            metadata: subscription as any,
            updatedAt: new Date(),
          })
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          );
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Subscription ${subscription.id} resumed`,
        );

        await this.trackSubscriptionAnalytics(
          requestId,
          subscription.id,
          ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
          {
            subscription_id: subscription.id,
            plan_id: subscription.plan_id,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to resume subscription:`,
          error,
        );
      }
    }
  }

  private async handleSubscriptionCancelled(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] 🚫 Subscription cancelled`);
    const subscription = event.payload.subscription?.entity;

    if (subscription?.id) {
      try {
        // Fetch subscription start time for grace period calculation
        const subRecord = await this.db
          .select({
            startAt: schema.subscriptions.startAt,
            createdAt: schema.subscriptions.createdAt,
          })
          .from(schema.subscriptions)
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          )
          .limit(1);

        const now = new Date();
        const subStart =
          subRecord[0]?.startAt ?? subRecord[0]?.createdAt ?? now;
        const gracePeriodEnd = new Date(
          subStart.getTime() + 24 * 60 * 60 * 1000,
        );
        const effectiveEndAt = gracePeriodEnd > now ? gracePeriodEnd : now;

        await this.db
          .update(schema.subscriptions)
          .set({
            status: 'cancelled',
            endAt: effectiveEndAt,
            fourHourEventSent: true,
            metadata: subscription as any,
            updatedAt: now,
          })
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          );
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Subscription ${subscription.id} cancelled (access until ${effectiveEndAt.toISOString()})`,
        );

        await this.trackSubscriptionAnalytics(
          requestId,
          subscription.id,
          ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
          {
            subscription_id: subscription.id,
            plan_id: subscription.plan_id,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to process subscription cancellation:`,
          error,
        );
      }
    }
  }

  private async handleSubscriptionCompleted(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] 🏁 Subscription completed`);
    const subscription = event.payload.subscription?.entity;

    if (subscription?.id) {
      try {
        await this.db
          .update(schema.subscriptions)
          .set({
            status: 'completed',
            endAt: subscription.ended_at
              ? new Date(subscription.ended_at * 1000)
              : new Date(),
            metadata: subscription as any,
            updatedAt: new Date(),
          })
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          );
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Subscription ${subscription.id} completed`,
        );

        await this.trackSubscriptionAnalytics(
          requestId,
          subscription.id,
          ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED,
          {
            subscription_id: subscription.id,
            plan_id: subscription.plan_id,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to complete subscription:`,
          error,
        );
      }
    }
  }

  private async handleSubscriptionAuthenticated(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] 🔐 Subscription authenticated`);
    const subscription = event.payload.subscription?.entity;

    if (subscription?.id) {
      try {
        // Check if already active
        const existingSub = await this.db
          .select({ status: schema.subscriptions.status })
          .from(schema.subscriptions)
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          )
          .limit(1);

        if (existingSub.length > 0 && existingSub[0].status === 'active') {
          this.logger.log(
            `[WEBHOOK ${requestId}] ⏭️ Skipping - subscription ${subscription.id} already active`,
          );
          return;
        }

        await this.db
          .update(schema.subscriptions)
          .set({
            status: 'authenticated',
            startAt: subscription.start_at
              ? new Date(subscription.start_at * 1000)
              : null,
            endAt: subscription.end_at
              ? new Date(subscription.end_at * 1000)
              : null,
            chargeAt: subscription.charge_at
              ? new Date(subscription.charge_at * 1000)
              : null,
            totalCount: subscription.total_count,
            remainingCount: subscription.remaining_count,
            metadata: subscription as any,
            updatedAt: new Date(),
          })
          .where(
            eq(schema.subscriptions.razorpaySubscriptionId, subscription.id),
          );
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Subscription ${subscription.id} updated to authenticated`,
        );

        await this.trackSubscriptionAnalytics(
          requestId,
          subscription.id,
          ANALYTICS_EVENTS.SUBSCRIPTION_AUTHENTICATED,
          {
            subscription_id: subscription.id,
            plan_id: subscription.plan_id,
          },
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to update subscription to authenticated:`,
          error,
        );
      }
    }
  }

  private async handleOrderPaid(
    event: RazorpayWebhookPayload,
    requestId: string,
  ): Promise<void> {
    this.logger.log(`[WEBHOOK ${requestId}] 💰 Order paid`);
    const order = event.payload.order?.entity;

    if (order?.id) {
      try {
        // Check current status
        const existingOrder = await this.db
          .select({ status: schema.orders.status })
          .from(schema.orders)
          .where(eq(schema.orders.razorpayOrderId, order.id))
          .limit(1);

        if (
          existingOrder.length > 0 &&
          existingOrder[0].status === 'captured'
        ) {
          this.logger.log(
            `[WEBHOOK ${requestId}] ℹ️ Order ${order.id} already captured, skipping`,
          );
          return;
        }

        await this.db
          .update(schema.orders)
          .set({
            status: 'captured',
            updatedAt: new Date(),
          })
          .where(eq(schema.orders.razorpayOrderId, order.id));
        this.logger.log(
          `[WEBHOOK ${requestId}] ✅ Order ${order.id} updated to CAPTURED`,
        );
      } catch (error) {
        this.logger.error(
          `[WEBHOOK ${requestId}] ❌ Failed to update order to captured:`,
          error,
        );
      }
    }
  }
}
