import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { AuthService, AuthUserResponse } from './auth.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleSigninDto } from './dto/google-signin.dto';
import { TruecallerSigninDto } from './dto/truecaller-signin.dto';
import type { Request } from 'express';

@ApiTags('auth')
@ApiHeader({
  name: 'X-App-ID',
  required: true,
  description:
    'App identifier (e.g. com.paymentalert.app, com.sharekaro.kirana)',
})
@Controller()
@UseGuards(AppIdGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('phone-number/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP',
    description: 'Send OTP to phone number. No JWT required.',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded (60s cooldown, 10/day per number)',
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto, @Req() req: Request) {
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
    const result = await this.authService.verifyOtp(
      verifyOtpDto.phoneNumber,
      verifyOtpDto.code,
      appId,
    );

    return {
      success: true,
      message: 'OTP verified successfully',
      data: result,
    };
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
