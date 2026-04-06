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
import {
  NOTIFICATION_QUEUE_NAME,
  NotificationProcessor,
} from './services/notification.processor';
import { EventHandlerRegistry } from './services/event-handler.registry';
import { DefaultEventHandler } from './services/handlers/default.handler';
import { PaymentReceivedHandler } from './services/handlers/payment-received.handler';
import { OrderCompletedHandler } from './services/handlers/order-completed.handler';
import { QueueModule, isRedisAvailable } from '../../queue/queue.module';
import { RedisModule } from '../../common/redis/redis.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({})
export class NotificationEventsModule {
  static forRoot(config: ConfigService): DynamicModule {
    const redisAvailable = isRedisAvailable(config);

    const imports: DynamicModule['imports'] = [
      // Redis for idempotency (queue-first, high-scale)
      RedisModule,
      // Analytics for Mixpanel tracking
      AnalyticsModule,
    ];
    const controllers: DynamicModule['controllers'] = [];
    const providers: DynamicModule['providers'] = [
      NotificationEventsService,
      InMemoryEventBus,
      MockInAppChannel,
      MockPushChannel,
      MockSmsChannel,
      EventHandlerRegistry,
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
      providers.push(
        NotificationQueueService,
        // Enable queue-based processor with event-type routing
        NotificationProcessor,
      );

      // Register event handlers - add more handlers here as needed
      // This enables different processing logic per event type
      providers.push({
        provide: 'EVENT_HANDLERS',
        useFactory: (registry: EventHandlerRegistry) => {
          // Register all handlers
          registry.register(new PaymentReceivedHandler());
          registry.register(new OrderCompletedHandler());
          registry.setDefaultHandler(new DefaultEventHandler());
          return registry;
        },
        inject: [EventHandlerRegistry],
      });
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
          addNotification() {
            throw new ServiceUnavailableException(
              'Notification queue service requires Redis. Please configure REDIS_URL.',
            );
          },
          getQueueStats() {
            throw new ServiceUnavailableException(
              'Notification queue service requires Redis. Please configure REDIS_URL.',
            );
          },
          removeJob() {
            throw new ServiceUnavailableException(
              'Notification queue service requires Redis. Please configure REDIS_URL.',
            );
          },
          scheduleCheckoutAbandonedCheck() {
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
      exports: [
        NotificationQueueService,
        NotificationEventsService,
        EventHandlerRegistry,
      ],
    };
  }
}
