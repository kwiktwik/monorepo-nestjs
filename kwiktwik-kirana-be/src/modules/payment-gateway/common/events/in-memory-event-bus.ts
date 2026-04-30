/**
 * In-Memory Event Bus Implementation
 * 
 * Simple in-memory event bus for development and testing.
 * For production, use Redis or RabbitMQ implementation.
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  IEventBus,
  PaymentEvent,
  EventHandlerRegistration,
  EventHandler,
} from './event-bus.interface';

/**
 * Subscription entry for tracking handlers
 */
interface SubscriptionEntry {
  readonly id: string;
  readonly eventType: string;
  readonly handler: EventHandler;
  readonly priority: number;
}

/**
 * In-memory event bus implementation
 * 
 * Features:
 * - Synchronous handler execution
 * - Priority-based handler ordering
 * - Error isolation (one handler failure doesn't affect others)
 * - Subscription management
 */
@Injectable()
export class InMemoryEventBus implements IEventBus, OnModuleDestroy {
  private readonly logger = new Logger(InMemoryEventBus.name);
  private readonly subscriptions: Map<string, SubscriptionEntry[]> = new Map();
  private readonly allSubscriptions: Map<string, SubscriptionEntry> = new Map();
  private isShuttingDown = false;

  /**
   * Publish an event to all subscribers
   */
  async publish<T>(event: PaymentEvent<T>): Promise<void> {
    if (this.isShuttingDown) {
      this.logger.warn(`Event bus is shutting down, skipping event: ${event.eventType}`);
      return;
    }

    const handlers = this.getHandlers(event.eventType);

    if (handlers.length === 0) {
      this.logger.debug(`No handlers registered for event: ${event.eventType}`);
      return;
    }

    this.logger.debug(
      `Publishing event ${event.eventType} to ${handlers.length} handler(s) | eventId: ${event.eventId}`,
    );

    // Execute handlers in priority order (higher priority first)
    const sortedHandlers = [...handlers].sort((a, b) => 
      (b.priority ?? 0) - (a.priority ?? 0)
    );

    // Execute all handlers, catching errors individually
    const results = await Promise.allSettled(
      sortedHandlers.map(async (registration) => {
        try {
          await registration.handler(event);
        } catch (error) {
          this.logger.error(
            `Handler error for event ${event.eventType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error instanceof Error ? error.stack : undefined,
          );
          throw error;
        }
      }),
    );

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Handler ${index} failed for event ${event.eventType}: ${result.reason}`,
        );
      }
    });
  }

  /**
   * Subscribe to an event type
   * Returns an unsubscribe function
   */
  subscribe<T>(registration: EventHandlerRegistration<T>): () => void {
    const subscriptionId = this.generateSubscriptionId();
    const entry: SubscriptionEntry = {
      id: subscriptionId,
      eventType: registration.eventType,
      handler: registration.handler as EventHandler,
      priority: registration.priority ?? 0,
    };

    // Add to event-type-specific map
    const existing = this.subscriptions.get(registration.eventType) ?? [];
    this.subscriptions.set(registration.eventType, [...existing, entry]);

    // Add to all subscriptions map for easy removal
    this.allSubscriptions.set(subscriptionId, entry);

    this.logger.debug(
      `Subscribed to event: ${registration.eventType} | subscriptionId: ${subscriptionId}`,
    );

    // Return unsubscribe function
    return () => {
      this.unsubscribe(subscriptionId);
    };
  }

  /**
   * Subscribe to multiple event types
   * Returns an unsubscribe function that removes all subscriptions
   */
  subscribeToAll<T>(
    eventTypes: readonly string[],
    handler: EventHandler<T>,
  ): () => void {
    const unsubscribers = eventTypes.map((eventType) =>
      this.subscribe({ eventType, handler }),
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }

  /**
   * Get all registered handlers for an event type
   */
  getHandlers(eventType: string): readonly EventHandlerRegistration[] {
    const entries = this.subscriptions.get(eventType) ?? [];
    return entries.map((entry) => ({
      eventType: entry.eventType,
      handler: entry.handler,
      priority: entry.priority,
    }));
  }

  /**
   * Health check for the event bus
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    const totalSubscriptions = this.allSubscriptions.size;
    const eventTypes = this.subscriptions.size;

    return {
      healthy: !this.isShuttingDown,
      message: `Event bus is healthy. ${totalSubscriptions} subscriptions across ${eventTypes} event types.`,
    };
  }

  /**
   * Unsubscribe by subscription ID
   */
  private unsubscribe(subscriptionId: string): void {
    const entry = this.allSubscriptions.get(subscriptionId);
    if (!entry) {
      return;
    }

    // Remove from all subscriptions map
    this.allSubscriptions.delete(subscriptionId);

    // Remove from event-type-specific map
    const handlers = this.subscriptions.get(entry.eventType);
    if (handlers) {
      const filtered = handlers.filter((h) => h.id !== subscriptionId);
      if (filtered.length === 0) {
        this.subscriptions.delete(entry.eventType);
      } else {
        this.subscriptions.set(entry.eventType, filtered);
      }
    }

    this.logger.debug(
      `Unsubscribed from event: ${entry.eventType} | subscriptionId: ${subscriptionId}`,
    );
  }

  /**
   * Generate a unique subscription ID
   */
  private generateSubscriptionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `sub_${timestamp}_${random}`;
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy(): void {
    this.isShuttingDown = true;
    this.subscriptions.clear();
    this.allSubscriptions.clear();
    this.logger.log('Event bus shutdown complete');
  }

  /**
   * Get statistics about the event bus
   */
  getStats(): {
    totalSubscriptions: number;
    eventTypes: number;
    subscriptionsByType: Record<string, number>;
  } {
    const subscriptionsByType: Record<string, number> = {};
    
    for (const [eventType, handlers] of this.subscriptions) {
      subscriptionsByType[eventType] = handlers.length;
    }

    return {
      totalSubscriptions: this.allSubscriptions.size,
      eventTypes: this.subscriptions.size,
      subscriptionsByType,
    };
  }
}
