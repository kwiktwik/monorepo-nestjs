import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { VoiceGateway } from './voice.gateway';
import { VoiceConfigService } from './config/voice-config.service';
import { SlydeeModule } from '../slydee/slydee.module';

@Module({
  imports: [
    ConfigModule,
    SlydeeModule,
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
  providers: [VoiceGateway, VoiceConfigService],
  exports: [VoiceConfigService],
})
export class VoiceModule {}
