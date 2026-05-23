import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { LegacyFeInternalService } from './services/legacy-fe-internal.service';
import { AuthService, normalizePhoneNumber } from './auth.service';

class CheckLegacyUserDto {
  phoneNumber: string;
}

/**
 * Internal API endpoints - NOT exposed to public internet
 * These endpoints are for internal service-to-service communication only
 * Protected by internal API key
 */
@ApiExcludeController() // Hide from Swagger docs
@Controller('internal/auth')
export class InternalAuthController {
  private readonly internalApiKey: string;

  constructor(
    private readonly legacyFeService: LegacyFeInternalService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.internalApiKey = this.configService.get<string>(
      'INTERNAL_API_KEY',
      '',
    );
  }

  /**
   * Internal endpoint to check if user exists in legacy Flutter app
   * This endpoint should only be called by internal services, not exposed to internet
   *
   * POST /internal/auth/check-legacy-user
   * Headers:
   *   X-Internal-Key: <internal_api_key>
   * Body:
   *   { phoneNumber: "+919876543210" }
   *
   * Response:
   *   { exists: true, message: "User exists in legacy system" }
   *   or
   *   { exists: false, message: "User not found" }
   */
  @Post('check-legacy-user')
  async checkLegacyUser(
    @Body() dto: CheckLegacyUserDto,
    @Headers('x-internal-key') internalKey: string,
  ) {
    // Validate internal API key - this ensures endpoint is not publicly accessible
    if (!this.internalApiKey || internalKey !== this.internalApiKey) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    if (!dto.phoneNumber) {
      throw new BadRequestException('phoneNumber is required');
    }

    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    // Call legacy FE internal service to check user
    const exists = await this.legacyFeService.checkUserExists(normalizedPhone);

    return {
      exists,
      phoneNumber: normalizedPhone,
      message: exists
        ? 'User exists in legacy system'
        : 'User not found in legacy system',
    };
  }

  /**
   * Alternative: Direct database check (fallback if legacy FE API is down)
   * This checks the shared database directly
   *
   * POST /internal/auth/check-legacy-user-local
   * Headers:
   *   X-Internal-Key: <internal_api_key>
   */
  @Post('check-legacy-user-local')
  async checkLegacyUserLocal(
    @Body() dto: CheckLegacyUserDto,
    @Headers('x-internal-key') internalKey: string,
  ) {
    // Validate internal API key
    if (!this.internalApiKey || internalKey !== this.internalApiKey) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    if (!dto.phoneNumber) {
      throw new BadRequestException('phoneNumber is required');
    }

    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    // Use the existing auth service method (checks local DB)
    const exists = await this.authService.checkLegacyFeUser(normalizedPhone);

    return {
      exists,
      phoneNumber: normalizedPhone,
      message: exists
        ? 'User exists in legacy system (checked via local DB)'
        : 'User not found in legacy system (checked via local DB)',
    };
  }
}
