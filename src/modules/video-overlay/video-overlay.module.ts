import { Module } from '@nestjs/common';
import { VideoOverlayController } from './video-overlay.controller';
import { VideoOverlayService } from './video-overlay.service';

@Module({
  controllers: [VideoOverlayController],
  providers: [VideoOverlayService],
  exports: [VideoOverlayService],
})
export class VideoOverlayModule {}
