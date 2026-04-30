/**
 * Voice Module
 * Provider-agnostic voice-to-voice streaming module
 * Supports API versioning for future provider swaps
 */

import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceConfigService } from './config/voice-config.service';

@Module({
  controllers: [VoiceController],
  providers: [VoiceConfigService],
  exports: [VoiceConfigService],
})
export class VoiceModule {}
