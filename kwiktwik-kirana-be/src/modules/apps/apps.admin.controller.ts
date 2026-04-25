import {
  Controller,
  Get,
  Post,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBasicAuth } from '@nestjs/swagger';
import { AppsService } from './apps.service';

@ApiTags('admin')
@ApiBasicAuth('admin-basic')
@Controller('admin/apps')
export class AppsAdminController {
  private readonly logger = new Logger(AppsAdminController.name);

  constructor(private readonly appsService: AppsService) {}

  /**
   * Get all apps from cache (or fallback to hardcoded)
   */
  @Get()
  @ApiOperation({
    summary: 'List all apps',
    description:
      'Get all apps from cache (falls back to hardcoded if DB unavailable)',
  })
  getAllApps() {
    return {
      success: true,
      data: this.appsService.getAllApps(),
      source: this.appsService.isCacheInitialized() ? 'database' : 'fallback',
    };
  }

  /**
   * Get only active/supported apps
   */
  @Get('supported')
  @ApiOperation({
    summary: 'List supported apps',
    description: 'Get only active/supported apps',
  })
  getSupportedApps() {
    return {
      success: true,
      data: this.appsService.getSupportedApps(),
      source: this.appsService.isCacheInitialized() ? 'database' : 'fallback',
    };
  }

  /**
   * Get cache statistics
   */
  @Get('cache/stats')
  @ApiOperation({
    summary: 'Get cache stats',
    description: 'Get apps cache statistics',
  })
  getCacheStats() {
    return {
      success: true,
      data: this.appsService.getCacheStats(),
    };
  }

  /**
   * Refresh apps cache from database
   */
  @Post('cache/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh cache',
    description: 'Manually refresh apps cache from database',
  })
  async refreshCache() {
    await this.appsService.refreshCache();
    return {
      success: true,
      message: 'Apps cache refreshed successfully',
      stats: this.appsService.getCacheStats(),
    };
  }

  /**
   * Sync hardcoded apps with database
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync apps with database',
    description: 'Sync hardcoded REGISTERED_APPS with database',
  })
  async syncAppsWithDatabase() {
    const result = await this.appsService.syncAppsWithDatabase();
    return {
      success: true,
      message: `Synced ${result.created} new apps, updated ${result.updated} existing apps`,
      data: result,
    };
  }
}
