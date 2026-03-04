import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { TestPollController } from './test-poll.controller';
import { AdminNotificationController } from './admin-notification.controller';
import { NotificationService } from './notification.service';

@Module({
  controllers: [
    NotificationController,
    TestPollController,
    AdminNotificationController,
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
