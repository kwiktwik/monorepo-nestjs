import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationController } from './notification.controller';
import { TestPollController } from './test-poll.controller';
import { AdminNotificationController } from './admin-notification.controller';
import { NotificationService } from './notification.service';
import { NotificationEventsModule } from '../notification-events/notification-events.module';
import { RedisModule } from '../../common/redis/redis.module';
import {
  NOTIFICATION_LOG_QUEUE_NAME,
  NotificationLogProcessor,
} from './notification-log-queue.processor';
import { NotificationLogQueueService } from './notification-log-queue.service';

@Module({
  imports: [
    NotificationEventsModule,
    RedisModule,
    BullModule.registerQueue({
      name: NOTIFICATION_LOG_QUEUE_NAME,
    }),
  ],
  controllers: [
    NotificationController,
    TestPollController,
    AdminNotificationController,
  ],
  providers: [NotificationService, NotificationLogProcessor, NotificationLogQueueService],
  exports: [NotificationService, NotificationLogQueueService],
})
export class NotificationModule {}
