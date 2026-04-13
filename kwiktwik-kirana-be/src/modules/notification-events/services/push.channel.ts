import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  EventEnvelope,
  NotificationChannel,
  NotificationChannelResult,
  NotificationChannelType,
} from '../types/notification-event.types';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { eq, and } from 'drizzle-orm';
import * as admin from 'firebase-admin';

/**
 * Real Push Notification Channel using Firebase Cloud Messaging (FCM)
 * Sends push notifications to user devices
 */
@Injectable()
export class PushChannel implements NotificationChannel {
  private readonly logger = new Logger(PushChannel.name);
  readonly type = NotificationChannelType.Push;

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async send(event: EventEnvelope): Promise<NotificationChannelResult> {
    const startTime = Date.now();

    try {
      // Get user's FCM tokens
      const tokens = await this.getUserTokens(
        event.userId,
        event.appId || 'default',
      );

      if (tokens.length === 0) {
        this.logger.warn(
          `📱 [PUSH] No FCM tokens found for user ${event.userId}`,
        );
        return {
          channel: NotificationChannelType.Push,
          delivered: false,
          detail: 'No FCM tokens found for user',
          deliveredAt: new Date(),
        };
      }

      // Extract notification content
      const title = this.extractTitle(event);
      const body = this.extractBody(event);

      this.logger.log(
        `📱 [PUSH] Sending push notification | User: ${event.userId} | Tokens: ${tokens.length}`,
      );

      // Prepare FCM data payload
      const data = this.prepareDataPayload(event);

      // Send via Firebase Admin - use data-only message so client always receives in onMessageReceived
      // This ensures target_notification_received tracks correctly for both foreground/background
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        data: {
          ...data,
          title,
          body,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'subscription_notifications',
            priority: 'high',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      });

      // Handle invalid tokens
      if (response.failureCount > 0) {
        await this.handleFailedTokens(
          tokens,
          response,
          event.appId || 'default',
        );
      }

      this.logger.log(
        `✅ [PUSH] Notification sent | Success: ${response.successCount}, Failed: ${response.failureCount} in ${Date.now() - startTime}ms`,
      );

      return {
        channel: NotificationChannelType.Push,
        delivered: response.successCount > 0,
        detail: `Sent to ${response.successCount}/${tokens.length} devices`,
        deliveredAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `❌ [PUSH] Failed to send push notification: ${(error as Error).message}`,
        (error as Error).stack,
      );

      return {
        channel: NotificationChannelType.Push,
        delivered: false,
        detail: `Failed to send push: ${(error as Error).message}`,
        deliveredAt: new Date(),
      };
    }
  }

  /**
   * Get active FCM tokens for a user
   */
  private async getUserTokens(
    userId: string,
    appId: string,
  ): Promise<string[]> {
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

    return tokens.map((t) => t.token);
  }

  /**
   * Handle failed tokens by deactivating them
   */
  private async handleFailedTokens(
    tokens: string[],
    response: admin.messaging.BatchResponse,
    appId: string,
  ): Promise<void> {
    const invalidTokens: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code;
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      this.logger.log(
        `🗑️ [PUSH] Deactivating ${invalidTokens.length} invalid tokens`,
      );

      for (const token of invalidTokens) {
        await this.db
          .update(schema.pushTokens)
          .set({ isActive: false, updatedAt: new Date() })
          .where(
            and(
              eq(schema.pushTokens.token, token),
              eq(schema.pushTokens.appId, appId),
            ),
          );
      }
    }
  }

  /**
   * Prepare FCM data payload
   */
  private prepareDataPayload(event: EventEnvelope): Record<string, string> {
    const data: Record<string, string> = {
      eventType: event.eventType,
      eventId: event.eventId,
      click_action: 'OPEN_SUBSCRIPTION',
    };

    // Add payload data as strings
    if (event.payload) {
      Object.entries(event.payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data[key] = typeof value === 'string' ? value : JSON.stringify(value);
        }
      });
    }

    return data;
  }

  /**
   * Extract title from event payload or generate default
   */
  private extractTitle(event: EventEnvelope): string {
    // Check if payload has explicit title
    if (event.payload.title && typeof event.payload.title === 'string') {
      return event.payload.title;
    }

    // Check if metadata.notification has title (from handler)
    const metadata = event.metadata;
    const notificationFromMetadata = metadata?.notification as
      | Record<string, string>
      | undefined;
    if (notificationFromMetadata?.title) {
      return notificationFromMetadata.title;
    }

    // Generate title based on event type
    const titleMap: Record<string, string> = {
      'subscription.halted': '⚠️ Subscription Halted',
      'subscription.paused': '⏸️ Subscription Paused',
      'subscription.resumed': '▶️ Subscription Resumed',
      'subscription.cancelled': '❌ Subscription Cancelled',
      'payment.received': '💰 Payment Received',
      'payment.failed': '❌ Payment Failed',
      'order.completed': '✅ Order Completed',
      'order.cancelled': '❌ Order Cancelled',
      'checkout.abandoned': '🛒 Complete Your Purchase',
    };

    return titleMap[event.eventType] || this.formatEventType(event.eventType);
  }

  /**
   * Extract body from event payload or generate default
   */
  private extractBody(event: EventEnvelope): string {
    // Check if payload has explicit body/message
    if (event.payload.body && typeof event.payload.body === 'string') {
      return event.payload.body;
    }
    if (event.payload.message && typeof event.payload.message === 'string') {
      return event.payload.message;
    }

    // Check if metadata.notification has body (from handler)
    const metadata = event.metadata;
    const notificationFromMetadata = metadata?.notification as
      | Record<string, string>
      | undefined;
    if (notificationFromMetadata?.body) {
      return notificationFromMetadata.body;
    }

    // Generate body based on event type
    const payload = event.payload as Record<string, string>;

    switch (event.eventType) {
      case 'subscription.halted':
        return `Hazaron dukandaar sun rahe hain — aap nahi. Kirana se lekar pharmacy tak, sabka Soundbox bol raha hai. Aapka paused hai. Abhi restart karo.`;

      case 'subscription.paused':
        return `Your subscription has been paused. You can resume it anytime from your account settings.`;

      case 'subscription.resumed':
        return `Your subscription has been resumed successfully. Welcome back!`;

      case 'subscription.cancelled':
        return `Your subscription has been cancelled. We're sorry to see you go!`;

      case 'payment.received':
        const amount = payload.amount || '';
        const currency = payload.currency || 'INR';
        return `We received your payment of ${currency} ${amount}. Thank you!`;

      case 'payment.failed':
        return `Your payment could not be processed. Please try again with a different payment method.`;

      case 'order.completed':
        const orderId = payload.orderId || '';
        return `Your order ${orderId} has been completed successfully!`;

      case 'order.cancelled':
        return `Your order has been cancelled as requested.`;

      case 'checkout.abandoned':
        return `You left items in your cart. Complete your purchase now!`;

      default:
        return `You have a new notification regarding ${this.formatEventType(event.eventType)}.`;
    }
  }

  /**
   * Format event type for display
   */
  private formatEventType(eventType: string): string {
    return eventType
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
