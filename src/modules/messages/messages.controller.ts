import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppId } from '../../common/decorators/app-id.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';

@ApiTags('messages')
@Controller('messages')
@UseGuards(AppIdGuard, JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private scheduledMessagesService: ScheduledMessagesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.messagesService.send(
      dto.conversationId,
      user.userId,
      dto.content,
      appId,
      dto.type as any,
      dto.replyToId,
    );
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async getMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
    @Query('after') after?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.messagesService.getMessages(
      conversationId,
      user.userId,
      limit ? parseInt(limit) : 50,
      before,
      after,
      cursor,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit a message' })
  @ApiResponse({ status: 200, description: 'Message edited' })
  async editMessage(
    @Param('id') messageId: string,
    @Body() dto: EditMessageDto,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.messagesService.edit(
      messageId,
      user.userId,
      dto.content,
      appId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted' })
  async deleteMessage(
    @Param('id') messageId: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.messagesService.delete(messageId, user.userId, appId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markAsRead(
    @Param('id') messageId: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.messagesService.markAsRead(messageId, user.userId, appId);
  }

  @Get(':id/read-receipts')
  @ApiOperation({ summary: 'Get read receipts for a message' })
  @ApiResponse({ status: 200, description: 'Read receipts' })
  async getReadReceipts(
    @Param('id') messageId: string,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.getReadReceipts(messageId, user.userId);
  }

  @Post('typing/:conversationId')
  @ApiOperation({ summary: 'Set typing indicator' })
  @ApiResponse({ status: 200, description: 'Typing indicator set' })
  async setTyping(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    await this.messagesService.setTyping(conversationId, user.userId, appId);
    return { message: 'Typing indicator set' };
  }

  @Delete('typing/:conversationId')
  @ApiOperation({ summary: 'Remove typing indicator' })
  @ApiResponse({ status: 200, description: 'Typing indicator removed' })
  async stopTyping(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    await this.messagesService.stopTyping(conversationId, user.userId, appId);
    return { message: 'Typing indicator removed' };
  }

  @Get('typing/:conversationId')
  @ApiOperation({ summary: 'Get typing users' })
  @ApiResponse({ status: 200, description: 'List of typing users' })
  async getTypingUsers(@Param('conversationId') conversationId: string) {
    const userIds = await this.messagesService.getTypingUsers(conversationId);
    return { typingUsers: userIds };
  }

  @Post(':id/react')
  @ApiOperation({ summary: 'Add or update reaction on a message' })
  @ApiResponse({ status: 200, description: 'Reaction added/updated' })
  async addReaction(
    @Param('id') messageId: string,
    @Body('reaction') reaction: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.messagesService.addReaction(
      messageId,
      user.userId,
      reaction,
      appId,
    );
  }

  @Delete(':id/react')
  @ApiOperation({ summary: 'Remove reaction from a message' })
  @ApiResponse({ status: 200, description: 'Reaction removed' })
  async removeReaction(
    @Param('id') messageId: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.messagesService.removeReaction(messageId, user.userId, appId);
  }

  @Get(':id/reactions')
  @ApiOperation({ summary: 'Get reactions for a message' })
  @ApiResponse({ status: 200, description: 'List of reactions' })
  async getReactions(@Param('id') messageId: string, @CurrentUser() user: any) {
    return this.messagesService.getReactions(messageId, user.userId);
  }

  @Post('media')
  @ApiOperation({ summary: 'Send a media message' })
  @ApiResponse({ status: 201, description: 'Media message sent' })
  async sendMediaMessage(
    @Body()
    dto: {
      conversationId: string;
      type: string;
      url: string;
      thumbnailUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      width?: number;
      height?: number;
      duration?: number;
      replyToId?: string;
    },
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.messagesService.sendMediaMessage(
      dto.conversationId,
      user.userId,
      appId,
      {
        type: dto.type,
        url: dto.url,
        thumbnailUrl: dto.thumbnailUrl,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        width: dto.width,
        height: dto.height,
        duration: dto.duration,
      },
      dto.replyToId,
    );
  }

  @Get('media/:conversationId')
  @ApiOperation({ summary: 'Get media attachments in a conversation' })
  @ApiResponse({ status: 200, description: 'List of media attachments' })
  async getMediaAttachments(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.getMediaAttachments(
      conversationId,
      user.userId,
    );
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a message for later delivery' })
  @ApiResponse({ status: 201, description: 'Message scheduled' })
  async scheduleMessage(
    @Body()
    dto: {
      conversationId: string;
      content: string;
      type?: string;
      sendAt: string;
      replyToId?: string;
    },
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.scheduledMessagesService.scheduleMessage(
      dto.conversationId,
      user.userId,
      dto.content,
      dto.type || 'text',
      new Date(dto.sendAt),
      dto.replyToId,
      appId,
    );
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Get all scheduled messages for current user' })
  @ApiResponse({ status: 200, description: 'List of scheduled messages' })
  async getScheduledMessages(@CurrentUser() user: any) {
    return this.scheduledMessagesService.getUserScheduledMessages(user.userId);
  }

  @Get('scheduled/conversation/:conversationId')
  @ApiOperation({ summary: 'Get scheduled messages in a conversation' })
  @ApiResponse({ status: 200, description: 'List of scheduled messages' })
  async getConversationScheduledMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: any,
  ) {
    return this.scheduledMessagesService.getScheduledMessages(
      conversationId,
      user.userId,
    );
  }

  @Delete('schedule/:id')
  @ApiOperation({ summary: 'Cancel a scheduled message' })
  @ApiResponse({ status: 200, description: 'Scheduled message cancelled' })
  async cancelScheduledMessage(
    @Param('id') messageId: string,
    @CurrentUser() user: any,
  ) {
    return this.scheduledMessagesService.cancelScheduledMessage(
      messageId,
      user.userId,
    );
  }
}
