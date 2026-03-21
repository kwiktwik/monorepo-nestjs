import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthV1Controller } from './auth-v1.controller';
import { InternalAuthController } from './internal-auth.controller';
import { AuthService } from './auth.service';
import { KiranaFeInternalService } from './services/kirana-fe-internal.service';
import { JwtStrategy } from './jwt.strategy';
import { MigrationModule } from '../migration/migration.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    MigrationModule,
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
  providers: [AuthService, KiranaFeInternalService, JwtStrategy],
  exports: [AuthService, KiranaFeInternalService],
})
export class AuthModule {}
