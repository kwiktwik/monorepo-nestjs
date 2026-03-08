import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConversationsModule,
    MqttModule,
    RedisModule,
    BullModule.registerQueue({
      name: SCHEDULED_MESSAGES_QUEUE,
    }),
  ],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    ScheduledMessagesService,
    ScheduledMessagesProcessor,
    ChatPushNotificationService,
  ],
  exports: [MessagesService, ScheduledMessagesService],
})
export class MessagesModule {}
