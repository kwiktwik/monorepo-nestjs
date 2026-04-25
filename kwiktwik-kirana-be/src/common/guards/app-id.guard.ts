import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AppsService } from '../../modules/apps/apps.service';
import { AppIdRequest, AppIdHeaders } from '../types';

@Injectable()
export class AppIdGuard implements CanActivate {
  constructor(private readonly appsService: AppsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AppIdRequest>();

    const headers = request.headers as AppIdHeaders;
    const appId =
      headers['x-app-id'] ||
      headers['X-App-ID'] ||
      headers['x-app-identifier'] ||
      headers['X-App-Identifier'];

    const validAppId = Array.isArray(appId) ? appId[0] : appId;

    if (!validAppId) {
      throw new UnauthorizedException('X-App-ID header is required');
    }

    // Use AppsService which checks cache first, falls back to hardcoded
    if (!this.appsService.isValidApp(validAppId)) {
      throw new UnauthorizedException(
        `Invalid or disabled app identifier: ${validAppId}`,
      );
    }

    request.appId = validAppId;

    return true;
  }
}
