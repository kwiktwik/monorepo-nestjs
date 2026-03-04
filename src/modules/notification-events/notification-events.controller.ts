import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Query } from '@nestjs/common';
import { AppId } from '../../common/decorators/app-id.decorator';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationEventsService } from './notification-events.service';
import { NotificationEventDto } from './dto/notification-event.dto';
import { NotificationQueueService } from './services/notification-queue.service';

@ApiTags('events')
@Controller('event')
export class NotificationEventsController {
  constructor(
    private readonly notificationEventsService: NotificationEventsService,
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth('JWT')
  @ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Ingest an event for notifications' })
  @ApiBody({ type: NotificationEventDto })
  async ingest(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() payload: NotificationEventDto,
  ) {
    return this.notificationEventsService.ingestEvent(user.userId, appId, payload);
  }

  @Post('checkout-abandoned')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth('JWT')
  @ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Schedule a checkout abandoned check (delayed 30 min by default)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', example: 'order_123' },
        amount: { type: 'number', example: 999 },
        currency: { type: 'string', example: 'INR' },
        planName: { type: 'string', example: 'Premium Monthly' },
        delayMinutes: { type: 'number', example: 30, description: 'Delay in minutes (default: 30)' },
      },
    },
  })
  async scheduleCheckoutAbandoned(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() body: {
      orderId?: string;
      amount?: number;
      currency?: string;
      planName?: string;
      delayMinutes?: number;
    },
  ) {
    const delayMs = (body.delayMinutes ?? 30) * 60 * 1000;
    
    const jobId = await this.notificationQueueService.scheduleCheckoutAbandonedCheck(
      user.userId,
      appId,
      {
        orderId: body.orderId,
        amount: body.amount,
        currency: body.currency,
        planName: body.planName,
      },
      delayMs,
    );

    return {
      accepted: true,
      jobId,
      scheduledFor: new Date(Date.now() + delayMs).toISOString(),
      message: `Checkout abandoned check scheduled for ${body.delayMinutes ?? 30} minutes from now`,
    };
  }

  @Get('queue/stats')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Get notification queue statistics' })
  async getQueueStats() {
    return this.notificationQueueService.getQueueStats();
  }
}
