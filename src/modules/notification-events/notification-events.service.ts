import { Injectable, Logger } from '@nestjs/common';
import { NotificationEventDto } from './dto/notification-event.dto';
import {
  NotificationChannelType,
} from './types/notification-event.types';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';

@Injectable()
export class NotificationEventsService {
  private readonly logger = new Logger(NotificationEventsService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Ingest an event by persisting it to the database.
   * Returns immediately with 202 ACCEPTED - processing happens asynchronously.
   */
  async ingestEvent(userId: string, appId: string, dto: NotificationEventDto) {
    const createdAt = new Date();
    const eventId = dto.eventId ?? this.buildEventId(dto.eventType);
    const effectiveAppId = dto.appId ?? appId;

    // Store channels in payload for the consumer to use
    const payloadWithChannels = {
      ...dto.payload,
      _channels: dto.channels ?? [NotificationChannelType.InApp],
      _metadata: dto.metadata,
    };

    await this.db.insert(schema.notificationEvents).values({
      id: eventId,
      appId: effectiveAppId,
      eventName: dto.eventType,
      userId: userId,
      payload: payloadWithChannels,
      status: 'PENDING',
      retryCount: 0,
      createdAt: createdAt,
    });

    this.logger.log(`Event ${eventId} enqueued for user ${userId}`);

    return {
      accepted: true,
      eventId: eventId,
      enqueuedAt: createdAt.toISOString(),
    };
  }

  private buildEventId(eventType: string) {
    const random = Math.random().toString(36).slice(2, 10);
    return `${eventType}-${Date.now()}-${random}`;
  }
}
