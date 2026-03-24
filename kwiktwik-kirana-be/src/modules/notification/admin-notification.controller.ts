import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBasicAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('admin/notifications')
@ApiBasicAuth('admin-basic')
@Controller('admin/notifications')
export class AdminNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send-test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test notification to user by phone number' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendTestNotification(
    @Body()
    body: {
      phoneNumber: string;
      appId?: string;
      payload?: Record<string, unknown>;
    },
  ) {
    return this.notificationService.sendTestNotificationByPhone(
      body.phoneNumber,
      body.appId,
      body.payload,
    );
  }
}
