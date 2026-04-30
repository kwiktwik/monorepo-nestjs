/**
 * Voice Stream Request DTO
 * Defines the request body for starting a voice stream session
 */

import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

/**
 * Supported languages
 */
export enum VoiceLanguage {
  ENGLISH_US = 'en-US',
  ENGLISH = 'en',
  HINDI_IN = 'hi-IN',
  HINDI = 'hi',
}

/**
 * Voice stream request DTO
 */
export class StartVoiceStreamDto {
  /**
   * Language code for the conversation
   * @default 'en-US'
   */
  @IsOptional()
  @IsEnum(VoiceLanguage)
  language?: VoiceLanguage = VoiceLanguage.ENGLISH_US;

  /**
   * Optional voice name to use
   * For Gemini: Puck, Charon, Kore, Fenrir, Aoede
   */
  @IsOptional()
  @IsString()
  voiceName?: string;

  /**
   * Optional system instruction/prompt
   * Overrides default assistant behavior
   */
  @IsOptional()
  @IsString()
  systemInstruction?: string;

  /**
   * Optional additional configuration
   * Provider-specific settings
   */
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

/**
 * Voice stream response DTO
 * Returned when a stream is successfully created
 */
export class VoiceStreamResponseDto {
  /**
   * Session ID for the voice stream
   */
  sessionId: string;

  /**
   * API version being used
   */
  apiVersion: string;

  /**
   * Provider name
   */
  provider: string;

  /**
   * Selected voice name
   */
  voiceName: string;

  /**
   * Audio format configuration
   */
  audioFormat: {
    encoding: string;
    sampleRate: number;
    channels: number;
  };

  /**
   * Session timeout in milliseconds
   */
  sessionTimeoutMs: number;
}
