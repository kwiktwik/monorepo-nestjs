import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppId } from '../../common/decorators/app-id.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';

@ApiTags('conversations')
@Controller('conversations')
@UseGuards(AppIdGuard, JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created' })
  async create(
    @Body() dto: CreateConversationDto,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.conversationsService.create(
      appId,
      user.userId,
      dto.type as any,
      dto.participantIds,
      dto.name,
      dto.description,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all conversations for current user' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  async getUserConversations(@CurrentUser() user: any, @AppId() appId: string) {
    return this.conversationsService.getUserConversations(appId, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation details' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @Param('id') conversationId: string,
    @CurrentUser() user: any,
  ) {
    return this.conversationsService.findById(conversationId, user.userId);
  }

  @Post('direct/:userId')
  @ApiOperation({ summary: 'Get or create direct conversation with a user' })
  @ApiResponse({ status: 200, description: 'Direct conversation' })
  async getOrCreateDirectConversation(
    @Param('userId') otherUserId: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.conversationsService.getOrCreateDirectConversation(
      appId,
      user.userId,
      otherUserId,
    );
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participant to group conversation' })
  @ApiResponse({ status: 200, description: 'Participant added' })
  async addParticipant(
    @Param('id') conversationId: string,
    @Body('userId') newUserId: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.conversationsService.addParticipant(
      conversationId,
      user.userId,
      newUserId,
      appId,
    );
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  async markAsRead(
    @Param('id') conversationId: string,
    @CurrentUser() user: any,
  ) {
    return this.conversationsService.markAsRead(conversationId, user.userId);
  }

  @Get(':id/unread')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(
    @Param('id') conversationId: string,
    @CurrentUser() user: any,
  ) {
    const count = await this.conversationsService.getUnreadCount(
      conversationId,
      user.userId,
    );
    return { unreadCount: count };
  }

  @Post(':id/promote/:userId')
  @ApiOperation({ summary: 'Promote user to admin' })
  @ApiResponse({ status: 200, description: 'User promoted to admin' })
  async promoteToAdmin(
    @Param('id') conversationId: string,
    @Param('userId') promoteUserId: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.conversationsService.promoteToAdmin(
      conversationId,
      user.userId,
      promoteUserId,
      appId,
    );
  }

  @Post(':id/demote/:userId')
  @ApiOperation({ summary: 'Demote user from admin' })
  @ApiResponse({ status: 200, description: 'User demoted from admin' })
  async demoteFromAdmin(
    @Param('id') conversationId: string,
    @Param('userId') demoteUserId: string,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.conversationsService.demoteFromAdmin(
      conversationId,
      user.userId,
      demoteUserId,
      appId,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update group conversation details' })
  @ApiResponse({ status: 200, description: 'Conversation updated' })
  async updateGroup(
    @Param('id') conversationId: string,
    @Body()
    updates: { name?: string; description?: string; avatarUrl?: string },
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.conversationsService.updateGroup(
      conversationId,
      user.userId,
      updates,
      appId,
    );
  }
}
