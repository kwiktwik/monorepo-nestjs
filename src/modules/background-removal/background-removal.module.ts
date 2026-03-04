import { Module } from '@nestjs/common';
import { BackgroundRemovalController } from './background-removal.controller';
import { BackgroundRemovalService } from './background-removal.service';

@Module({
  controllers: [BackgroundRemovalController],
  providers: [BackgroundRemovalService],
})
export class BackgroundRemovalModule {}
