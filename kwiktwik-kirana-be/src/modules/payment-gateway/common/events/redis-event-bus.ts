import { Logger, OnModuleDestroy } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  IEventBus,
  PaymentEvent,
  EventHandlerRegistration,
  EventHandler,
} from './event-bus.interface';
import { RedisService } from '../../../../common/redis/redis.service';
import { paymentEvents } from '../../database/schema';

const CHANNEL_PREFIX = 'payment:events:';

interface SubscriptionEntry {
  readonly id: string;
  readonly eventType: string;
  readonly handler: EventHandler;
  readonly priority: number;
}

export class RedisEventBus implements IEventBus, OnModuleDestroy {
  private readonly logger = new Logger(RedisEventBus.name);
  private readonly subscriptions: Map<string, SubscriptionEntry[]> = new Map();
  private readonly allSubscriptions: Map<string, SubscriptionEntry> = new Map();
  private readonly subscribedChannels: Set<string> = new Set();
  private isShuttingDown = false;
  private listenerAttached = false;

  constructor(
    private readonly redisService: RedisService,
    private readonly db: NodePgDatabase<any>,
  ) {
    this.attachMessageListener();
  }

  async publish<T>(event: PaymentEvent<T>): Promise<void> {
    if (this.isShuttingDown) return;

    // Persist to DB for audit trail
    try {
      await this.db.insert(paymentEvents).values({
        id: event.eventId,
        eventType: event.eventType,
        payload: event.payload as Record<string, unknown>,
        metadata: event.metadata as Record<string, unknown>,
      });
    } catch (error) {
      this.logger.error(
        `Failed to persist event ${event.eventId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Publish to Redis for real-time subscribers
    const pubClient = this.redisService.getPubClient();
    if (pubClient) {
      try {
        const channel = `${CHANNEL_PREFIX}${event.eventType}`;
        await pubClient.publish(channel, JSON.stringify(event));
      } catch (error) {
        this.logger.error(
          `Failed to publish event ${event.eventType} to Redis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Also dispatch locally for in-process handlers
    await this.dispatchLocally(event);
  }

  subscribe<T>(registration: EventHandlerRegistration<T>): () => void {
    const subscriptionId = this.generateSubscriptionId();
    const entry: SubscriptionEntry = {
      id: subscriptionId,
      eventType: registration.eventType,
      handler: registration.handler as EventHandler,
      priority: registration.priority ?? 0,
    };

    const existing = this.subscriptions.get(registration.eventType) ?? [];
    this.subscriptions.set(registration.eventType, [...existing, entry]);
    this.allSubscriptions.set(subscriptionId, entry);

    // Subscribe to Redis channel for this event type
    this.subscribeToChannel(registration.eventType);

    return () => this.unsubscribe(subscriptionId);
  }

  subscribeToAll<T>(
    eventTypes: readonly string[],
    handler: EventHandler<T>,
  ): () => void {
    const unsubscribers = eventTypes.map((eventType) =>
      this.subscribe({ eventType, handler }),
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }

  getHandlers(eventType: string): readonly EventHandlerRegistration[] {
    const entries = this.subscriptions.get(eventType) ?? [];
    return entries.map((entry) => ({
      eventType: entry.eventType,
      handler: entry.handler,
      priority: entry.priority,
    }));
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    if (this.isShuttingDown) {
      return { healthy: false, message: 'Event bus is shutting down' };
    }

    const redisEnabled = this.redisService.isRedisEnabled();
    const totalSubscriptions = this.allSubscriptions.size;
    const eventTypes = this.subscriptions.size;

    return {
      healthy: true,
      message: `Redis=${redisEnabled ? 'connected' : 'unavailable'}, ${totalSubscriptions} subscriptions across ${eventTypes} event types`,
    };
  }

  onModuleDestroy(): void {
    this.isShuttingDown = true;
    this.subscriptions.clear();
    this.allSubscriptions.clear();
    this.subscribedChannels.clear();
    this.logger.log('Redis event bus shutdown complete');
  }

  private async dispatchLocally<T>(event: PaymentEvent<T>): Promise<void> {
    const handlers = this.getHandlers(event.eventType);
    if (handlers.length === 0) return;

    const sorted = [...handlers].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    const results = await Promise.allSettled(
      sorted.map(async (reg) => {
        try {
          await reg.handler(event);
        } catch (error) {
          this.logger.error(
            `Handler error for ${event.eventType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          throw error;
        }
      }),
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.error(`Handler failed for ${event.eventType}: ${result.reason}`);
      }
    }
  }

  private attachMessageListener(): void {
    if (this.listenerAttached) return;

    const subClient = this.redisService.getSubClient();
    if (!subClient) return;

    subClient.on('message', (_channel: string, message: string) => {
      // Messages from Redis are handled by dispatchLocally during publish.
      // Cross-process messaging can be added here if needed in the future.
    });

    this.listenerAttached = true;
  }

  private subscribeToChannel(eventType: string): void {
    const channel = `${CHANNEL_PREFIX}${eventType}`;
    if (this.subscribedChannels.has(channel)) return;

    const subClient = this.redisService.getSubClient();
    if (!subClient) return;

    subClient.subscribe(channel).catch((err) => {
      this.logger.error(`Failed to subscribe to ${channel}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    });
    this.subscribedChannels.add(channel);
  }

  private unsubscribe(subscriptionId: string): void {
    const entry = this.allSubscriptions.get(subscriptionId);
    if (!entry) return;

    this.allSubscriptions.delete(subscriptionId);

    const handlers = this.subscriptions.get(entry.eventType);
    if (handlers) {
      const filtered = handlers.filter((h) => h.id !== subscriptionId);
      if (filtered.length === 0) {
        this.subscriptions.delete(entry.eventType);
      } else {
        this.subscriptions.set(entry.eventType, filtered);
      }
    }
  }

  private generateSubscriptionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `sub_${timestamp}_${random}`;
  }
}