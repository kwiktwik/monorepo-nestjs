import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { isValidApp } from '../config/apps.config';

@Injectable()
export class AppIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Try different header variations
    const appId =
      request.headers['x-app-id'] ||
      request.headers['X-App-ID'] ||
      request.headers['x-app-identifier'] ||
      request.headers['X-App-Identifier'];

    if (!appId) {
      throw new UnauthorizedException('X-App-ID header is required');
    }

    if (!isValidApp(appId)) {
      throw new UnauthorizedException(
        `Invalid or disabled app identifier: ${appId}`,
      );
    }

    // Store validated appId on request for downstream use
    request.appId = appId;

    return true;
  }
}
