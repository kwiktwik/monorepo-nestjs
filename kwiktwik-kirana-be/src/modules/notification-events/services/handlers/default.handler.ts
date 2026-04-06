import { Logger } from '@nestjs/common';
import { EventHandler, HandlerResult } from '../event-handler.registry';
import { EventEnvelope } from '../../types/notification-event.types';

/**
 * Default handler for event types without a specific handler
 * Simply passes through to notification channels
 */
export class DefaultEventHandler implements EventHandler {
  readonly eventType = '*'; // Wildcard for any event type
  private readonly logger = new Logger(DefaultEventHandler.name);

  async handle(envelope: EventEnvelope): Promise<HandlerResult> {
    this.logger.log(
      `📋 [DEFAULT] Handling event ${envelope.eventId} of type ${envelope.eventType}`,
    );

    // Default handler just returns success - channels will handle delivery
    return {
      success: true,
      detail: 'Processed by default handler',
      metadata: {
        processedBy: 'DefaultEventHandler',
        eventType: envelope.eventType,
      },
    };
  }
}
