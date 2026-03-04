import { Injectable, Logger } from '@nestjs/common';
import {
  EventEnvelope,
  NotificationChannel,
  NotificationChannelResult,
  NotificationChannelType,
} from '../types/notification-event.types';

@Injectable()
export class MockSmsChannel implements NotificationChannel {
  private readonly logger = new Logger(MockSmsChannel.name);
  readonly type = NotificationChannelType.Sms;

  async send(event: EventEnvelope): Promise<NotificationChannelResult> {
    this.logger.log(
      `Mock SMS delivered for ${event.eventType} to ${event.userId}`,
    );

    return {
      channel: NotificationChannelType.Sms,
      delivered: true,
      detail: 'Mock SMS sent',
      deliveredAt: new Date(),
    };
  }
}
