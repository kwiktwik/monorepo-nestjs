import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Headers interface for device identifiers
 * Supports both firebaseInstallationId and deviceId
 */
export interface DeviceIdHeaders {
  'x-firebase-installation-id'?: string | string[];
  'X-Firebase-Installation-ID'?: string | string[];
  'x-device-id'?: string | string[];
  'X-Device-ID'?: string | string[];
  'x-device-identifier'?: string | string[];
  'X-Device-Identifier'?: string | string[];
}

/**
 * Extracted device identifiers from request
 */
export interface ExtractedDeviceIds {
  firebaseInstallationId?: string;
  deviceId?: string;
}

/**
 * Decorator to extract firebaseInstallationId and deviceId from request headers.
 *
 * Priority for identity resolution (handled by guard/service):
 *   firebaseInstallationId > deviceId > userId
 *
 * Usage:
 *   @Get('evaluate')
 *   evaluate(@DeviceIds() deviceIds: ExtractedDeviceIds) {
 *     // deviceIds.firebaseInstallationId or deviceIds.deviceId
 *   }
 *
 * If neither header is present, returns { firebaseInstallationId: undefined, deviceId: undefined }
 * The guard/service will fail if no identity (including userId) is available.
 */
export const DeviceIds = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ExtractedDeviceIds => {
    const request = ctx.switchToHttp().getRequest();
    const headers = request.headers as DeviceIdHeaders;

    // Extract firebaseInstallationId (check all header variations)
    const firebaseInstallationIdRaw =
      headers['x-firebase-installation-id'] ||
      headers['X-Firebase-Installation-ID'];

    // Extract deviceId (check all header variations)
    const deviceIdRaw =
      headers['x-device-id'] ||
      headers['X-Device-ID'] ||
      headers['x-device-identifier'] ||
      headers['X-Device-Identifier'];

    // Handle array values (Express can parse headers as arrays)
    const firebaseInstallationId = Array.isArray(firebaseInstallationIdRaw)
      ? firebaseInstallationIdRaw[0]
      : firebaseInstallationIdRaw;

    const deviceId = Array.isArray(deviceIdRaw) ? deviceIdRaw[0] : deviceIdRaw;

    return {
      firebaseInstallationId: firebaseInstallationId || undefined,
      deviceId: deviceId || undefined,
    };
  },
);
