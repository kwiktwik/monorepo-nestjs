import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { InMemoryEventBus, EventListener } from './in-memory-event-bus';
import { EventEnvelope } from '../types/notification-event.types';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../../../database/schema';

@Injectable()
export class NotificationEventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationEventsConsumer.name);
  private listener: EventListener | null = null;

  constructor(
    private readonly eventBus: InMemoryEventBus,
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  onModuleInit(): void {
    this.listener = async (event: EventEnvelope) => {
      await this.processEvent(event);
    };

    this.eventBus.addListener(this.listener);
    this.logger.log('Notification event consumer registered');
  }

  onModuleDestroy(): void {
    if (this.listener) {
      this.eventBus.removeListener(this.listener);
      this.logger.log('Notification event consumer removed');
    }
  }

  private async processEvent(event: EventEnvelope): Promise<void> {
    this.logger.log(
      `Consumer processing event ${event.eventType} for ${event.userId}`,
    );

    await this.db
      .update(schema.notificationEvents)
      .set({ status: 'PROCESSING' })
      .where(eq(schema.notificationEvents.id, event.eventId));

    try {
      // TODO: add domain-specific processing logic here

      await this.db
        .update(schema.notificationEvents)
        .set({
          status: 'COMPLETED',
          processedAt: new Date(),
        })
        .where(eq(schema.notificationEvents.id, event.eventId));
    } catch (error) {
      this.logger.error('Failed to process notification event', error as Error);
      await this.db
        .update(schema.notificationEvents)
        .set({
          status: 'FAILED',
          processedAt: new Date(),
          retryCount: sql`${schema.notificationEvents.retryCount} + 1`,
        })
        .where(eq(schema.notificationEvents.id, event.eventId));
    }
  }
}
