/**
 * Voice Provider Interface
 * Abstract contract for voice-to-voice providers
 * Allows easy swapping between Gemini, OpenAI, ElevenLabs, etc.
 */

import { VoiceSessionConfig } from '../types/voice.types';

/**
 * Voice stream interface - bidirectional audio streaming
 */
export interface VoiceStream {
  /**
   * Send audio chunk to provider (raw bytes)
   * @param chunk - Audio data buffer (PCM16 format)
   */
  sendAudio(chunk: Buffer): void;

  /**
   * Send text input to provider (optional feature)
   * @param text - Text to speak
   */
  sendText(text: string): void;

  /**
   * Interrupt current audio generation
   */
  interrupt(): void;

  /**
   * Register callback for audio output from provider
   * @param callback - Receives audio buffer chunks
   */
  onAudioOutput(callback: (audio: Buffer) => void): void;

  /**
   * Register callback for transcription events
   * @param callback - Receives transcript text and final flag
   */
  onTranscript(callback: (text: string, isFinal: boolean) => void): void;

  /**
   * Register callback for errors
   * @param callback - Receives error object
   */
  onError(callback: (error: Error) => void): void;

  /**
   * Register callback when stream closes
   * @param callback - Called when stream ends
   */
  onClose(callback: () => void): void;

  /**
   * Close the voice stream
   */
  close(): void;

  /**
   * Get current connection state
   */
  getState(): string;
}

/**
 * Voice provider interface
 * Implement this to add new voice providers
 */
export interface VoiceProvider {
  /**
   * Provider version identifier
   * Format: 'v1', 'v2', etc.
   */
  readonly version: string;

  /**
   * Provider name
   */
  readonly name: string;

  /**
   * Create a bidirectional voice stream
   * @param config - Session configuration
   * @returns VoiceStream instance
   */
  createStream(config: VoiceSessionConfig): Promise<VoiceStream>;

  /**
   * Check if provider is available/healthy
   * @returns true if provider can accept connections
   */
  isAvailable(): Promise<boolean>;
}
