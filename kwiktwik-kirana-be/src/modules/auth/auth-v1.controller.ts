import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  AuthService,
  AuthUserResponse,
  normalizePhoneNumber,
} from './auth.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { LoginOtpDto } from './dto/login-otp.dto';
import { LoginTruecallerDto } from './dto/login-truecaller.dto';
import { LoginGoogleDto } from './dto/login-google.dto';
import { UnifiedLoginDto } from './dto/unified-login.dto';

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
@ApiHeader({
  name: 'X-App-ID',
  required: true,
  description:
    'App identifier (e.g. com.paymentalert.app, com.sharekaro.kirana)',
})
@ApiExtraModels(LoginOtpDto, LoginTruecallerDto, LoginGoogleDto)
@Controller('api/v1/auth')
@UseGuards(AppIdGuard)
export class AuthV1Controller {
  private readonly logger = new Logger(AuthV1Controller.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unified Login (v1)',
    description:
      'Login with OTP, Truecaller, or Google. First checks for kirana-fe (legacy Flutter app) user detection.',
  })
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(LoginOtpDto) },
        { $ref: getSchemaPath(LoginTruecallerDto) },
        { $ref: getSchemaPath(LoginGoogleDto) },
      ],
      discriminator: {
        propertyName: 'provider',
        mapping: {
          otp: getSchemaPath(LoginOtpDto),
          truecaller: getSchemaPath(LoginTruecallerDto),
          google: getSchemaPath(LoginGoogleDto),
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
    @Body() credentials: LoginOtpDto | LoginTruecallerDto | LoginGoogleDto,
    @AppId() appId: string,
  ): Promise<UnifiedLoginResponse> {
    this.logger.log(`[Unified Login] App: ${appId}`);

    try {
      // Determine provider from the presence of specific fields
      const provider = this.detectProvider(credentials);
      this.logger.log(`[Unified Login] Provider detected: ${provider}`);

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
          throw new BadRequestException(
            'Unable to detect authentication provider',
          );
      }
    } catch (error) {
      this.logger.error(
        `[Unified Login] Error:`,
        error instanceof Error ? error.message : 'Unknown error',
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

  private detectProvider(
    credentials: LoginOtpDto | LoginTruecallerDto | LoginGoogleDto,
  ): ProviderType {
    // Check for OTP: has 'code' field (6 digits)
    if (
      'code' in credentials &&
      credentials.code &&
      credentials.code.match(/^\d{6}$/)
    ) {
      return 'otp';
    }

    // Check for Truecaller: has 'code_verifier' field
    if ('code_verifier' in credentials && credentials.code_verifier) {
      return 'truecaller';
    }

    // Check for Google: has 'idToken' field
    if ('idToken' in credentials && credentials.idToken) {
      return 'google';
    }

    throw new BadRequestException(
      'Unable to determine authentication provider. Please provide valid credentials.',
    );
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

  private async loginWithOtp(
    dto: LoginOtpDto,
    appId: string,
  ): Promise<UnifiedLoginResponse> {
    // Normalize phone number for consistent detection
    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    // Check for kirana-fe user detection first
    const isKiranaFeUser =
      await this.authService.checkKiranaFeUser(normalizedPhone);

    if (isKiranaFeUser) {
      this.logger.log(
        `[OTP Login] Kirana-FE user detected: ${normalizedPhone}`,
      );
      return this.createAlternateBackendResponse();
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
    // Normalize phone number for consistent detection
    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    // Check for kirana-fe user detection first
    const isKiranaFeUser =
      await this.authService.checkKiranaFeUser(normalizedPhone);

    if (isKiranaFeUser) {
      this.logger.log(
        `[Truecaller Login] Kirana-FE user detected: ${normalizedPhone}`,
      );
      return this.createAlternateBackendResponse();
    }

    // Proceed with Truecaller OAuth
    const result = await this.authService.truecallerSignin(
      dto.code,
      dto.code_verifier,
      dto.client_id,
      appId,
      'truecaller',
    );

    this.logger.log(`[Truecaller Login] Success for user: ${result.user.id}`);

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
    // Check for kirana-fe user detection first
    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);
    const isKiranaFeUser =
      await this.authService.checkKiranaFeUser(normalizedPhone);

    if (isKiranaFeUser) {
      this.logger.log(
        `[Google Login] Kirana-FE user detected: ${normalizedPhone}`,
      );
      return this.createAlternateBackendResponse();
    }

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
}
