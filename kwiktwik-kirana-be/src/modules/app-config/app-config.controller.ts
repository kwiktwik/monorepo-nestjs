import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AppConfigService } from './app-config.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  RateLimitGuard,
  UserRateLimitGuard,
  RateLimit,
  DEFAULT_RATE_LIMITS,
} from '../../common/guards/rate-limit.guard';
import { AppId } from '../../common/decorators/app-id.decorator';

@ApiTags('app-config')
@ApiBearerAuth('JWT')
@Controller('config')
@UseGuards(AppIdGuard, JwtAuthGuard, RateLimitGuard, UserRateLimitGuard)
@RateLimit(DEFAULT_RATE_LIMITS.CONFIG)
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Get()
  @Version('1')
  @ApiOperation({
    summary: 'Get app configuration (database-driven)',
    description:
      'Returns validated app configuration directly from database. Client handles language selection from translations.',
  })
  @ApiResponse({ status: 200, description: 'App config returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'App not found' })
  @ApiResponse({ status: 500, description: 'Invalid app configuration' })
  async getConfig(@AppId() appId: string) {
    const config = await this.appConfigService.getConfig(appId);
    return { success: true, config };
  }
}
