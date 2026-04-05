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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MigrationService } from './migration.service';
import {
  MigrateSessionDto,
  MigrationStatusDto,
} from './dto/migrate-session.dto';
import { AppId } from '../../common/decorators/app-id.decorator';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MigrationProgress } from './interfaces/migration.interfaces';

/**
 * Migration Controller
 * Handles user migration from kirana-fe to kwiktwik-kirana-be
 * Supports Server-Sent Events for real-time progress updates
 */
@ApiTags('migration')
@ApiBearerAuth()
@UseGuards(AppIdGuard, JwtAuthGuard)
@Controller('v1/migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  /**
   * Migrate user session from kirana-fe to kwiktwik-kirana-be
   * POST /v1/migration/migrate-session
   */
  @Post('migrate-session')
  @ApiOperation({
    summary: 'Migrate user session from kirana-fe to kwiktwik-kirana-be',
    description: `Migrates all user data from the legacy kirana-fe system to the new kwiktwik-kirana-be backend.
    
Requires an active Better-Auth session token from kirana-fe.
This endpoint performs a complete migration including:
- User metadata and profile
- OAuth accounts (Google, Truecaller)
- Push tokens
- Device sessions
- Subscriptions
- Orders
- Payment records

The migration is atomic - either all data is migrated successfully or nothing is saved.`,
  })
  @ApiBody({
    type: MigrateSessionDto,
    description:
      'Migration request containing Better-Auth token from kirana-fe',
  })
  @ApiResponse({
    status: 200,
    description: 'Migration completed successfully',
    schema: {
      example: {
        success: true,
        migrationId: 'mig_abc123def456',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: 'user_abc123',
        migratedTables: [
          'user_metadata',
          'accounts',
          'pushTokens',
          'deviceSessions',
          'subscriptions',
          'orders',
        ],
        recordsMigrated: 25,
        duration: 1234,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or partial data detected',
    schema: {
      example: {
        statusCode: 400,
        message: {
          code: 'ERR_PARTIAL_001',
          message:
            'Migration cannot proceed. Existing data found in tables: user_metadata, accounts. Please contact support team with error code: ERR_PARTIAL_001',
          details: {
            tablesWithData: ['user_metadata', 'accounts'],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired Better-Auth session',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired Better-Auth session',
      },
    },
  })
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
  @ApiOperation({
    summary: 'Get migration status by ID',
    description:
      'Retrieves the current status and details of a migration process',
  })
  @ApiParam({
    name: 'migrationId',
    description: 'The unique migration ID returned from migrate-session',
    example: 'mig_abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Migration status retrieved successfully',
    schema: {
      example: {
        migrationId: 'mig_abc123def456',
        userId: 'user_abc123',
        phoneNumber: '+919876543210',
        status: 'completed',
        currentState: 'completed',
        startedAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:30:01Z',
        duration: 1234,
        tablesMigrated: ['user_metadata', 'accounts', 'subscriptions'],
        tablesFailed: [],
        recordsCount: 25,
        errorCode: null,
        errorMessage: null,
        isLocked: false,
        lockedAt: null,
        lastHeartbeat: '2024-01-15T10:30:01Z',
        sourceHash: 'abc123...',
        destinationHash: 'def456...',
        deviceId: 'device_abc123',
        deviceInfo: {
          brand: 'Samsung',
          model: 'Galaxy S21',
          os: 'Android 13',
          appVersion: '2.0.0',
        },
        retryCount: 0,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Migration not found',
    schema: {
      example: {
        statusCode: 400,
        message: {
          code: 'ERR_NOT_FOUND',
          message: 'Migration not found',
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Stream real-time migration progress (SSE)',
    description: `Server-Sent Events endpoint that streams migration progress updates in real-time.

**Usage Example:**
\`\`\`javascript
const eventSource = new EventSource('/v1/migration/progress/mig_abc123');
eventSource.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  console.log(\`Progress: \${progress.progress}%\`);
  console.log(\`Current table: \${progress.currentTable}\`);
  updateProgressBar(progress.progress);
};
\`\`\`

**Note:** This endpoint returns text/event-stream content type, not JSON.`,
  })
  @ApiParam({
    name: 'migrationId',
    description: 'The unique migration ID',
    example: 'mig_abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE stream established - receives progress events',
    schema: {
      example: {
        data: {
          migrationId: 'mig_abc123def456',
          userId: 'user_abc123',
          state: 'migrating_metadata',
          progress: 45,
          currentTable: 'accounts',
          recordsProcessed: 15,
          totalRecords: 25,
          estimatedTimeRemaining: 5,
          message: 'Migrating accounts...',
          timestamp: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
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
