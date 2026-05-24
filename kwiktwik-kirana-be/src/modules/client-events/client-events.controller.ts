import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RateLimitGuard, RateLimit, DEFAULT_RATE_LIMITS } from '../../common/guards/rate-limit.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppId } from '../../common/decorators/app-id.decorator';
import { ClientEventsService } from './client-events.service';
import { IngestClientEventsDto } from './dto/client-event.dto';

@ApiTags('client-events')
@Controller('v1/client-events')
@UseGuards(AppIdGuard, JwtAuthGuard, RateLimitGuard)
@RateLimit(DEFAULT_RATE_LIMITS.API)
export class ClientEventsController {
  constructor(private readonly clientEventsService: ClientEventsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth('JWT')
  @ApiHeader({ name: 'X-App-ID', required: true })
  @ApiOperation({
    summary: 'Ingest client diagnostic events (proxied to CF Worker + D1)',
  })
  async ingest(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: IngestClientEventsDto,
  ) {
    const result = await this.clientEventsService.forwardEvents(
      user.userId,
      appId,
      dto,
    );

    return {
      accepted: result.accepted,
      count: dto.events.length,
    };
  }
}