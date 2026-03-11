import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppIdRequest } from '../types';

/**
 * Decorator to extract validated appId from request
 * Should only be used after AppIdGuard has run
 */
export const AppId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AppIdRequest>();
    return request.appId as string;
  },
);
