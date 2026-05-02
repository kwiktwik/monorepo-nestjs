import { Module } from '@nestjs/common';
import { SlydeeService } from './slydee.service';
import { SlydeeChatService } from './slydee-chat.service';
import { SlydeeController } from './slydee.controller';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [ConversationsModule],
  providers: [SlydeeService, SlydeeChatService],
  controllers: [SlydeeController],
  exports: [SlydeeService],
})
export class SlydeeModule {}
