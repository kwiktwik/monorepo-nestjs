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

/**
 * Real In-App Notification Channel
 * Saves notifications to the database for in-app display
 */
@Injectable()
export class InAppChannel implements NotificationChannel {
  private readonly logger = new Logger(InAppChannel.name);
  readonly type = NotificationChannelType.InApp;

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async send(event: EventEnvelope): Promise<NotificationChannelResult> {
    const startTime = Date.now();

    try {
      // Extract notification content from payload
      const title = this.extractTitle(event);
      const body = this.extractBody(event);
      const notificationId = `inapp_${event.eventId}`;

      this.logger.log(
        `🔔 [IN-APP] Saving notification | User: ${event.userId} | Type: ${event.eventType}`,
      );

      // Save to database
      await this.db.insert(schema.userNotifications).values({
        userId: event.userId,
        appId: event.appId || 'default',
        notificationId,
        eventType: event.eventType,
        title,
        body,
        data: {
          ...event.payload,
          eventId: event.eventId,
          metadata: event.metadata,
        },
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.logger.log(
        `✅ [IN-APP] Notification saved successfully in ${Date.now() - startTime}ms`,
      );

      return {
        channel: NotificationChannelType.InApp,
        delivered: true,
        detail: `Notification saved: ${notificationId}`,
        deliveredAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `❌ [IN-APP] Failed to save notification: ${(error as Error).message}`,
        (error as Error).stack,
      );

      return {
        channel: NotificationChannelType.InApp,
        delivered: false,
        detail: `Failed to save notification: ${(error as Error).message}`,
        deliveredAt: new Date(),
      };
    }
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
        return `Your subscription has been paused due to payment issues. Please update your payment method to continue using our services.`;

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
