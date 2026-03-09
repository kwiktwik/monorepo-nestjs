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
import { KiranaFeInternalService } from './services/kirana-fe-internal.service';
import { AuthService, normalizePhoneNumber } from './auth.service';

class CheckKiranaUserDto {
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
    private readonly kiranaFeService: KiranaFeInternalService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.internalApiKey = this.configService.get<string>(
      'INTERNAL_API_KEY',
      '',
    );
  }

  /**
   * Internal endpoint to check if user exists in kirana-fe (Flutter app)
   * This endpoint should only be called by internal services, not exposed to internet
   *
   * POST /internal/auth/check-kirana-user
   * Headers:
   *   X-Internal-Key: <internal_api_key>
   * Body:
   *   { phoneNumber: "+919876543210" }
   *
   * Response:
   *   { exists: true, message: "User exists in kirana-fe" }
   *   or
   *   { exists: false, message: "User not found" }
   */
  @Post('check-kirana-user')
  async checkKiranaUser(
    @Body() dto: CheckKiranaUserDto,
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

    // Call kirana-fe internal service to check user
    const exists = await this.kiranaFeService.checkUserExists(normalizedPhone);

    return {
      exists,
      phoneNumber: normalizedPhone,
      message: exists
        ? 'User exists in kirana-fe legacy system'
        : 'User not found in kirana-fe',
    };
  }

  /**
   * Alternative: Direct database check (fallback if kirana-fe API is down)
   * This checks the shared database directly
   *
   * POST /internal/auth/check-kirana-user-local
   * Headers:
   *   X-Internal-Key: <internal_api_key>
   */
  @Post('check-kirana-user-local')
  async checkKiranaUserLocal(
    @Body() dto: CheckKiranaUserDto,
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
    const exists = await this.authService.checkKiranaFeUser(normalizedPhone);

    return {
      exists,
      phoneNumber: normalizedPhone,
      message: exists
        ? 'User exists in kirana-fe (checked via local DB)'
        : 'User not found in kirana-fe (checked via local DB)',
    };
  }
}
