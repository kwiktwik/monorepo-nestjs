import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UsePipes,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FeatureToggleService } from './feature-toggle.service';
import { FeatureToggleGuard } from '../../common/guards/feature-toggle.guard';
import { ZodValidationPipe } from '../phonepe-v2/infrastructure/validation/zod-validation.pipe';
import type {
  EvaluateFeatureInput,
  FeatureEvaluation,
  FeatureToggleError,
} from './dto/feature-toggle.schema';
import { EvaluateFeatureSchema } from './dto/feature-toggle.schema';

/**
 * Feature Toggle Controller
 *
 * Endpoints for evaluating feature flags and A/B experiments.
 *
 * Authentication:
 * - X-App-ID header: REQUIRED (validated by FeatureToggleGuard)
 * - X-Firebase-Installation-ID or X-Device-ID header: REQUIRED (pre-login)
 * - OR JWT Bearer token: provides userId (post-login)
 *
 * At least one identity source is REQUIRED. No defaults.
 */
@ApiTags('feature-toggle')
@Controller('feature-toggle')
export class FeatureToggleController {
  constructor(private readonly featureToggleService: FeatureToggleService) {}

  @Post('evaluate')
  @UseGuards(FeatureToggleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluate a feature flag / experiment',
    description: `
Evaluate a feature flag or A/B experiment for the given app and identity.

**Identity Requirements (strict - no defaults):**
- At least ONE of the following must be provided:
  - \`X-Firebase-Installation-ID\` header (recommended for pre-login)
  - \`X-Device-ID\` header (alternative pre-login identifier)
  - JWT Bearer token (provides userId for authenticated users)

**App ID:**
- \`X-App-ID\` header is REQUIRED

If any required field is missing, the request fails with 400 Bad Request.
    `,
  })
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App package identifier (e.g., com.paymentalert.app)',
  })
  @ApiHeader({
    name: 'X-Firebase-Installation-ID',
    required: false,
    description: 'Firebase Installation ID (pre-login, stable across restarts)',
  })
  @ApiHeader({
    name: 'X-Device-ID',
    required: false,
    description: 'Device ID (pre-login, e.g., ANDROID_ID)',
  })
  @ApiBearerAuth('JWT')
  @ApiResponse({
    status: 200,
    description: 'Feature evaluation result',
    schema: {
      example: {
        success: true,
        appId: 'com.paymentalert.app',
        featureKey: 'new_checkout_flow',
        identity: {
          value: 'firebase_inst_abc123',
          type: 'firebaseInstallationId',
        },
        enabled: false,
        reason:
          'Feature toggle not yet implemented in database - default disabled',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed - missing appId or identity',
    schema: {
      example: {
        success: false,
        error: 'X-App-ID header is required',
        code: 'MISSING_APP_ID',
      },
    },
  })
  @ApiBody({
    description: 'Feature flag key and optional context',
    schema: {
      type: 'object',
      required: ['featureKey'],
      properties: {
        featureKey: {
          type: 'string',
          description: 'The feature flag key to evaluate',
          example: 'new_checkout_flow',
        },
        context: {
          type: 'object',
          description: 'Optional context for evaluation',
          additionalProperties: true,
          example: { userType: 'premium' },
        },
      },
    },
  })
  @UsePipes(new ZodValidationPipe(EvaluateFeatureSchema))
  async evaluate(
    @Body() body: EvaluateFeatureInput,
    // @ts-ignore - NestJS decorator type inference issue with isolatedModules
    @Req() req,
  ): Promise<FeatureEvaluation | FeatureToggleError> {
    try {
      // Guard has already validated appId and identity are present
      // Cast to access properties added by FeatureToggleGuard
      const featureReq = req as Request & {
        appId: string;
        identity: {
          firebaseInstallationId?: string;
          deviceId?: string;
          userId?: string;
        };
      };

      // Defensive check: body can be undefined if no JSON body was sent
      if (!body || !body.featureKey) {
        return {
          success: false,
          error: 'Request body is required with featureKey',
          code: 'INVALID_FEATURE_KEY',
        };
      }

      const result = await this.featureToggleService.evaluateFeature(
        featureReq.appId,
        body.featureKey.trim(),
        featureReq.identity,
        body.context,
      );
      return result;
    } catch (error: unknown) {
      // Re-throw BadRequestException (already has proper format)
      if (error instanceof Error && error.name === 'BadRequestException') {
        throw error;
      }

      // Wrap other errors
      const err = error as Error;
      return {
        success: false,
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      };
    }
  }

  @Get('flags')
  @UseGuards(AppIdGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all feature flags for the app',
    description: `
Returns all feature flags configured for the app identified by X-App-ID.

**Requirements:**
- X-App-ID header is REQUIRED (validated by AppIdGuard)
- Identity is NOT required for this endpoint (just lists flags, no evaluation)

Each flag includes its key, description, enabled status, and default value.
    `,
  })
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App package identifier (e.g., com.paymentalert.app)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of feature flags',
    schema: {
      example: {
        success: true,
        appId: 'com.paymentalert.app',
        flags: [
          {
            key: 'new_checkout_flow',
            description: 'Enable the new checkout UI flow',
            isEnabled: true,
            defaultValue: { enabled: false },
          },
          {
            key: 'dark_mode',
            description: 'Enable dark mode UI',
            isEnabled: false,
            defaultValue: { enabled: false },
          },
        ],
      },
    },
  })
  async getFlags(@AppId() appId: string): Promise<{
    success: boolean;
    appId: string;
    flags: Array<{
      key: string;
      description: string | null;
      isEnabled: boolean;
      defaultValue: { enabled: boolean; value?: unknown } | null;
    }>;
  }> {
    const flags = await this.featureToggleService.getAllFlags(appId);
    return {
      success: true,
      appId,
      flags,
    };
  }
}
