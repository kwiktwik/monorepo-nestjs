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
    const payloadPreview = JSON.stringify(event.payload).slice(0, 100);
    
    this.logger.log(
      `💬 [MOCK SMS] Event: ${event.eventType} | User: ${event.userId} | App: ${event.appId}`,
    );
    this.logger.debug(`   Payload: ${payloadPreview}`);
    this.logger.log(
      `✅ [MOCK SMS] Delivered successfully to ${event.userId}`,
    );

    return {
      channel: NotificationChannelType.Sms,
      delivered: true,
      detail: 'Mock SMS sent',
      deliveredAt: new Date(),
    };
  }
}
