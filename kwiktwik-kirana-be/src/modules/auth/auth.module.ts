import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthV1Controller } from './auth-v1.controller';
import { InternalAuthController } from './internal-auth.controller';
import { AuthService } from './auth.service';
import { LegacyFeInternalService } from './services/legacy-fe-internal.service';
import { JwtStrategy } from './jwt.strategy';
@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') || 'your-secret-key-change-this',
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, AuthV1Controller, InternalAuthController],
  providers: [AuthService, LegacyFeInternalService, JwtStrategy],
  exports: [AuthService, LegacyFeInternalService],
})
export class AuthModule {}
