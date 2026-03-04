import { Injectable, Logger } from '@nestjs/common';
import {
  EventEnvelope,
  NotificationChannel,
  NotificationChannelResult,
  NotificationChannelType,
} from '../types/notification-event.types';

@Injectable()
export class MockPushChannel implements NotificationChannel {
  private readonly logger = new Logger(MockPushChannel.name);
  readonly type = NotificationChannelType.Push;

  async send(event: EventEnvelope): Promise<NotificationChannelResult> {
    this.logger.log(
      `Mock push delivered for ${event.eventType} to ${event.userId}`,
    );

    return {
      channel: NotificationChannelType.Push,
      delivered: true,
      detail: 'Mock push sent',
      deliveredAt: new Date(),
    };
  }
}
