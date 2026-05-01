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
  version: string;
  provider: string;
  model: string;
  apiKey: string;
  defaultVoice: string;
  inputFormat: AudioFormat;
  outputFormat: AudioFormat;
  rateLimit: VoiceRateLimitConfig;
  /** Vertex AI: GCP project ID */
  projectId: string;
  /** Vertex AI: GCP region */
  region: string;
  /** Vertex AI: path to service account JSON */
  serviceAccountPath: string;
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
      provider: this.configService.get<string>(`VOICE_PROVIDER_${version}`, 'vertex'),
      model: this.configService.get<string>(`VOICE_MODEL_${version}`, 'gemini-2.0-flash-live-001'),
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
      // Vertex AI
      projectId: this.configService.get<string>(`VERTEX_PROJECT_ID_${version}`, 'storyowl-kwiktwik'),
      region: this.configService.get<string>(`VERTEX_REGION_${version}`, 'us-central1'),
      serviceAccountPath: this.configService.get<string>(
        `VERTEX_SA_KEY_PATH_${version}`,
        './secrets/vertex-ai-storyowl-key.json',
      ),
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
