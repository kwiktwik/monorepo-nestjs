import { Injectable, Logger } from '@nestjs/common';
import {
  EventEnvelope,
  NotificationChannel,
  NotificationChannelResult,
  NotificationChannelType,
} from '../types/notification-event.types';
import { MockInAppChannel } from './mock-in-app.channel';
import { MockPushChannel } from './mock-push.channel';
import { MockSmsChannel } from './mock-sms.channel';

export type EventListener = (event: EventEnvelope) => Promise<void> | void;

@Injectable()
export class InMemoryEventBus {
  private readonly logger = new Logger(InMemoryEventBus.name);
  private readonly channelMap: Record<NotificationChannelType, NotificationChannel>;
  private readonly listeners = new Set<EventListener>();

  constructor(
    mockSmsChannel: MockSmsChannel,
    mockPushChannel: MockPushChannel,
    mockInAppChannel: MockInAppChannel,
  ) {
    this.channelMap = {
      [NotificationChannelType.Sms]: mockSmsChannel,
      [NotificationChannelType.Push]: mockPushChannel,
      [NotificationChannelType.InApp]: mockInAppChannel,
    };
  }

  addListener(listener: EventListener) {
    this.listeners.add(listener);
  }

  removeListener(listener: EventListener) {
    this.listeners.delete(listener);
  }

  async publish(event: EventEnvelope): Promise<NotificationChannelResult[]> {
    const targets = event.channels.length
      ? event.channels
      : [NotificationChannelType.InApp];

    const results: NotificationChannelResult[] = [];

    for (const channelType of targets) {
      const channel = this.channelMap[channelType];
      if (!channel) {
        results.push({
          channel: channelType,
          delivered: false,
          detail: 'Unknown channel',
          deliveredAt: new Date(),
        });
        continue;
      }

      try {
        const result = await channel.send(event);
        results.push(result);
      } catch (error) {
        this.logger.warn(`Failed to deliver ${channelType}`, error as Error);
        results.push({
          channel: channelType,
          delivered: false,
          detail: error instanceof Error ? error.message : 'Delivery failed',
          deliveredAt: new Date(),
        });
      }
    }

    await this.notifyListeners(event);

    return results;
  }

  private async notifyListeners(event: EventEnvelope) {
    if (!this.listeners.size) return;

    const listeners = Array.from(this.listeners);
    await Promise.allSettled(
      listeners.map(async (listener) => {
        try {
          await listener(event);
        } catch (error) {
          this.logger.warn('Listener failed to process event', error as Error);
        }
      }),
    );
  }
}
