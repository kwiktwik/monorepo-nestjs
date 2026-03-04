import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
} from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppId } from '../../common/decorators/app-id.decorator';

@ApiTags('config')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
@Controller('config')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('v2')
  @ApiOperation({ summary: 'Get app configuration' })
  @ApiResponse({ status: 200, description: 'App config returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getConfig(@AppId() appId: string) {
    const config = this.configService.getConfig(appId);

    return {
      success: true,
      appId,
      config,
    };
  }
}
