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
      },
    };
  }
}
