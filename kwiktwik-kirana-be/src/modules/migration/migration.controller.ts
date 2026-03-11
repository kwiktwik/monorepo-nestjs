import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UnauthorizedException,
  BadRequestException,
  Sse,
  MessageEvent,
  UseGuards,
} from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { ApiExcludeController } from '@nestjs/swagger';
import { MigrationService } from './migration.service';
import {
  MigrateSessionDto,
  MigrationStatusDto,
} from './dto/migrate-session.dto';
import { AppId } from '../../common/decorators/app-id.decorator';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { MigrationProgress } from './interfaces/migration.interfaces';

/**
 * Migration Controller
 * Handles user migration from kirana-fe to kwiktwik-kirana-be
 * Supports Server-Sent Events for real-time progress updates
 * @ApiExcludeController hides from Swagger docs (internal endpoint)
 */
@ApiExcludeController()
@UseGuards(AppIdGuard)
@Controller('v1/migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  /**
   * Migrate user session from kirana-fe to kwiktwik-kirana-be
   * POST /v1/migration/migrate-session
   */
  @Post('migrate-session')
  async migrateSession(
    @Body() dto: MigrateSessionDto,
    @AppId() appId: string,
    @Headers('x-forwarded-for') forwardedFor?: string,
  ) {
    // Validate app ID
    if (appId !== 'com.kiranaapps.app') {
      throw new BadRequestException(
        'Migration only supported for com.kiranaapps.app',
      );
    }

    // Execute migration
    const result = await this.migrationService.migrateUser(
      dto.betterAuthToken,
      dto.deviceId,
      dto.deviceInfo,
    );

    if (!result.success) {
      // Return appropriate error based on error code
      if (result.error?.code === 'ERR_PARTIAL_001') {
        throw new BadRequestException({
          code: result.error.code,
          message: result.error.message,
          migrationId: result.migrationId,
        });
      }

      if (result.error?.code === 'ERR_SESSION_002') {
        throw new UnauthorizedException(result.error.message);
      }

      throw new BadRequestException({
        code: result.error?.code || 'ERR_UNKNOWN',
        message: result.error?.message || 'Migration failed',
        migrationId: result.migrationId,
      });
    }

    return {
      success: true,
      migrationId: result.migrationId,
      token: result.token,
      user: result.userId,
      migratedTables: result.migratedTables,
      recordsMigrated: result.recordsMigrated,
      duration: result.duration,
    };
  }

  /**
   * Get migration status
   * GET /v1/migration/status/:migrationId
   */
  @Get('status/:migrationId')
  async getMigrationStatus(
    @Param() params: MigrationStatusDto,
    @AppId() appId: string,
  ) {
    const status = await this.migrationService.getMigrationStatus(
      params.migrationId,
    );

    if (!status) {
      throw new BadRequestException({
        code: 'ERR_NOT_FOUND',
        message: 'Migration not found',
      });
    }

    return status;
  }

  /**
   * Server-Sent Events for real-time migration progress
   * GET /v1/migration/progress/:migrationId
   *
   * Usage in frontend:
   * const eventSource = new EventSource('/v1/migration/progress/mig_abc123');
   * eventSource.onmessage = (event) => {
   *   const progress = JSON.parse(event.data);
   *   updateProgressBar(progress.progress);
   * };
   */
  @Sse('progress/:migrationId')
  migrationProgress(
    @Param() params: MigrationStatusDto,
  ): Observable<MessageEvent> {
    // TODO: Implement actual progress tracking from migration service
    // For now, return mock progress updates

    return interval(1000).pipe(
      map((count) => {
        const progress: MigrationProgress = {
          migrationId: params.migrationId,
          userId: 'user_123',
          state: 'migrating_metadata' as any,
          progress: Math.min(100, count * 10),
          currentTable: count < 5 ? 'metadata' : 'accounts',
          recordsProcessed: count * 5,
          totalRecords: 50,
          estimatedTimeRemaining: 60 - count,
          message: `Migrating ${count < 5 ? 'metadata' : 'accounts'}...`,
          timestamp: new Date(),
        };

        return {
          data: progress,
        } as MessageEvent;
      }),
    );
  }
}
