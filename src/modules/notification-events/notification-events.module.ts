import { Module } from '@nestjs/common';
import { NotificationEventsController } from './notification-events.controller';
import { NotificationEventsService } from './notification-events.service';
import { InMemoryEventBus } from './services/in-memory-event-bus';
import { MockInAppChannel } from './services/mock-in-app.channel';
import { MockPushChannel } from './services/mock-push.channel';
import { MockSmsChannel } from './services/mock-sms.channel';
import { NotificationEventsConsumer } from './services/notification-events.consumer';

@Module({
  controllers: [NotificationEventsController],
  providers: [
    NotificationEventsService,
    InMemoryEventBus,
    MockInAppChannel,
    MockPushChannel,
    MockSmsChannel,
    NotificationEventsConsumer,
  ],
})
export class NotificationEventsModule {}
