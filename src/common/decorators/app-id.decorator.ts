import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract validated appId from request
 * Should only be used after AppIdGuard has run
 */
export const AppId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.appId;
  },
);
