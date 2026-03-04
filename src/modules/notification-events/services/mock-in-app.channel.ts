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
    const payloadPreview = JSON.stringify(event.payload).slice(0, 100);
    
    this.logger.log(
      `🔔 [MOCK IN-APP] Event: ${event.eventType} | User: ${event.userId} | App: ${event.appId}`,
    );
    this.logger.debug(`   Payload: ${payloadPreview}`);
    this.logger.log(
      `✅ [MOCK IN-APP] Delivered successfully to ${event.userId}`,
    );

    return {
      channel: NotificationChannelType.InApp,
      delivered: true,
      detail: 'Mock in-app sent',
      deliveredAt: new Date(),
    };
  }
}
