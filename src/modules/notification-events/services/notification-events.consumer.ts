import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { InMemoryEventBus } from './in-memory-event-bus';
import { EventEnvelope, NotificationChannelType } from '../types/notification-event.types';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and, inArray } from 'drizzle-orm';
import * as schema from '../../../database/schema';
import { isMockMode } from '../../../common/utils/is-mock-mode';

/**
 * Configuration for the batch processor.
 * In production, these could be moved to environment variables.
 */
const PROCESSING_INTERVAL_MS = 5000; // Process every 5 seconds
const BATCH_SIZE = 10; // Max events to process per batch

@Injectable()
export class NotificationEventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationEventsConsumer.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly eventBus: InMemoryEventBus,
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  onModuleInit(): void {
    this.logger.log('Starting notification events batch processor...');
    this.logger.log(`Mock mode: ${isMockMode()}`);
    this.logger.log(`Processing interval: ${PROCESSING_INTERVAL_MS}ms, Batch size: ${BATCH_SIZE}`);

    // Start the polling interval
    this.intervalId = setInterval(() => {
      this.processBatch().catch((error) => {
        this.logger.error('Error in batch processing loop', error as Error);
      });
    }, PROCESSING_INTERVAL_MS);

    this.logger.log('Notification events batch processor started');
  }

  onModuleDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.log('Notification events batch processor stopped');
    }
  }

  /**
   * Process a batch of pending events from the database.
   */
  private async processBatch(): Promise<void> {
    // Fetch pending events with a limit
    const pendingEvents = await this.db
      .select()
      .from(schema.notificationEvents)
      .where(eq(schema.notificationEvents.status, 'PENDING'))
      .limit(BATCH_SIZE);

    if (pendingEvents.length === 0) {
      return; // No events to process
    }

    this.logger.log(`Processing ${pendingEvents.length} pending event(s)`);

    // Process events in parallel for better throughput
    const results = await Promise.allSettled(
      pendingEvents.map((event) => this.processEvent(event)),
    );

    // Log any failures
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to process event ${pendingEvents[i].id}:`,
          result.reason,
        );
      }
    }
  }

  /**
   * Process a single event from the database.
   */
  private async processEvent(
    event: typeof schema.notificationEvents.$inferSelect,
  ): Promise<void> {
    this.logger.log(
      `Processing event ${event.eventName} (${event.id}) for user ${event.userId}`,
    );

    // Mark as PROCESSING
    await this.db
      .update(schema.notificationEvents)
      .set({ status: 'PROCESSING' })
      .where(eq(schema.notificationEvents.id, event.id));

    try {
      // Extract channels and metadata from payload
      const payload = event.payload as Record<string, unknown>;
      const channels = (payload._channels as NotificationChannelType[]) ?? [
        NotificationChannelType.InApp,
      ];
      const metadata = payload._metadata as Record<string, unknown> | undefined;

      // Build the event envelope for the event bus
      const envelope: EventEnvelope = {
        eventId: event.id,
        appId: event.appId,
        userId: event.userId,
        eventType: event.eventName,
        payload: payload,
        channels: channels,
        createdAt: event.createdAt,
        metadata: metadata,
      };

      // Publish through the event bus (handles channel routing)
      const results = await this.eventBus.publish(envelope);

      // Check if all channels succeeded
      const allSucceeded = results.every((r) => r.delivered);

      if (allSucceeded) {
        await this.db
          .update(schema.notificationEvents)
          .set({
            status: 'COMPLETED',
            processedAt: new Date(),
          })
          .where(eq(schema.notificationEvents.id, event.id));

        this.logger.log(`Event ${event.id} completed successfully`);
      } else {
        // Some channels failed - mark as completed but log the partial failure
        const failedChannels = results
          .filter((r) => !r.delivered)
          .map((r) => r.channel);

        this.logger.warn(
          `Event ${event.id} completed with partial failures: ${failedChannels.join(', ')}`,
        );

        await this.db
          .update(schema.notificationEvents)
          .set({
            status: 'COMPLETED',
            processedAt: new Date(),
          })
          .where(eq(schema.notificationEvents.id, event.id));
      }
    } catch (error) {
      this.logger.error(`Failed to process event ${event.id}`, error as Error);

      await this.db
        .update(schema.notificationEvents)
        .set({
          status: 'FAILED',
          processedAt: new Date(),
          retryCount: sql`${schema.notificationEvents.retryCount} + 1`,
        })
        .where(eq(schema.notificationEvents.id, event.id));

      throw error;
    }
  }
}
