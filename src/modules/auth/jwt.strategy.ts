import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string; // userId
  appId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(config: ConfigService) {
    const secret =
      config.get<string>('JWT_SECRET') || 'your-secret-key-change-this';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.logger.log(
      `JWT Strategy: ${config.get('JWT_SECRET') ? 'JWT_SECRET from config' : 'using default secret'}`,
    );
  }

  async validate(payload: JwtPayload) {
    this.logger.debug(
      `JWT validate: sub=${payload?.sub}, appId=${payload?.appId}`,
    );
    if (!payload?.sub || !payload?.appId) {
      this.logger.warn(`Invalid token payload: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      appId: payload.appId,
    };
  }
}
