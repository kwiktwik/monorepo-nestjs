import { Injectable } from '@nestjs/common';
import { AudioFormat, VoiceRateLimitConfig } from '../types/voice.types';

export interface VoiceVersionConfig {
  version: string;
  model: string;
  defaultVoice: string;
  inputFormat: AudioFormat;
  outputFormat: AudioFormat;
  rateLimit: VoiceRateLimitConfig;
}

@Injectable()
export class VoiceConfigService {
  getVersionConfig(apiVersion: string = 'v1'): VoiceVersionConfig {
    return {
      version: apiVersion,
      model: 'gemini-live-2.5-flash-native-audio',
      defaultVoice: 'Achernar',
      inputFormat: {
        encoding: 'pcm16',
        sampleRate: 24000,
        channels: 1,
      },
      outputFormat: {
        encoding: 'pcm16',
        sampleRate: 24000,
        channels: 1,
      },
      rateLimit: {
        maxSessionsPerUser: 5,
        sessionTimeoutMs: 300000,
        maxChunkSize: 65536,
      },
    };
  }
}
