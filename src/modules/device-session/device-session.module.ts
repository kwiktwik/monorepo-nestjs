import { Module } from '@nestjs/common';
import { DeviceSessionController } from './device-session.controller';
import { DeviceSessionService } from './device-session.service';

@Module({
  controllers: [DeviceSessionController],
  providers: [DeviceSessionService],
  exports: [DeviceSessionService],
})
export class DeviceSessionModule {}
