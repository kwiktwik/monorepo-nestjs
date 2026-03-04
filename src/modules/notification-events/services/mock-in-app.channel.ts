import { Injectable, Logger } from '@nestjs/common';
import {
  EventEnvelope,
  NotificationChannel,
  NotificationChannelResult,
  NotificationChannelType,
} from '../types/notification-event.types';

@Injectable()
export class MockInAppChannel implements NotificationChannel {
  private readonly logger = new Logger(MockInAppChannel.name);
  readonly type = NotificationChannelType.InApp;

  async send(event: EventEnvelope): Promise<NotificationChannelResult> {
    this.logger.log(
      `Mock in-app delivered for ${event.eventType} to ${event.userId}`,
    );

    return {
      channel: NotificationChannelType.InApp,
      delivered: true,
      detail: 'Mock in-app sent',
      deliveredAt: new Date(),
    };
  }
}
