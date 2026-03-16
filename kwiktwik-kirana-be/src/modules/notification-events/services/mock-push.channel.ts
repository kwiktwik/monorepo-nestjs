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

  send(event: EventEnvelope): Promise<NotificationChannelResult> {
    const payloadPreview = JSON.stringify(event.payload).slice(0, 100);

    this.logger.log(
      `📱 [MOCK PUSH] Event: ${event.eventType} | User: ${event.userId} | App: ${event.appId}`,
    );
    this.logger.debug(`   Payload: ${payloadPreview}`);
    this.logger.log(`✅ [MOCK PUSH] Delivered successfully to ${event.userId}`);

    return Promise.resolve({
      channel: NotificationChannelType.Push,
      delivered: true,
      detail: 'Mock push sent',
      deliveredAt: new Date(),
    });
  }
}
