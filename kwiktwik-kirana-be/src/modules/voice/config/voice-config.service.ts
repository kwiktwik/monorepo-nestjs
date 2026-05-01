/**
 * Voice Configuration Service
 * Manages API versioned configuration for voice providers
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AudioFormat, VoiceRateLimitConfig } from '../types/voice.types';

/**
 * Configuration for a specific API version
 */
export interface VoiceVersionConfig {
  /** API version (v1, v2, etc.) */
  version: string;
  /** Provider name (gemini, openai, etc.) */
  provider: string;
  /** Model name */
  model: string;
  /** Provider-specific API key */
  apiKey: string;
  /** Default voice name */
  defaultVoice: string;
  /** Input audio format */
  inputFormat: AudioFormat;
  /** Output audio format */
  outputFormat: AudioFormat;
  /** Rate limiting configuration */
  rateLimit: VoiceRateLimitConfig;
}

@Injectable()
export class VoiceConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get configuration for a specific API version
   * @param apiVersion - API version string (v1, v2, etc.)
   */
  getVersionConfig(apiVersion: string = 'v1'): VoiceVersionConfig {
    const version = apiVersion.toUpperCase().replace('.', '_');

    return {
      version: apiVersion,
      provider: this.configService.get<string>(`VOICE_PROVIDER_${version}`, 'gemini'),
      apiKey: this.configService.get<string>(`GEMINI_API_KEY_${version}`, ''),
      defaultVoice: this.configService.get<string>(`GEMINI_VOICE_${version}`, 'Puck'),
      inputFormat: {
        encoding: 'pcm16',
        sampleRate: this.configService.get<number>(`VOICE_INPUT_SAMPLE_RATE_${version}`, 24000),
        channels: 1,
      },
      outputFormat: {
        encoding: 'pcm16',
        sampleRate: this.configService.get<number>(`VOICE_OUTPUT_SAMPLE_RATE_${version}`, 24000),
        channels: 1,
      },
      rateLimit: {
        maxSessionsPerUser: this.configService.get<number>(`VOICE_MAX_SESSIONS_PER_USER_${version}`, 5),
        sessionTimeoutMs: this.configService.get<number>(`VOICE_SESSION_TIMEOUT_MS_${version}`, 300000),
        maxChunkSize: this.configService.get<number>(`VOICE_MAX_CHUNK_SIZE_${version}`, 65536),
      },
    };
  }

  /**
   * Get the default API version
   */
  getDefaultVersion(): string {
    return this.configService.get<string>('VOICE_API_VERSION', 'v1');
  }

  /**
   * Get provider name for a version
   */
  getProviderForVersion(apiVersion: string = 'v1'): string {
    const version = apiVersion.toUpperCase().replace('.', '_');
    return this.configService.get<string>(`VOICE_PROVIDER_${version}`, 'gemini');
  }

  /**
   * Get available API versions
   */
  getAvailableVersions(): string[] {
    // Currently only v1 is implemented
    // Add new versions here as they are implemented
    return ['v1'];
  }

  /**
   * Check if an API version is supported
   */
  isVersionSupported(apiVersion: string): boolean {
    return this.getAvailableVersions().includes(apiVersion.toLowerCase());
  }
}
