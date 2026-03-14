import { Controller, Get, UseGuards, Query } from '@nestjs/common';
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
import { USER_TYPES, DEEPLINK_CAMPAIGNS, type UserType, type DeeplinkCampaign } from './config.data';

@ApiTags('config')
@ApiBearerAuth('JWT')
@Controller('config')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) { }

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
  @ApiOperation({ summary: 'Get app configuration with dynamic paywall (v3)' })
  @ApiQuery({ name: 'userType', enum: Object.values(USER_TYPES), required: false, description: 'User type for paywall selection' })
  @ApiQuery({ name: 'deeplink', enum: Object.values(DEEPLINK_CAMPAIGNS), required: false, description: 'Deeplink campaign source' })
  @ApiResponse({ status: 200, description: 'App config returned with dynamic paywall' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConfigV3(
    @AppId() appId: string,
    @CurrentUser() user: any,
    @Query('userType') userType?: UserType,
    @Query('deeplink') deeplink?: DeeplinkCampaign,
  ) {
    // Determine user type from query or user object
    const resolvedUserType: UserType = userType || user?.userType || USER_TYPES.NEW;

    // Determine deeplink from query or user object
    const resolvedDeeplink: DeeplinkCampaign = deeplink || user?.deeplink || DEEPLINK_CAMPAIGNS.NONE;

    const context = {
      appId,
      userType: resolvedUserType,
      deeplink: resolvedDeeplink,
    };

    const config = await this.configService.getConfig(appId, context);

    return {
      success: true,
      appId,
      config,
    };
  }
}
