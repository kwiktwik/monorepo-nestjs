import { Logger } from '@nestjs/common';
import { EventHandler, HandlerResult } from '../event-handler.registry';
import { EventEnvelope } from '../../types/notification-event.types';

/**
 * Handler for payment.received events
 * Custom logic: Validates payment data, may trigger different notifications
 */
export class PaymentReceivedHandler implements EventHandler {
  readonly eventType = 'payment.received';
  private readonly logger = new Logger(PaymentReceivedHandler.name);

  async handle(envelope: EventEnvelope): Promise<HandlerResult> {
    this.logger.log(
      `💰 [PAYMENT] Handling payment.received event ${envelope.eventId}`,
    );

    const payload = envelope.payload;

    // Validate required payment fields
    if (!payload.amount) {
      this.logger.warn(
        `Payment event ${envelope.eventId} missing amount field`,
      );
      return {
        success: false,
        detail: 'Missing required field: amount',
        shouldRetry: false,
      };
    }

    const amount = Number(payload.amount);
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        detail: 'Invalid amount value',
        shouldRetry: false,
      };
    }

    // Custom business logic: large payments might need special handling
    const isLargePayment = amount > 10000;
    if (isLargePayment) {
      this.logger.log(
        `💎 [PAYMENT] Large payment detected: ${amount} ${payload.currency || 'INR'}`,
      );
    }

    this.logger.log(
      `✅ [PAYMENT] Payment of ${amount} ${payload.currency || 'INR'} processed`,
    );

    return {
      success: true,
      detail: `Payment received: ${amount}`,
      metadata: {
        processedBy: 'PaymentReceivedHandler',
        amount,
        isLargePayment,
      },
    };
  }
}
