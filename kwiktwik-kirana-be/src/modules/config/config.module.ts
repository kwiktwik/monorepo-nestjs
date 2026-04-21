import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { PaywallEngineService } from './paywall-engine.service';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ConfigController],
  providers: [PaywallEngineService, ConfigService],
})
export class ConfigModule {}
