import {
  Injectable,
  Logger,
  Inject,
  ConflictException,
  Optional,
} from '@nestjs/common';
import { NotificationEventDto } from './dto/notification-event.dto';
import { NotificationChannelType } from './types/notification-event.types';
import { NotificationQueueService } from './services/notification-queue.service';
import { RedisService } from '../../common/redis/redis.service';
import { AnalyticsService } from '../analytics/analytics.service';

/**
 * Schema validation rules per event type
 * Add more schemas here as event types are added
 */
const EVENT_SCHEMAS: Record<string, (payload: Record<string, unknown>) => string | null> = {
  'payment.received': (payload) => {
    if (!payload.amount) return 'Missing required field: amount';
    if (typeof payload.amount !== 'number' && isNaN(Number(payload.amount)))
      return 'Invalid amount: must be a number';
    return null;
  },
  'order.completed': (payload) => {
    if (!payload.orderId) return 'Missing required field: orderId';
    return null;
  },
  'checkout.abandoned': (payload) => {
    // orderId is optional for checkout abandoned
    return null;
  },
  'subscription.halted': (payload) => {
    if (!payload.subscriptionId) return 'Missing required field: subscriptionId';
    return null;
  },
  'subscription.paused': (payload) => {
    if (!payload.subscriptionId) return 'Missing required field: subscriptionId';
    return null;
  },
};

/**
 * Idempotency TTL in seconds (24 hours)
 */
const IDEMPOTENCY_TTL_SECONDS = 86400;

/**
 * Queue-First Notification Events Service
 *
 * High-scale optimized:
 * - Redis SETNX for idempotency (sub-millisecond)
 * - BullMQ enqueue for processing
 * - No DB writes on happy path
 * - Mixpanel tracking via AnalyticsService
 */
@Injectable()
export class NotificationEventsService {
  private readonly logger = new Logger(NotificationEventsService.name);

  constructor(
    private readonly queueService: NotificationQueueService,
    @Optional()
    private readonly redisService?: RedisService,
    @Optional()
    private readonly analyticsService?: AnalyticsService,
  ) {}

  /**
   * Ingest an event - QUEUE-FIRST, HIGH-SCALE approach.
   *
   * Flow:
   * 1. Validate schema
   * 2. Redis SETNX idempotency check (fast, no DB)
   * 3. Enqueue to BullMQ immediately
   * 4. Return 202 ACCEPTED
   *
   * NO DB writes on happy path - pure queue-based processing.
   * Event tracking done via Mixpanel (AnalyticsService).
   */
  async ingestEvent(userId: string, appId: string, dto: NotificationEventDto) {
    const createdAt = new Date();
    const eventId = dto.eventId ?? this.buildEventId(dto.eventType);
    // SECURITY: Always use appId from X-App-ID header, never from POST body
    const effectiveAppId = appId;

    // Schema validation per event type
    const validationError = this.validateEvent(dto.eventType, dto.payload || {});
    if (validationError) {
      this.logger.warn(
        `Validation failed for event ${eventId}: ${validationError}`,
      );
      throw new ConflictException({
        message: 'Event validation failed',
        error: validationError,
        eventType: dto.eventType,
      });
    }

    // Idempotency check via Redis (sub-millisecond, no DB)
    const isDuplicate = await this.checkIdempotency(eventId);
    if (isDuplicate) {
      this.logger.log(`Event ${eventId} is a duplicate - returning early`);
      return {
        accepted: true,
        eventId: eventId,
        enqueuedAt: createdAt.toISOString(),
        status: 'COMPLETED',
        isDuplicate: true,
      };
    }

    // Store channels in payload for the processor to use
    const payloadWithChannels = {
      ...dto.payload,
      _channels: dto.channels ?? [NotificationChannelType.InApp],
      _metadata: dto.metadata,
    };

    this.logger.log(`Event ${eventId} enqueued for user ${userId}`);

    // Enqueue to BullMQ for immediate processing (queue-first)
    try {
      await this.queueService.scheduleDelayedEvent(
        {
          eventId,
          appId: effectiveAppId,
          userId,
          eventType: dto.eventType,
          payload: payloadWithChannels,
          channels: dto.channels ?? [NotificationChannelType.InApp],
          metadata: dto.metadata,
        },
        0, // Process immediately (0 delay)
      );
      this.logger.log(`Event ${eventId} queued for processing`);

      // Track event ingestion to Mixpanel (non-blocking)
      this.trackEventToMixpanel(appId, 'notification_event_ingested', {
        eventId,
        eventType: dto.eventType,
        userId,
        channels: dto.channels ?? [NotificationChannelType.InApp],
      });
    } catch (error) {
      this.logger.warn(
        `Could not queue event ${eventId} (Redis may be unavailable): ${(error as Error).message}`,
      );
      // Still return 202 - processor will pick up when available
    }

    return {
      accepted: true,
      eventId: eventId,
      enqueuedAt: createdAt.toISOString(),
    };
  }

  /**
   * Check idempotency using Redis SETNX (fast, no DB)
   * Returns true if eventId already processed recently
   */
  private async checkIdempotency(eventId: string): Promise<boolean> {
    if (!this.redisService || !this.redisService.isRedisEnabled()) {
      // Redis not available - skip idempotency check
      // (BullMQ will handle duplicates via jobId if configured)
      return false;
    }

    try {
      const client = this.redisService.getClient();
      if (!client) return false;

      const key = `notification:idempotency:${eventId}`;
      // SETNX returns 1 if key was set (new), 0 if already exists (duplicate)
      const result = await client.setnx(key, '1');
      if (result === 1) {
        // New event - set TTL
        await client.expire(key, IDEMPOTENCY_TTL_SECONDS);
        return false; // Not a duplicate
      }
      return true; // Duplicate
    } catch (error) {
      this.logger.warn(`Idempotency check failed for ${eventId}: ${(error as Error).message}`);
      return false; // On error, proceed (fail-open)
    }
  }

  /**
   * Track event to Mixpanel (non-blocking, fire-and-forget)
   */
  private trackEventToMixpanel(
    appId: string,
    eventName: string,
    properties: Record<string, unknown>,
  ): void {
    if (!this.analyticsService) return;

    try {
      // Convert unknown values to string | number | boolean | undefined for EventProperties
      const eventProps: Record<string, string | number | boolean | undefined> = {};
      for (const [key, value] of Object.entries(properties)) {
        if (value === undefined || value === null) {
          eventProps[key] = undefined;
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          eventProps[key] = value;
        } else {
          // Convert complex types to string
          eventProps[key] = JSON.stringify(value);
        }
      }

      // Fire and forget - don't block response
      this.analyticsService
        .sendEvent({
          eventName,
          appId,
          userData: {
            userId: properties.userId as string | undefined,
          },
          eventProperties: eventProps,
        })
        .catch((err) => {
          this.logger.debug(`Mixpanel track failed (non-critical): ${err.message}`);
        });
    } catch (error) {
      // Non-critical - just log
      this.logger.debug(`Mixpanel track error: ${(error as Error).message}`);
    }
  }

  /**
   * Validate event payload against schema for the event type
   */
  private validateEvent(
    eventType: string,
    payload: Record<string, unknown>,
  ): string | null {
    const validator = EVENT_SCHEMAS[eventType];
    if (!validator) {
      // No schema defined - allow any payload (for flexibility)
      return null;
    }
    return validator(payload);
  }

  private buildEventId(eventType: string) {
    const random = Math.random().toString(36).slice(2, 10);
    return `${eventType}-${Date.now()}-${random}`;
  }
}
