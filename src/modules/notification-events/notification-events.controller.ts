import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AppId } from '../../common/decorators/app-id.decorator';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationEventsService } from './notification-events.service';
import { NotificationEventDto } from './dto/notification-event.dto';

@ApiTags('events')
@Controller('event')
export class NotificationEventsController {
  constructor(
    private readonly notificationEventsService: NotificationEventsService,
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
}
