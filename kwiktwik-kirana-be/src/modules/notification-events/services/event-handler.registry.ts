import { Injectable, Logger } from '@nestjs/common';
import { EventEnvelope } from '../types/notification-event.types';

/**
 * Result returned by an event handler after processing
 */
export interface HandlerResult {
  success: boolean;
  detail?: string;
  shouldRetry?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Interface for event handlers
 * Each event type can have its own custom logic
 */
export interface EventHandler {
  handle(envelope: EventEnvelope): Promise<HandlerResult>;
  readonly eventType: string;
}

/**
 * Event Handler Registry
 * Maps event types to their handlers
 * Enables different processing logic per event type
 */
@Injectable()
export class EventHandlerRegistry {
  private readonly logger = new Logger(EventHandlerRegistry.name);
  private readonly handlers = new Map<string, EventHandler>();
  private defaultHandler?: EventHandler;

  /**
   * Register a handler for a specific event type
   */
  register(handler: EventHandler): void {
    this.handlers.set(handler.eventType, handler);
    this.logger.log(`✅ Registered handler for event type: ${handler.eventType}`);
  }

  /**
   * Set a default handler for unknown event types
   */
  setDefaultHandler(handler: EventHandler): void {
    this.defaultHandler = handler;
    this.logger.log('✅ Default handler registered');
  }

  /**
   * Get handler for an event type
   * Falls back to default handler if not found
   */
  getHandler(eventType: string): EventHandler | undefined {
    return this.handlers.get(eventType) || this.defaultHandler;
  }

  /**
   * Check if a handler exists for the given event type
   */
  hasHandler(eventType: string): boolean {
    return this.handlers.has(eventType) || !!this.defaultHandler;
  }

  /**
   * Get all registered event types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Process an event using the appropriate handler
   */
  async processEvent(envelope: EventEnvelope): Promise<HandlerResult> {
    const handler = this.getHandler(envelope.eventType);

    if (!handler) {
      this.logger.warn(
        `No handler found for event type: ${envelope.eventType}`,
      );
      return {
        success: false,
        detail: `No handler registered for event type: ${envelope.eventType}`,
      };
    }

    this.logger.log(
      `🔧 Processing event ${envelope.eventId} with handler: ${handler.eventType}`,
    );

    try {
      return await handler.handle(envelope);
    } catch (error) {
      this.logger.error(
        `Handler failed for event ${envelope.eventId}: ${(error as Error).message}`,
      );
      return {
        success: false,
        detail: (error as Error).message,
        shouldRetry: true,
      };
    }
  }
}
