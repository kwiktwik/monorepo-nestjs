import {
  Module,
  DynamicModule,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { NotificationEventsController } from './notification-events.controller';
import { NotificationEventsService } from './notification-events.service';
import { InMemoryEventBus } from './services/in-memory-event-bus';
import { MockInAppChannel } from './services/mock-in-app.channel';
import { MockPushChannel } from './services/mock-push.channel';
import { MockSmsChannel } from './services/mock-sms.channel';
import { NotificationQueueService } from './services/notification-queue.service';
import { NOTIFICATION_QUEUE_NAME } from './services/notification.processor';
import { QueueModule, isRedisAvailable } from '../../queue/queue.module';

@Module({})
export class NotificationEventsModule {
  static forRoot(config: ConfigService): DynamicModule {
    const redisAvailable = isRedisAvailable(config);

    const imports: any[] = [];
    const controllers: any[] = [];
    const providers: any[] = [
      NotificationEventsService,
      InMemoryEventBus,
      MockInAppChannel,
      MockPushChannel,
      MockSmsChannel,
    ];

    if (redisAvailable) {
      // Full module with queue support
      imports.push(
        QueueModule.forRootIfAvailable(),
        BullModule.registerQueue({
          name: NOTIFICATION_QUEUE_NAME,
        }),
      );
      controllers.push(NotificationEventsController);
      providers.push(NotificationQueueService);
      // DISABLED for now due to other issues
      // NotificationEventsConsumer,
      // NotificationProcessor,
    } else {
      // Minimal module - stub implementations
      imports.push(QueueModule.forRootIfAvailable());
      console.log(
        '[NotificationEventsModule] Redis unavailable. Queue-based notification features disabled.',
      );

      // Provide stub NotificationQueueService
      providers.push({
        provide: NotificationQueueService,
        useValue: {
          async addNotification() {
            throw new ServiceUnavailableException(
              'Notification queue service requires Redis. Please configure REDIS_URL.',
            );
          },
          async getQueueStats() {
            throw new ServiceUnavailableException(
              'Notification queue service requires Redis. Please configure REDIS_URL.',
            );
          },
          async removeJob() {
            throw new ServiceUnavailableException(
              'Notification queue service requires Redis. Please configure REDIS_URL.',
            );
          },
          async scheduleCheckoutAbandonedCheck() {
            throw new ServiceUnavailableException(
              'Notification queue service requires Redis. Please configure REDIS_URL.',
            );
          },
        },
      });
    }

    return {
      module: NotificationEventsModule,
      imports,
      controllers,
      providers,
      exports: [NotificationQueueService, NotificationEventsService],
    };
  }
}
