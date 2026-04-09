import { Logger } from '@nestjs/common';
import { EventHandler, HandlerResult } from '../event-handler.registry';
import { EventEnvelope } from '../../types/notification-event.types';

/**
 * Handler for order.completed events
 * Custom logic: May trigger receipt, loyalty points, etc.
 */
export class OrderCompletedHandler implements EventHandler {
  readonly eventType = 'order.completed';
  private readonly logger = new Logger(OrderCompletedHandler.name);

  async handle(envelope: EventEnvelope): Promise<HandlerResult> {
    this.logger.log(
      `📦 [ORDER] Handling order.completed event ${envelope.eventId}`,
    );

    const payload = envelope.payload;

    // Validate required fields
    if (!payload.orderId) {
      return {
        success: false,
        detail: 'Missing required field: orderId',
        shouldRetry: false,
      };
    }

    this.logger.log(
      `✅ [ORDER] Order ${payload.orderId} completed for user ${envelope.userId}`,
    );

    return {
      success: true,
      detail: `Order ${payload.orderId} completed`,
      metadata: {
        processedBy: 'OrderCompletedHandler',
        orderId: payload.orderId,
      },
    };
  }
}
