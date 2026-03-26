import {
  Controller,
  Get,
  UseGuards,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  USER_TYPES,
  DEEPLINK_CAMPAIGNS,
  SUPPORTED_LANGUAGES,
} from './config.data';
import { GetConfigV4Dto } from './dto/get-config-v4.dto';

@ApiTags('config')
@ApiBearerAuth('JWT')
@Controller('config')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('v2')
  @ApiOperation({ summary: 'Get app configuration (stable)' })
  @ApiResponse({ status: 200, description: 'App config returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getConfig(@AppId() appId: string) {
    const config = this.configService.getConfigSimple(appId);

    return {
      success: true,
      appId,
      config,
    };
  }

  @Get('v3')
  @ApiOperation({ summary: 'Get app configuration with plan selection (v3)' })
  @ApiQuery({
    name: 'plan_id',
    required: false,
    description:
      'Plan ID to get specific plan configuration (e.g., plan_PHONEPE_AUTOPAY_001). If not provided, uses rules engine.',
    example: 'plan_PHONEPE_AUTOPAY_001',
  })
  @ApiQuery({
    name: 'language',
    enum: Object.values(SUPPORTED_LANGUAGES),
    required: false,
    description: 'Language for localized content',
  })
  @ApiQuery({
    name: 'lang',
    enum: Object.values(SUPPORTED_LANGUAGES),
    required: false,
    description: 'Language for localized content (fallback)',
  })
  @ApiResponse({ status: 200, description: 'App config returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConfigV3(
    @AppId() appId: string,
    @CurrentUser() user: any,
    @Query('plan_id') plan_id?: string,
    @Query('language') language?: string,
    @Query('lang') lang?: string,
  ) {
    const context = {
      appId,
      userType: USER_TYPES.NEW,
      deeplink: DEEPLINK_CAMPAIGNS.NONE,
      plan_id,
      language: language || lang || user?.language || 'en',
    };

    const config = await this.configService.getConfig(appId, context);

    return {
      success: true,
      appId,
      config,
    };
  }

  @Get('v4')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Get app configuration with unified plan structure (v4)',
  })
  @ApiQuery({
    name: 'plan_id',
    required: false,
    description:
      'Optional: Plan ID to override backend selection (e.g., plan_PHONEPE_AUTOPAY_001 or plan_S3FaBrk7sjPQEU). If not provided, backend will determine the plan.',
    example: 'plan_PHONEPE_AUTOPAY_001',
  })
  @ApiQuery({
    name: 'language',
    enum: Object.values(SUPPORTED_LANGUAGES),
    required: false,
    description: 'Language for localized content',
  })
  @ApiResponse({
    status: 200,
    description: 'App config with unified plan structure returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid plan_id or language',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getConfigV4(
    @AppId() appId: string,
    @CurrentUser() user: any,
    @Query() query: GetConfigV4Dto,
  ) {
    const resolvedLanguage = query.language || user?.language || 'en';

    const config = await this.configService.getConfigV4(
      appId,
      query.plan_id,
      resolvedLanguage,
      user,
    );

    return {
      success: true,
      appId,
      plan_id: config._paywallMeta?.plan_id,
      config,
    };
  }
}
