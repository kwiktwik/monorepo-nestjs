import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
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
import { AuthRateLimitGuard, RateLimit, DEFAULT_RATE_LIMITS } from '../../common/guards/rate-limit.guard';
import { AppId } from '../../common/decorators/app-id.decorator';

import {
  LoginOtpDto,
  LoginTruecallerDto,
  LoginGoogleDto,
  LoginAnonymousDto,
  LinkCredentialDto,
} from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { HealthMetricsService } from '../prometheus/health-metrics.service';
import { PrometheusMetricsInterceptor } from '../../common/interceptors/prometheus-metrics.interceptor';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
type ProviderType = 'otp' | 'truecaller' | 'google' | 'anonymous';

interface UnifiedLoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUserResponse & { image?: string };
  userProfile?: Record<string, unknown>;
  authProvider?: string;
  message?: string;
  retryAfter?: number;
}

@ApiTags('auth-v1')
@Controller('v1/auth')
@UseGuards(AppIdGuard)
@UseInterceptors(PrometheusMetricsInterceptor)
export class AuthV1Controller {
  private readonly logger = new Logger(AuthV1Controller.name);

  constructor(
    private readonly authService: AuthService,
    private readonly metrics: HealthMetricsService,
  ) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRateLimitGuard)
  @RateLimit(DEFAULT_RATE_LIMITS.OTP_SEND)
  @ApiOperation({
    summary: 'Send OTP (v1)',
    description:
      'Send OTP to phone number. Rate limited: 5 requests per minute per IP.',
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

    // Record OTP sent metric
    this.metrics.recordOtpSent(appId);

    return {
      success: true,
      ...result,
    };
  }

  @Post('login/:provider')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRateLimitGuard)
  @RateLimit(DEFAULT_RATE_LIMITS.LOGIN)
  @ApiOperation({
    summary: 'Unified Login (v1)',
    description:
      'Login with OTP, Truecaller, or Google. Rate limited: 10 requests per minute per IP.',
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
    @Body()
    credentials:
      | LoginOtpDto
      | LoginTruecallerDto
      | LoginGoogleDto
      | LoginAnonymousDto,
    @AppId() appId: string,
    @Req() req: Request,
  ): Promise<UnifiedLoginResponse> {
    this.logger.log(`[Unified Login] Provider: ${provider}, App: ${appId}`);
    this.logger.log(
      `[Unified Login] Request body: ${JSON.stringify(credentials)}`,
    );

    // Validate provider
    if (!['otp', 'truecaller', 'google', 'anonymous'].includes(provider)) {
      throw new BadRequestException(
        `Invalid provider: ${provider}. Must be one of: otp, truecaller, google, anonymous`,
      );
    }

    // Record login attempt
    this.metrics.recordLoginAttempt(provider, appId);

    const startTime = Date.now();

    try {
      // Route to appropriate login method
      let result: UnifiedLoginResponse;
      switch (provider) {
        case 'otp':
          result = await this.loginWithOtp(credentials as LoginOtpDto, appId);
          break;
        case 'truecaller':
          result = await this.loginWithTruecaller(
            credentials as LoginTruecallerDto,
            appId,
          );
          break;
        case 'google':
          result = await this.loginWithGoogle(
            credentials as LoginGoogleDto,
            appId,
          );
          break;
        case 'anonymous':
          result = await this.loginAnonymous(
            credentials as LoginAnonymousDto,
            appId,
          );
          break;
        default:
          throw new BadRequestException('Invalid provider');
      }

      // Handle X-Link-Token for cross-platform anonymous merge
      if (provider !== 'anonymous' && result.token && result.user?.id) {
        const linkToken = req.headers['x-link-token'] as string | undefined;
        if (linkToken) {
          try {
            await this.authService.mergeAnonymousUser(
              result.user.id,
              linkToken,
            );
            this.logger.log(
              `[Unified Login] Merged anonymous user via X-Link-Token for user ${result.user.id}`,
            );
          } catch (mergeError) {
            this.logger.warn(
              `[Unified Login] X-Link-Token merge failed:`,
              mergeError instanceof Error
                ? mergeError.message
                : 'Unknown error',
            );
          }
        }
      }

      // Record successful login
      this.metrics.recordLoginSuccess(provider, appId);
      this.metrics.recordAuthDuration(`${provider}_login`, (Date.now() - startTime) / 1000);

      return result;
    } catch (error) {
      this.logger.error(
        `[Unified Login] Error for provider ${provider}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      this.logger.error(
        `[Unified Login] Error details - Stack: ${error instanceof Error ? error.stack : 'N/A'}`,
      );

      // Record failed login
      const reason = error instanceof UnauthorizedException ? 'invalid_credentials' :
                     error instanceof BadRequestException ? 'bad_request' : 'server_error';
      this.metrics.recordLoginFailure(provider, appId, reason);
      this.metrics.recordAuthDuration(`${provider}_login`, (Date.now() - startTime) / 1000);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async loginWithOtp(
    dto: LoginOtpDto,
    appId: string,
  ): Promise<UnifiedLoginResponse> {
    // Normalize phone number for consistent detection
    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    // Verify OTP
    const result = await this.authService.verifyOtp(
      normalizedPhone,
      dto.code,
      appId,
      'otp',
    );

    // Record OTP verification success
    this.metrics.recordOtpVerified(appId, true);

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

    // Proceed with Truecaller OAuth
    const result = await this.authService.truecallerSignin(
      dto.code,
      dto.code_verifier,
      dto.client_id,
      appId,
      'truecaller',
    );

    this.logger.log(
      `[Truecaller Login] Success for user: ${result.user.id}`,
    );

    return {
      success: true,
      token: result.token,
      user: result.user,
      userProfile: result.userProfile,
      authProvider: 'truecaller',
    };
  }

  private async loginWithGoogle(
    dto: LoginGoogleDto,
    appId: string,
  ): Promise<UnifiedLoginResponse> {
    // Proceed with Google Sign-In
    const result = await this.authService.googleSignin(
      dto.idToken,
      appId,
      'google',
    );

    this.logger.log(`[Google Login] Success for user: ${result.user.id}`);

    return {
      success: true,
      token: result.token,
      user: result.user,
      authProvider: 'google',
    };
  }

  private async loginAnonymous(
    dto: LoginAnonymousDto,
    appId: string,
  ): Promise<UnifiedLoginResponse> {
    const result = await this.authService.anonymousLogin(
      dto.firebaseToken,
      appId,
    );

    this.logger.log(
      `[Anonymous Login] Success for user: ${result.user.id}`,
    );

    return {
      success: true,
      token: result.token,
      user: result.user,
      authProvider: 'anonymous',
    };
  }

  @Post('link-credential')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Link credential to anonymous account',
    description:
      'Upgrade an anonymous user by linking a real credential (OTP or Google). Requires anonymous JWT in Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account linked successfully, returns new JWT token',
  })
  @ApiResponse({
    status: 400,
    description: 'Account is not anonymous or invalid provider',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token / OTP' })
  async linkCredential(
    @Body() dto: LinkCredentialDto,
    @CurrentUser() user: { userId: string; appId: string; isAnonymous?: boolean },
    @AppId() appId: string,
  ): Promise<UnifiedLoginResponse> {
    this.logger.log(
      `[Link Credential] Provider: ${dto.provider}, User: ${user.userId}, App: ${appId}`,
    );

    const result = await this.authService.linkCredential(
      user.userId,
      dto.provider,
      {
        phoneNumber: dto.phoneNumber,
        code: dto.code,
        idToken: dto.idToken,
        code_verifier: dto.code_verifier,
        client_id: dto.client_id,
      },
      appId,
    );

    this.logger.log(
      `[Link Credential] Success for user: ${result.user.id}`,
    );

    return {
      success: true,
      token: result.token,
      user: result.user,
      authProvider: dto.provider,
    };
  }
}
