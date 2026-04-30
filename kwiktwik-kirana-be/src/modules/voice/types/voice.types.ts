/**
 * Voice module type definitions
 * Supports API versioning and provider abstraction
 */

/**
 * Audio format configuration
 */
export interface AudioFormat {
  /** Audio encoding format */
  encoding: 'pcm16' | 'pcm' | 'opus' | 'mp3';
  /** Sample rate in Hz */
  sampleRate: number;
  /** Number of channels (1 = mono, 2 = stereo) */
  channels: number;
}

/**
 * Voice session configuration
 */
export interface VoiceSessionConfig {
  /** User ID from JWT */
  userId: string;
  /** App identifier */
  appId: string;
  /** Language code (e.g., 'en-US', 'hi-IN') */
  language: string;
  /** API version (v1, v2, etc.) */
  apiVersion: string;
  /** Optional voice name/ID */
  voiceName?: string;
  /** Input audio format */
  inputFormat: AudioFormat;
  /** Output audio format */
  outputFormat: AudioFormat;
}

/**
 * Voice stream event types
 */
export enum VoiceEventType {
  /** Audio input from client */
  AUDIO_INPUT = 'audio_input',
  /** Audio output from provider */
  AUDIO_OUTPUT = 'audio_output',
  /** Text transcript */
  TRANSCRIPT = 'transcript',
  /** Error occurred */
  ERROR = 'error',
  /** Stream closed */
  CLOSE = 'close',
  /** Interruption signal */
  INTERRUPT = 'interrupt',
}

/**
 * Voice event structure
 */
export interface VoiceEvent {
  type: VoiceEventType;
  data?: Buffer | string | unknown;
  timestamp: Date;
  isFinal?: boolean;
}

/**
 * Provider connection state
 */
export enum VoiceConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * Voice provider metadata
 */
export interface VoiceProviderMetadata {
  /** Provider name (gemini, openai, etc.) */
  name: string;
  /** API version supported */
  apiVersion: string;
  /** Available voices */
  availableVoices: string[];
  /** Supported languages */
  supportedLanguages: string[];
}

/**
 * Gemini Live API specific configuration
 */
export interface GeminiLiveConfig {
  /** Gemini model name */
  model: string;
  /** API key */
  apiKey: string;
  /** Optional system prompt/instruction */
  systemInstruction?: string;
  /** Speech configuration */
  speechConfig?: {
    voiceName?: string;
  };
}

/**
 * Rate limiting configuration
 */
export interface VoiceRateLimitConfig {
  /** Max concurrent sessions per user */
  maxSessionsPerUser: number;
  /** Session timeout in milliseconds */
  sessionTimeoutMs: number;
  /** Max audio chunk size in bytes */
  maxChunkSize: number;
}
