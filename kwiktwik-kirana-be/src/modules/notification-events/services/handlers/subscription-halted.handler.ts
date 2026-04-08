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

  private readonly NOTIFICATION_TITLE = '⚠️ Soundbox Paused';

  // Multiple message variants for A/B testing and freshness
  private readonly MESSAGE_VARIANTS = [
    // Option 1 — Loss-aversion
    'Aapka Soundbox band ho gaya. Aaj kitne payments aaye — pata hai? Ek tap mein wapas shuru karo.',
    // Option 2 — Value Reminder
    'Awaaz band, payment miss? Trial mein har UPI payment bolti thi — ab nahi bolti. Wapas on karo, 60 seconds mein.',
    // Option 3 — Social Proof
    'Hazaron dukandaar sun rahe hain — aap nahi. Kirana se lekar pharmacy tak, sabka Soundbox bol raha hai. Aapka paused hai. Abhi restart karo.',
    // Option 4 — Urgency
    'Har payment check karne ja rahe ho phone pe? Soundbox hota toh bolti. Plan paused hai — ek tap mein wapas shuru karo.',
  ];

  /**
   * Get a random message variant
   */
  private getRandomMessage(): string {
    const randomIndex = Math.floor(
      Math.random() * this.MESSAGE_VARIANTS.length,
    );
    return this.MESSAGE_VARIANTS[randomIndex];
  }

  async handle(envelope: EventEnvelope): Promise<HandlerResult> {
    this.logger.log(
      `⏸️ [SUBSCRIPTION] Handling subscription.halted for user ${envelope.userId}`,
    );

    const payload = envelope.payload as Record<string, unknown>;
    const subscriptionId = payload.subscriptionId as string;

    // Pick a random message variant
    const messageBody = this.getRandomMessage();
    this.logger.debug(`Selected message variant for user ${envelope.userId}`);

    return {
      success: true,
      detail: `Subscription halted: ${subscriptionId}`,
      metadata: {
        processedBy: 'SubscriptionHaltedHandler',
        subscriptionId,
        // Include notification copy for in-app channel
        notification: {
          title: this.NOTIFICATION_TITLE,
          body: messageBody,
        },
      },
    };
  }
}
