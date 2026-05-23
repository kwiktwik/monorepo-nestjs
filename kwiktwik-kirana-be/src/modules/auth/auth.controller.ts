import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { AuthRateLimitGuard, RateLimit, DEFAULT_RATE_LIMITS } from '../../common/guards/rate-limit.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleSigninDto } from './dto/google-signin.dto';
import { TruecallerSigninDto } from './dto/truecaller-signin.dto';
import { HealthMetricsService } from '../prometheus/health-metrics.service';
import { PrometheusMetricsInterceptor } from '../../common/interceptors/prometheus-metrics.interceptor';
import type { Request } from 'express';

@ApiTags('auth')
@Controller()
@UseGuards(AppIdGuard)
@UseInterceptors(PrometheusMetricsInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly metrics: HealthMetricsService,
  ) {}

  @Post('phone-number/send-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRateLimitGuard)
  @RateLimit(DEFAULT_RATE_LIMITS.OTP_SEND)
  @ApiOperation({
    summary: 'Send OTP',
    description: 'Send OTP to phone number. Rate limited: 5 requests per minute per IP.',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  async sendOtp(
    @Body() sendOtpDto: SendOtpDto,
    @Req() req: Request,
    @AppId() appId: string,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    const result = await this.authService.sendOtp(
      sendOtpDto.phoneNumber,
      sendOtpDto.appHash,
      ipAddress,
    );

    // Record OTP sent metric
    this.metrics.recordOtpSent(appId);

    return {
      success: true,
      ...result,
    };
  }

  @Post('v2/phone-number/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP v2',
    description: 'Send OTP to phone number (v2).',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded (20 OTPs/hour per phone number)',
  })
  async sendOtpV2(@Body() sendOtpDto: SendOtpDto, @Req() req: Request) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    const result = await this.authService.sendOtpV2(
      sendOtpDto.phoneNumber,
      sendOtpDto.appHash,
      ipAddress,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Post('phone-number/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verify OTP code and get JWT token',
  })
  @ApiResponse({ status: 200, description: 'OTP verified, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @AppId() appId: string) {
    const startTime = Date.now();

    try {
      const result = await this.authService.verifyOtp(
        verifyOtpDto.phoneNumber,
        verifyOtpDto.code,
        appId,
      );

      // Record successful OTP verification
      this.metrics.recordOtpVerified(appId, true);
      this.metrics.recordLoginAttempt('otp', appId);
      this.metrics.recordLoginSuccess('otp', appId);
      this.metrics.recordAuthDuration('otp_verify', (Date.now() - startTime) / 1000);

      return {
        success: true,
        message: 'OTP verified successfully',
        data: result,
      };
    } catch (error) {
      // Record failed OTP verification
      this.metrics.recordOtpVerified(appId, false);
      this.metrics.recordLoginAttempt('otp', appId);
      this.metrics.recordLoginFailure('otp', appId, 'invalid_otp');
      this.metrics.recordAuthDuration('otp_verify', (Date.now() - startTime) / 1000);
      throw error;
    }
  }

  @Post('truecaller/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Truecaller Sign-in',
    description: 'Exchange Truecaller authorization code for JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Sign-in successful, returns JWT token',
  })
  @ApiResponse({ status: 401, description: 'Invalid Truecaller authorization' })
  async truecallerSignin(
    @Body() truecallerDto: TruecallerSigninDto,
    @AppId() appId: string,
  ) {
    const result = await this.authService.truecallerSignin(
      truecallerDto.code,
      truecallerDto.code_verifier,
      truecallerDto.client_id,
      appId,
    );

    // Match the Next.js Truecaller endpoint response shape
    return {
      success: true,
      token: result.token,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      user: result?.user ?? 'User not found',
      user_profile: result.userProfile,
      appId,
    };
  }

  @Post('v2/truecaller/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Truecaller Sign-in v2',
    description:
      'Exchange Truecaller authorization code for JWT token (v2).',
  })
  @ApiResponse({
    status: 200,
    description: 'Sign-in successful, returns JWT token',
  })
  @ApiResponse({ status: 401, description: 'Invalid Truecaller authorization' })
  async truecallerSigninV2(
    @Body() truecallerDto: TruecallerSigninDto,
    @AppId() appId: string,
  ) {
    const result = await this.authService.truecallerSigninV2(
      truecallerDto.code,
      truecallerDto.code_verifier,
      truecallerDto.client_id,
      appId,
    );

    // Match the Next.js Truecaller endpoint response shape
    return {
      success: true,
      token: result.token,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      user: result?.user ?? 'User not found',
      user_profile: result.userProfile,
      appId,
    };
  }

  @Post('auth/google-signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Google Sign-in',
    description: 'Sign in with Google ID token',
  })
  @ApiResponse({
    status: 200,
    description: 'Sign-in successful, returns JWT token',
  })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  async googleSignin(
    @Body() googleSigninDto: GoogleSigninDto,
    @AppId() appId: string,
  ) {
    const result = await this.authService.googleSignin(
      googleSigninDto.idToken,
      appId,
    );

    return {
      success: true,
      message: 'Google sign-in successful',
      data: result,
    };
  }
}
