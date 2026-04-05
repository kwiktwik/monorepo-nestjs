import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { isValidApp } from '../config/apps.config';
import { AppIdRequest, AppIdHeaders } from '../types';
import { DeviceIdHeaders } from '../decorators/device-id.decorator';

/**
 * Extended request type for Feature Toggle with identity
 */
export interface FeatureToggleRequest extends AppIdRequest {
  identity?: {
    firebaseInstallationId?: string;
    deviceId?: string;
    userId?: string;
  };
}

/**
 * Guard for Feature Toggle endpoints.
 *
 * Strict validation - NO defaults, NO fallbacks:
 * 1. X-App-ID header is required → fails if missing
 * 2. At least one identity is required: firebaseInstallationId || deviceId || userId
 *    - firebaseInstallationId: from X-Firebase-Installation-ID header
 *    - deviceId: from X-Device-ID header
 *    - userId: from JWT (request.user.userId if authenticated)
 *
 * If any required field is missing, throws BadRequestException.
 * No silent fallbacks to defaults.
 */
@Injectable()
export class FeatureToggleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FeatureToggleRequest>();

    // ─────────────────────────────────────────────────────────────
    // 1. Validate appId from X-App-ID header (required, strict)
    // ─────────────────────────────────────────────────────────────
    const headers = request.headers as AppIdHeaders & DeviceIdHeaders;
    const appIdRaw =
      headers['x-app-id'] ||
      headers['X-App-ID'] ||
      headers['x-app-identifier'] ||
      headers['X-App-Identifier'];

    const appId = Array.isArray(appIdRaw) ? appIdRaw[0] : appIdRaw;

    if (!appId) {
      throw new BadRequestException({
        success: false,
        error: 'X-App-ID header is required',
        code: 'MISSING_APP_ID',
      });
    }

    if (!isValidApp(appId)) {
      throw new BadRequestException({
        success: false,
        error: `Invalid or disabled app identifier: ${appId}`,
        code: 'MISSING_APP_ID',
      });
    }

    request.appId = appId;

    // ─────────────────────────────────────────────────────────────
    // 2. Extract identity sources
    // ─────────────────────────────────────────────────────────────
    const firebaseInstallationIdRaw =
      headers['x-firebase-installation-id'] ||
      headers['X-Firebase-Installation-ID'];

    const deviceIdRaw =
      headers['x-device-id'] ||
      headers['X-Device-ID'] ||
      headers['x-device-identifier'] ||
      headers['X-Device-Identifier'];

    const firebaseInstallationId = Array.isArray(firebaseInstallationIdRaw)
      ? firebaseInstallationIdRaw[0]
      : firebaseInstallationIdRaw;

    const deviceId = Array.isArray(deviceIdRaw) ? deviceIdRaw[0] : deviceIdRaw;

    // userId from JWT (if authenticated via JwtAuthGuard before this guard)
    // Use type assertion since JwtStrategy.validate() returns { userId: string, ... }
    const userId = (request.user as { userId?: string } | undefined)?.userId;

    // ─────────────────────────────────────────────────────────────
    // 3. Validate at least one identity is present (strict)
    //    firebaseInstallationId || deviceId || userId
    // ─────────────────────────────────────────────────────────────
    const hasFirebaseId = !!firebaseInstallationId?.trim();
    const hasDeviceId = !!deviceId?.trim();
    const hasUserId = !!userId?.trim();

    if (!hasFirebaseId && !hasDeviceId && !hasUserId) {
      throw new BadRequestException({
        success: false,
        error:
          'At least one identity is required: X-Firebase-Installation-ID, X-Device-ID, or authenticated userId (JWT)',
        code: 'MISSING_IDENTITY',
        details: {
          message:
            'Provide firebaseInstallationId (X-Firebase-Installation-ID header), deviceId (X-Device-ID header), or ensure JWT authentication for userId',
          fields: ['firebaseInstallationId', 'deviceId', 'userId'],
        },
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Attach identity to request for downstream use
    // ─────────────────────────────────────────────────────────────
    request.identity = {
      firebaseInstallationId: hasFirebaseId
        ? firebaseInstallationId!.trim()
        : undefined,
      deviceId: hasDeviceId ? deviceId!.trim() : undefined,
      userId: hasUserId ? userId!.trim() : undefined,
    };

    return true;
  }
}
