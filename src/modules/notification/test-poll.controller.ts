import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Mirrors kirana-fe GET/POST /api/test/poll so the Flutter app works
 * without changing paths when pointed at this NestJS backend.
 */
@ApiTags('test-poll')
@Controller('test')
export class TestPollController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('poll')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({
    summary: 'Poll for test notification (kirana-fe compatible)',
  })
  async getPoll(@CurrentUser() user: { userId: string }) {
    return this.notificationService.pollTestNotification(user.userId);
  }

  @Post('poll')
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({
    summary: 'Create or ack test notification (kirana-fe compatible)',
  })
  async postPoll(
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
}
