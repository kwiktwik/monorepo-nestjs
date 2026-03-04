import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationEventsController } from './notification-events.controller';
import { NotificationEventsService } from './notification-events.service';
import { InMemoryEventBus } from './services/in-memory-event-bus';
import { MockInAppChannel } from './services/mock-in-app.channel';
import { MockPushChannel } from './services/mock-push.channel';
import { MockSmsChannel } from './services/mock-sms.channel';
import { NotificationEventsConsumer } from './services/notification-events.consumer';
import { NotificationQueueService } from './services/notification-queue.service';
import { NotificationProcessor, NOTIFICATION_QUEUE_NAME } from './services/notification.processor';
import { QueueModule } from '../../queue/queue.module';

@Module({
  imports: [
    QueueModule.forRoot(),
    // Register the notification queue
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE_NAME,
    }),
  ],
  controllers: [NotificationEventsController],
  providers: [
    NotificationEventsService,
    InMemoryEventBus,
    MockInAppChannel,
    MockPushChannel,
    MockSmsChannel,
    NotificationEventsConsumer,
    NotificationQueueService,
    NotificationProcessor, // Processor handles job processing
  ],
  exports: [NotificationQueueService, NotificationEventsService],
})
export class NotificationEventsModule {}
