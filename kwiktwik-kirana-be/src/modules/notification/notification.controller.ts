import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  Delete,
  UsePipes,
  ValidationPipe,
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
import { CreateNotificationV2Dto } from './dto/create-notification-v2.dto';
import { ZodValidationPipe } from '../phonepe-v2/infrastructure/validation/zod-validation.pipe';
import { CreateNotificationV2Schema } from './dto/create-notification-v2.schema';
import type {
  RegisterPushTokenDto,
  DeletePushTokenDto,
} from './dto/register-push-token.dto';
import { UpdateNotificationStatusDto } from './dto/update-notification-status.dto';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RateLimitGuard, UserRateLimitGuard, RateLimit, DEFAULT_RATE_LIMITS } from '../../common/guards/rate-limit.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationLogQueueService } from './notification-log-queue.service';
import { NotificationLogProcessor } from './notification-log-queue.processor';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AppIdGuard, JwtAuthGuard, RateLimitGuard, UserRateLimitGuard)
@RateLimit(DEFAULT_RATE_LIMITS.NOTIFICATION)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logQueueService: NotificationLogQueueService,
    private readonly logProcessor: NotificationLogProcessor,
  ) {}

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
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
  @ApiOperation({ summary: 'Create notification (v1)' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationService.create(user.userId, dto);
  }

  @Post('v2')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(CreateNotificationV2Schema))
  @ApiOperation({
    summary: 'Create notification (v2) - Android sends pre-parsed data',
    description:
      'V2 endpoint where Android sends all pre-parsed notification data. No server-side parsing is performed.',
  })
  async createV2(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateNotificationV2Dto,
  ) {
    return this.notificationService.createV2(user.userId, dto);
  }

  @Patch('status')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({
    summary:
      'Update notification status fields (ttsAnnounced, teamNotificationSent)',
  })
  async updateStatus(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateNotificationStatusDto,
  ) {
    return this.notificationService.updateStatus(user.userId, dto);
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
      payload?: Record<string, unknown>;
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

  // ============================================================================
  // Queue Monitoring Endpoints
  // ============================================================================

  @Get('queue/stats')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({
    summary: 'Get notification log queue statistics',
    description:
      'Returns queue health, job counts, and processor metrics. Use this to monitor async notification processing.',
  })
  async getQueueStats() {
    const [queueStats, processorMetrics] = await Promise.all([
      this.logQueueService.getQueueStats(),
      this.logProcessor.getMetrics(),
    ]);

    return {
      success: true,
      queue: queueStats,
      processor: processorMetrics,
      mode: this.logQueueService.isAsyncModeEnabled() ? 'async' : 'sync',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('queue/health')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({
    summary: 'Get notification log queue health check',
    description:
      'Simple health check for monitoring systems. Returns 200 if queue is healthy.',
  })
  async getQueueHealth() {
    const isAsyncMode = this.logQueueService.isAsyncModeEnabled();
    const queueStats = await this.logQueueService.getQueueStats();
    const processorMetrics = this.logProcessor.getMetrics();

    // Calculate health status
    const isHealthy = queueStats.available || !isAsyncMode;
    const failedJobsHigh = (queueStats.failed ?? 0) > 100;
    const queueBacklogHigh = (queueStats.waiting ?? 0) > 1000;

    const status =
      isHealthy && !failedJobsHigh && !queueBacklogHigh
        ? 'healthy'
        : isHealthy
          ? 'degraded'
          : 'unhealthy';

    return {
      status,
      mode: isAsyncMode ? 'async' : 'sync',
      queueAvailable: queueStats.available,
      metrics: {
        waiting: queueStats.waiting ?? 0,
        active: queueStats.active ?? 0,
        failed: queueStats.failed ?? 0,
        processed: processorMetrics.processed,
        duplicates: processorMetrics.duplicates,
      },
      alerts: {
        queueBacklogHigh,
        failedJobsHigh,
        fallbackActive: !isAsyncMode,
      },
    };
  }
}
