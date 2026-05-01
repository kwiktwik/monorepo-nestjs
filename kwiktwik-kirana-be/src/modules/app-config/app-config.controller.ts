import {
  Controller,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  Version,
} from '@nestjs/common';
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetConfigDto } from './dto/get-config.dto';

@ApiTags('app-config')
@ApiBearerAuth('JWT')
@Controller('config')
@UseGuards(AppIdGuard, JwtAuthGuard, RateLimitGuard, UserRateLimitGuard)
@RateLimit(DEFAULT_RATE_LIMITS.CONFIG)
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  /**
   * Get app configuration v1 (database-driven)
   * Similar to /api/config/v4 but all data comes from database
   */
  @Get()
  @Version('1')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Get app configuration v1 (database-driven)',
    description: 'Returns app configuration with unified plan structure from database',
  })
  @ApiResponse({
    status: 200,
    description: 'App config returned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid plan_id or language',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'App or Plan not found' })
  async getConfig(
    @AppId() appId: string,
    @CurrentUser() user: any,
    @Query() query: GetConfigDto,
  ) {
    const resolvedLanguage = query.language || query.lang || user?.language || 'en';

    const config = await this.appConfigService.getConfig(
      appId,
      query.plan_id,
      resolvedLanguage,
    );

    return {
      success: true,
      appId,
      plan_id: config._paywallMeta?.plan_id,
      config,
    };
  }
}
