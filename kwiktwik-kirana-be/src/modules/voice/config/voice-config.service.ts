/**
 * Voice Configuration Service
 * Manages API versioned configuration for voice providers
 */

import { Injectable } from '@nestjs/common';
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
  /**
   * Get configuration for a specific API version
   * @param apiVersion - API version string (v1, v2, etc.)
   */
  getVersionConfig(apiVersion: string = 'v1'): VoiceVersionConfig {
    return {
      version: apiVersion,
      provider: 'vertex',
      model: 'gemini-2.0-flash-live-preview',
      apiKey: '',
      defaultVoice: 'Puck',
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
      // Vertex AI - hardcoded configuration
      projectId: 'storyowl-kwiktwik',
      region: 'us-central1',
      serviceAccountPath: './secrets/vertex-ai-storyowl-key.json',
    };
  }

  /**
   * Get the default API version
   */
  getDefaultVersion(): string {
    return 'v1';
  }

  /**
   * Get provider name for a version
   */
  getProviderForVersion(apiVersion: string = 'v1'): string {
    return 'vertex';
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
