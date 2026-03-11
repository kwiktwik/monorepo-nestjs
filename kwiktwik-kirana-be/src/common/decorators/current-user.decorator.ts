import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser, AuthenticatedRequest } from '../types';

/**
 * Decorator to extract current user from request
 * Should only be used after JWT authentication
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
