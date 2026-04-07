import { Logger } from '@nestjs/common';
import { EventHandler, HandlerResult } from '../event-handler.registry';
import { EventEnvelope } from '../../types/notification-event.types';

/**
 * Handler for subscription.paused events
 * Triggered when a subscription is explicitly paused (by user or admin)
 */
export class SubscriptionPausedHandler implements EventHandler {
  readonly eventType = 'subscription.paused';
  private readonly logger = new Logger(SubscriptionPausedHandler.name);

  async handle(envelope: EventEnvelope): Promise<HandlerResult> {
    this.logger.log(
      `⏸️ [SUBSCRIPTION] Handling subscription.paused for user ${envelope.userId}`,
    );

    const payload = envelope.payload as Record<string, unknown>;
    const subscriptionId = payload.subscriptionId as string;

    // Custom logic: confirm this is intentional and check its duration, if provided
    // For now, we'll just prepare for notification dispatch

    return {
      success: true,
      detail: `Subscription paused: ${subscriptionId}`,
      metadata: {
        processedBy: 'SubscriptionPausedHandler',
        subscriptionId,
      },
    };
  }
}
