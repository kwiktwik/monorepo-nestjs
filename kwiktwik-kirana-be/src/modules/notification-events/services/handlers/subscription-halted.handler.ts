import { Logger } from '@nestjs/common';
import { EventHandler, HandlerResult } from '../event-handler.registry';
import { EventEnvelope } from '../../types/notification-event.types';

/**
 * Handler for subscription.halted events
 * Triggered when a subscription is halted (usually due to multiple payment failures)
 */
export class SubscriptionHaltedHandler implements EventHandler {
  readonly eventType = 'subscription.halted';
  private readonly logger = new Logger(SubscriptionHaltedHandler.name);

  // Notification copy for halted subscriptions
  private readonly NOTIFICATION_TITLE = '⚠️ Subscription Halted';
  private readonly NOTIFICATION_BODY =
    'Your subscription has been paused due to payment issues. Please update your payment method to continue using our services.';

  async handle(envelope: EventEnvelope): Promise<HandlerResult> {
    this.logger.log(
      `⏸️ [SUBSCRIPTION] Handling subscription.halted for user ${envelope.userId}`,
    );

    const payload = envelope.payload as Record<string, unknown>;
    const subscriptionId = payload.subscriptionId as string;

    // Custom logic: we could check if this is the first or subsequent failure
    // For now, we'll just prepare for notification dispatch

    return {
      success: true,
      detail: `Subscription halted: ${subscriptionId}`,
      metadata: {
        processedBy: 'SubscriptionHaltedHandler',
        subscriptionId,
        // Include notification copy for in-app channel
        notification: {
          title: this.NOTIFICATION_TITLE,
          body: this.NOTIFICATION_BODY,
        },
      },
    };
  }
}
