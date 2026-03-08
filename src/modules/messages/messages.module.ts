import {
  Module,
  DynamicModule,
  Provider,
  BadRequestException,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ConversationsModule } from '../conversations/conversations.module';
import { MqttModule } from '../../common/mqtt/mqtt.module';
import { RedisModule } from '../../common/redis/redis.module';
import {
  ScheduledMessagesService,
  SCHEDULED_MESSAGES_QUEUE,
} from './scheduled-messages.service';
import { ScheduledMessagesProcessor } from './scheduled-messages.processor';
import { ChatPushNotificationService } from './chat-push-notification.service';
import {
  QueueModule,
  isRedisAvailable,
  QUEUES_ENABLED,
} from '../../queue/queue.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class MessagesModule {
  static forRoot(config: ConfigService): DynamicModule {
    const redisAvailable = isRedisAvailable(config);

    const imports: any[] = [
      ConversationsModule,
      MqttModule,
      RedisModule,
      QueueModule.forRootIfAvailable(),
    ];

    const providers: Provider[] = [
      MessagesService,
      ChatPushNotificationService,
    ];

    if (redisAvailable) {
      // Add BullModule and queue-dependent services
      imports.push(
        BullModule.registerQueue({
          name: SCHEDULED_MESSAGES_QUEUE,
        }),
      );
      providers.push(ScheduledMessagesService, ScheduledMessagesProcessor);
    } else {
      // Provide a stub service that throws clear errors
      providers.push({
        provide: ScheduledMessagesService,
        useValue: {
          async scheduleMessage() {
            throw new BadRequestException(
              'Scheduled messages require Redis. Please configure REDIS_URL.',
            );
          },
          async getScheduledMessages(conversationId: string, userId: string) {
            return [];
          },
          async getUserScheduledMessages(userId: string) {
            return [];
          },
          async cancelScheduledMessage(messageId: string, userId: string) {
            throw new BadRequestException(
              'Scheduled messages require Redis. Please configure REDIS_URL.',
            );
          },
          async processScheduledMessage(scheduledMessageId: string) {
            throw new BadRequestException(
              'Scheduled messages require Redis. Please configure REDIS_URL.',
            );
          },
        },
      });
      console.log(
        '[MessagesModule] Redis unavailable. Scheduled messages feature disabled.',
      );
    }

    return {
      module: MessagesModule,
      imports,
      controllers: [MessagesController],
      providers,
      exports: [MessagesService, ScheduledMessagesService],
    };
  }
}
