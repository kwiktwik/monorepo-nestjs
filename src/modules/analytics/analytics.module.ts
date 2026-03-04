import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ConfigModule } from '@nestjs/config';
import { DeviceSessionModule } from '../device-session/device-session.module';

@Module({
  imports: [ConfigModule, DeviceSessionModule],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
