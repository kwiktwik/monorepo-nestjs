import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiBasicAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { NotificationEventsService } from '../notification-events/notification-events.service';

export const TEST_EVENT_TYPES = [
  'subscription.halted',
  'subscription.paused',
  'subscription.resumed',
  'subscription.cancelled',
  'payment.received',
  'payment.failed',
  'order.completed',
  'order.cancelled',
  'checkout.abandoned',
] as const;

@ApiTags('admin/notifications')
@ApiBasicAuth('admin-basic')
@Controller('admin/notifications')
export class AdminNotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationEventsService: NotificationEventsService,
  ) {}

  @Post('send-test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test notification to user by phone number' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendTestNotification(
    @Body()
    body: {
      phoneNumber?: string;
      appId?: string;
      payload?: Record<string, unknown>;
      fcmToken?: string;
    },
  ) {
    return this.notificationService.sendTestNotificationByPhone(
      body.phoneNumber,
      body.appId,
      body.payload,
      body.fcmToken,
    );
  }

  @Post('send-test-by-event')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Send test notification via event system - select event type from dropdown',
  })
  @ApiResponse({ status: 200, description: 'Event queued for notification' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendTestByEvent(
    @Body()
    body: {
      phoneNumber: string;
      appId: string;
      eventType: string;
      payload?: Record<string, unknown>;
    },
  ) {
    const user = await this.notificationService.findUserByPhone(body.phoneNumber);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const eventPayload = body.payload || {};
    if (body.eventType === 'subscription.halted') {
      eventPayload.subscriptionId = 'test-sub-123';
    } else if (body.eventType === 'subscription.paused') {
      eventPayload.subscriptionId = 'test-sub-123';
    } else if (body.eventType === 'payment.received') {
      eventPayload.amount = eventPayload.amount || '999';
      eventPayload.currency = eventPayload.currency || 'INR';
    } else if (body.eventType === 'order.completed') {
      eventPayload.orderId = eventPayload.orderId || 'order-123';
    }

    return this.notificationEventsService.ingestEvent(
      user.id,
      body.appId,
      {
        eventType: body.eventType,
        payload: eventPayload,
      },
      true,
    );
  }
}
