import { Injectable } from '@nestjs/common';
import { NotificationEventDto } from './dto/notification-event.dto';
import {
  EventEnvelope,
  NotificationChannelType,
} from './types/notification-event.types';
import { InMemoryEventBus } from './services/in-memory-event-bus';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';

@Injectable()
export class NotificationEventsService {
  constructor(
    private readonly eventBus: InMemoryEventBus,
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async ingestEvent(userId: string, appId: string, dto: NotificationEventDto) {
    const createdAt = new Date();
    const targets = dto.channels ?? [NotificationChannelType.InApp];

    const envelope: EventEnvelope = {
      eventId: dto.eventId ?? this.buildEventId(dto.eventType),
      appId: dto.appId ?? appId,
      userId,
      eventType: dto.eventType,
      payload: dto.payload ?? {},
      channels: targets,
      createdAt,
      metadata: dto.metadata,
    };

    await this.db.insert(schema.notificationEvents).values({
      id: envelope.eventId,
      appId: envelope.appId ?? appId,
      eventName: envelope.eventType,
      userId: envelope.userId,
      payload: envelope.payload,
      status: 'PENDING',
      retryCount: 0,
      createdAt: createdAt,
    });

    const results = await this.eventBus.publish(envelope);

    return {
      accepted: true,
      eventId: envelope.eventId,
      processedAt: createdAt.toISOString(),
      results,
    };
  }

  private buildEventId(eventType: string) {
    const random = Math.random().toString(36).slice(2, 10);
    return `${eventType}-${Date.now()}-${random}`;
  }
}
