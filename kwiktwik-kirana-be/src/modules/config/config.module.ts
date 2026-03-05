import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { PaywallEngineService } from './paywall-engine.service';

@Module({
  controllers: [ConfigController],
  providers: [PaywallEngineService, ConfigService],
})
export class ConfigModule {}
