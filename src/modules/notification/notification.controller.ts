import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import type { CreateNotificationDto } from './dto/create-notification.dto';
import type {
  RegisterPushTokenDto,
  DeletePushTokenDto,
} from './dto/register-push-token.dto';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('v1')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'List notifications (v2)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'transactionType', required: false, type: String })
  @ApiQuery({ name: 'packageName', required: false, type: String })
  @ApiQuery({ name: 'appName', required: false, type: String })
  async findAll(
    @CurrentUser() user: { userId: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('transactionType') transactionType?: string,
    @Query('packageName') packageName?: string,
    @Query('appName') appName?: string,
  ) {
    return this.notificationService.findAll(user.userId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      startDate,
      endDate,
      transactionType,
      packageName,
      appName,
    });
  }

  @Post('v1')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Create notification (v2)' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationService.create(user.userId, dto);
  }

  @Post('test')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Create test notification for polling' })
  async createTestNotification(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      action?: string;
      id?: number;
      payload?: Record<string, any>;
      userId?: string;
    },
  ) {
    const action = body.action || 'create';

    if (action === 'create') {
      const targetUserId = body.userId || user.userId;
      return this.notificationService.createTestNotification(
        targetUserId,
        body.payload,
      );
    }
    if (action === 'ack') {
      const notificationId = body.id;
      if (notificationId == null) {
        throw new BadRequestException('Notification ID required');
      }
      return this.notificationService.ackTestNotification(notificationId);
    }
    throw new BadRequestException('Invalid action');
  }

  @Get('test')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Poll for test notification' })
  async pollTestNotification(@CurrentUser() user: { userId: string }) {
    return this.notificationService.pollTestNotification(user.userId);
  }

  @Post('push-token')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Register push token for FCM notifications' })
  async registerPushToken(
    @CurrentUser() user: { userId: string },
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.notificationService.registerPushToken(user.userId, dto);
  }

  @Delete('push-token')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Delete push token for FCM notifications' })
  async deletePushToken(
    @CurrentUser() user: { userId: string },
    @Body() dto: DeletePushTokenDto,
  ) {
    return this.notificationService.deletePushToken(user.userId, dto);
  }

  @Post('register')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({
    summary: 'Register push token for FCM notifications (alias)',
  })
  async registerPushTokenAlias(
    @CurrentUser() user: { userId: string },
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.notificationService.registerPushToken(user.userId, dto);
  }

  @Delete('register')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Delete push token for FCM notifications (alias)' })
  async deletePushTokenAlias(
    @CurrentUser() user: { userId: string },
    @Body() dto: DeletePushTokenDto,
  ) {
    return this.notificationService.deletePushToken(user.userId, dto);
  }
}
