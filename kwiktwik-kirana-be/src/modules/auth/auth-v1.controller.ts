import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  AuthService,
  AuthUserResponse,
  normalizePhoneNumber,
} from './auth.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { MigrationService } from '../migration/migration.service';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq, and, or } from 'drizzle-orm';
import {
  LoginOtpDto,
  LoginTruecallerDto,
  LoginGoogleDto,
} from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';

type ProviderType = 'otp' | 'truecaller' | 'google';

interface UnifiedLoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUserResponse & { image?: string };
  userProfile?: Record<string, unknown>;
  authProvider?: string;
  message?: string;
  error?: 'USE_ALTERNATE_BACKEND' | string;
  retryAfter?: number;
  alternateBackend?: string;
  alternateEndpoints?: {
    sendOtp: string;
    verifyOtp: string;
    truecaller: string;
    google: string;
  };
}

@ApiTags('auth-v1')
@Controller('v1/auth')
@UseGuards(AppIdGuard)
export class AuthV1Controller {
  private readonly logger = new Logger(AuthV1Controller.name);

  constructor(
    private readonly authService: AuthService,
    private readonly migrationService: MigrationService,
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP (v1)',
    description:
      'Send OTP to phone number. First checks for kirana-fe (legacy Flutter app) user detection. Rate limited: 20 OTPs/hour per phone number.',
  })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      example: {
        success: true,
        message: 'OTP sent successfully',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'User exists in kirana-fe legacy system - use alternate backend',
    schema: {
      example: {
        success: true,
        message: 'User already registered on legacy system',
        error: 'USE_ALTERNATE_BACKEND',
        alternateBackend: 'https://api.kiranaapps.com',
        alternateEndpoints: {
          sendOtp: '/api/phone-number/send-otp',
          verifyOtp: '/api/phone-number/verify',
        },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded (20 OTPs/hour per phone number)',
    schema: {
      example: {
        success: true,
        message: 'Rate limit exceeded. Please try again in 45 minutes.',
        retryAfter: 2700,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid phone number format',
  })
  async sendOtp(
    @Body() dto: SendOtpDto,
    @AppId() appId: string,
    @Req() req: Request,
  ) {
    this.logger.log(`[Send OTP v1] Phone: ${dto.phoneNumber}, App: ${appId}`);

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    // Check if user already migrated to new system
    const isMigrated = await this.isUserMigrated(normalizedPhone);

    if (isMigrated) {
      this.logger.log(
        `[Send OTP v1] User ${normalizedPhone} already migrated, proceeding to send OTP`,
      );
    } else {
      // Check for kirana-fe user detection only if not migrated
      const isKiranaFeUser =
        await this.authService.checkKiranaFeUser(normalizedPhone);

      if (isKiranaFeUser) {
        this.logger.log(
          `[Send OTP v1] Kirana-FE user detected: ${normalizedPhone}`,
        );
        return {
          success: true,
          message: 'User already registered on legacy system',
          error: 'USE_ALTERNATE_BACKEND',
          alternateBackend: 'https://api.kiranaapps.com',
          alternateEndpoints: {
            sendOtp: '/api/phone-number/send-otp',
            verifyOtp: '/api/phone-number/verify',
            truecaller: '/api/auth/truecaller/token',
            google: '/api/auth/google-signin',
          },
        };
      }
    }

    // Get client IP for rate limiting
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    // Send OTP
    const result = await this.authService.sendOtp(
      normalizedPhone,
      dto.appHash,
      ipAddress,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Post('login/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unified Login (v1)',
    description:
      'Login with OTP, Truecaller, or Google. First checks for kirana-fe (legacy Flutter app) user detection.',
  })
  @ApiParam({
    name: 'provider',
    enum: ['otp', 'truecaller', 'google'],
    description: 'Authentication provider type',
    example: 'otp',
  })
  @ApiBody({
    description: 'Login credentials based on provider type',
    type: LoginOtpDto, // Default for Swagger, actual validation is manual
    examples: {
      otp: {
        summary: 'OTP Login',
        value: {
          phoneNumber: '+919876543210',
          code: '123456',
        },
      },
      truecaller: {
        summary: 'Truecaller Login',
        value: {
          phoneNumber: '+919876543210',
          code: 'auth_code_from_truecaller',
          code_verifier: 'pkce_verifier',
          client_id: 'your_client_id',
        },
      },
      google: {
        summary: 'Google Login',
        value: {
          phoneNumber: '+919876543210',
          idToken: 'google_id_token_jwt',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token',
    schema: {
      example: {
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIs...',
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+919876543210',
          phoneNumberVerified: true,
          image: 'https://...',
        },
        authProvider: 'otp',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'User exists in kirana-fe legacy system - use alternate backend',
    schema: {
      example: {
        success: true,
        message: 'User already registered on legacy system',
        error: 'USE_ALTERNATE_BACKEND',
        alternateBackend: 'https://api.kiranaapps.com',
        alternateEndpoints: {
          sendOtp: '/api/phone-number/send-otp',
          verifyOtp: '/api/phone-number/verify',
          truecaller: '/api/auth/truecaller/token',
          google: '/api/auth/google-signin',
        },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded (20 OTPs/hour per phone number)',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid provider or missing required fields',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unifiedLogin(
    @Param('provider') provider: ProviderType,
    @Body() credentials: LoginOtpDto | LoginTruecallerDto | LoginGoogleDto,
    @AppId() appId: string,
  ): Promise<UnifiedLoginResponse> {
    this.logger.log(`[Unified Login] Provider: ${provider}, App: ${appId}`);
    this.logger.log(
      `[Unified Login] Request body: ${JSON.stringify(credentials)}`,
    );

    // Validate provider
    if (!['otp', 'truecaller', 'google'].includes(provider)) {
      throw new BadRequestException(
        `Invalid provider: ${provider}. Must be one of: otp, truecaller, google`,
      );
    }

    try {
      // Route to appropriate login method
      switch (provider) {
        case 'otp':
          return await this.loginWithOtp(credentials as LoginOtpDto, appId);
        case 'truecaller':
          return await this.loginWithTruecaller(
            credentials as LoginTruecallerDto,
            appId,
          );
        case 'google':
          return await this.loginWithGoogle(
            credentials as LoginGoogleDto,
            appId,
          );
        default:
          throw new BadRequestException('Invalid provider');
      }
    } catch (error) {
      this.logger.error(
        `[Unified Login] Error for provider ${provider}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      this.logger.error(
        `[Unified Login] Error details - Stack: ${error instanceof Error ? error.stack : 'N/A'}`,
      );

      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private createAlternateBackendResponse(): UnifiedLoginResponse {
    return {
      success: true,
      message: 'User already registered on legacy system',
      error: 'USE_ALTERNATE_BACKEND',
      alternateBackend: 'https://api.kiranaapps.com',
      alternateEndpoints: {
        sendOtp: '/api/phone-number/send-otp',
        verifyOtp: '/api/phone-number/verify',
        truecaller: '/api/auth/truecaller/token',
        google: '/api/auth/google-signin',
      },
    };
  }

  /**
   * Check if user is already migrated to new system
   * If migrated, skip kirana-fe check
   */
  private async isUserMigrated(phoneNumber: string): Promise<boolean> {
    try {
      // Create different formats to check, as BetterAuth might store them differently
      const normalized = normalizePhoneNumber(phoneNumber);
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const with91 = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
      const plusDigits = `+${digitsOnly}`;

      // Check if user exists in new database
      const userRecord = await this.db
        .select()
        .from(schema.user)
        .where(
          and(
            or(
              eq(schema.user.phoneNumber, normalized),
              eq(schema.user.phoneNumber, digitsOnly),
              eq(schema.user.phoneNumber, with91),
              eq(schema.user.phoneNumber, plusDigits),
            ),
            eq(schema.user.isDeleted, false),
          ),
        )
        .limit(1);

      if (userRecord.length > 0) {
        this.logger.log(
          `[Login] User ${phoneNumber} already exists in new system, skipping kirana-fe check`,
        );
        return true;
      }
      return false;
    } catch (error) {
      this.logger.warn(
        `[Login] Error checking migration status for ${phoneNumber}:`,
        error,
      );
      return false;
    }
  }

  private async loginWithOtp(
    dto: LoginOtpDto,
    appId: string,
  ): Promise<UnifiedLoginResponse> {
    // Normalize phone number for consistent detection
    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    // Check if user already migrated to new system
    const isMigrated = await this.isUserMigrated(normalizedPhone);
    if (isMigrated) {
      this.logger.log(
        `[OTP Login] User ${normalizedPhone} already migrated, proceeding with login`,
      );
    } else {
      // Check for kirana-fe user detection only if not migrated
      const isKiranaFeUser =
        await this.authService.checkKiranaFeUser(normalizedPhone);

      if (isKiranaFeUser) {
        this.logger.log(
          `[OTP Login] Kirana-FE user detected: ${normalizedPhone}`,
        );
        return this.createAlternateBackendResponse();
      }
    }

    // Verify OTP
    const result = await this.authService.verifyOtp(
      normalizedPhone,
      dto.code,
      appId,
      'otp',
    );

    this.logger.log(`[OTP Login] Success for user: ${result.user.id}`);

    return {
      success: true,
      token: result.token,
      user: result.user,
      authProvider: 'otp',
    };
  }

  private async loginWithTruecaller(
    dto: LoginTruecallerDto,
    appId: string,
  ): Promise<UnifiedLoginResponse> {
    this.logger.log(`[Truecaller Login] DTO received: ${JSON.stringify(dto)}`);
    this.logger.log(
      `[Truecaller Login] Request details - appId: ${appId}, phoneNumber: ${dto.phoneNumber}, code length: ${dto.code?.length}, code_verifier length: ${dto.code_verifier?.length}, client_id: ${dto.client_id}`,
    );
    this.logger.log(
      `[Truecaller Login] Code preview: ${dto.code?.substring(0, 30)}...`,
    );
    this.logger.log(
      `[Truecaller Login] Code verifier preview: ${dto.code_verifier?.substring(0, 30)}...`,
    );

    let skipLegacyCheck = false;

    // Early check if phone number is provided
    if (dto.phoneNumber) {
      const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);
      const isMigrated = await this.isUserMigrated(normalizedPhone);

      if (isMigrated) {
        this.logger.log(
          `[Truecaller Login] User ${normalizedPhone} already migrated, proceeding with login`,
        );
        skipLegacyCheck = true;
      } else {
        const isKiranaFeUser =
          await this.authService.checkKiranaFeUser(normalizedPhone);

        if (isKiranaFeUser) {
          this.logger.log(
            `[Truecaller Login] Kirana-FE user detected: ${normalizedPhone}`,
          );
          return this.createAlternateBackendResponse();
        }
      }
    }

    // Proceed with Truecaller OAuth - kirana-fe check will be done inside service after getting phone from Truecaller
    const result = await this.authService.truecallerSignin(
      dto.code,
      dto.code_verifier,
      dto.client_id,
      appId,
      'truecaller',
      dto.phoneNumber, // Pass optional phone number for kirana-fe check
      skipLegacyCheck,
    );

    // Check if result is an alternate backend response
    if ('error' in result && result.error === 'USE_ALTERNATE_BACKEND') {
      this.logger.log(
        `[Truecaller Login] Kirana-FE user detected, returning alternate backend response`,
      );
      return {
        success: true,
        message: result.message,
        error: result.error,
        alternateBackend: result.alternateBackend,
        alternateEndpoints: result.alternateEndpoints,
      };
    }

    // Type guard: result is now the success type
    const successResult = result as {
      token: string;
      user: AuthUserResponse & { image?: string };
      userProfile: Record<string, unknown>;
    };

    this.logger.log(
      `[Truecaller Login] Success for user: ${successResult.user.id}`,
    );

    return {
      success: true,
      token: successResult.token,
      user: successResult.user,
      userProfile: successResult.userProfile,
      authProvider: 'truecaller',
    };
  }

  private async loginWithGoogle(
    dto: LoginGoogleDto,
    appId: string,
  ): Promise<UnifiedLoginResponse> {
    // Check for kirana-fe user detection first
    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    const isMigrated = await this.isUserMigrated(normalizedPhone);
    let skipLegacyCheck = false;

    if (isMigrated) {
      this.logger.log(
        `[Google Login] User ${normalizedPhone} already migrated, proceeding with login`,
      );
      skipLegacyCheck = true;
    } else {
      const isKiranaFeUser =
        await this.authService.checkKiranaFeUser(normalizedPhone);

      if (isKiranaFeUser) {
        this.logger.log(
          `[Google Login] Kirana-FE user detected: ${normalizedPhone}`,
        );
        return this.createAlternateBackendResponse();
      }
    }

    // Proceed with Google Sign-In
    const result = await this.authService.googleSignin(
      dto.idToken,
      appId,
      'google',
      skipLegacyCheck,
    );

    this.logger.log(`[Google Login] Success for user: ${result.user.id}`);

    return {
      success: true,
      token: result.token,
      user: result.user,
      authProvider: 'google',
    };
  }
}
