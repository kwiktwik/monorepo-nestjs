import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser>(err: Error | null, user: TUser | false): TUser {
    if (err) {
      this.logger.warn(
        `JWT auth failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err instanceof UnauthorizedException
        ? err
        : new UnauthorizedException(
            err instanceof Error ? err.message : 'Invalid token',
          );
    }
    if (!user) {
      this.logger.warn('JWT auth: no user (token invalid or expired)');
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
