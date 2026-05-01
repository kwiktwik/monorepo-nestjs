/**
 * Voice WebSocket Message DTOs
 * Defines message types for bidirectional WebSocket communication
 * Replaces HTTP/2 streaming with structured WebSocket messages
 */

/**
 * Voice message types
 */
export enum VoiceMessageType {
  // Client -> Server
  START_SESSION = 'start_session',
  AUDIO_INPUT = 'audio_input',
  INTERRUPT = 'interrupt',
  END_SESSION = 'end_session',

  // Server -> Client
  CONNECTED = 'connected',
  SESSION_STARTED = 'session_started',
  AUDIO_OUTPUT = 'audio_output',
  TRANSCRIPT = 'transcript',
  INTERRUPTED = 'interrupted',
  SESSION_ENDED = 'session_ended',
  ERROR = 'error',
}

/**
 * Base voice WebSocket message
 */
export interface VoiceWebSocketMessage {
  type: VoiceMessageType;
  timestamp?: string;
}

// ========== Client to Server Messages ==========

/**
 * Start voice session request
 * Client -> Server
 */
export interface StartSessionMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.START_SESSION;
  /** API version (v1, v2, etc.) */
  apiVersion?: string;
  /** Language code (e.g., 'en-US', 'hi-IN') */
  language?: string;
  /** Voice name to use */
  voiceName?: string;
  /** System instruction/prompt */
  systemInstruction?: string;
}

/**
 * Audio input message
 * Client -> Server
 */
export interface AudioInputMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.AUDIO_INPUT;
  /** Base64-encoded audio data (PCM16 format) */
  audio: string;
}

/**
 * Interrupt message
 * Client -> Server
 */
export interface InterruptMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.INTERRUPT;
}

/**
 * End session message
 * Client -> Server
 */
export interface EndSessionMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.END_SESSION;
}

// ========== Server to Client Messages ==========

/**
 * Connection acknowledgment
 * Server -> Client
 */
export interface ConnectedMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.CONNECTED;
  /** Session ID */
  sessionId: string;
  /** API version */
  apiVersion: string;
  /** Connection message */
  message: string;
}

/**
 * Session started acknowledgment
 * Server -> Client
 */
export interface SessionStartedMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.SESSION_STARTED;
  /** Session ID */
  sessionId: string;
  /** Provider name */
  provider: string;
  /** API version */
  apiVersion: string;
  /** Selected voice name */
  voiceName?: string;
  /** Audio format configuration */
  audioFormat: {
    encoding: string;
    sampleRate: number;
    channels: number;
  };
}

/**
 * Audio output message
 * Server -> Client
 */
export interface AudioOutputMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.AUDIO_OUTPUT;
  /** Base64-encoded audio data (PCM16 format) */
  audio: string;
}

/**
 * Transcript message
 * Server -> Client
 */
export interface TranscriptMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.TRANSCRIPT;
  /** Transcribed text */
  text: string;
  /** Whether this is the final transcript */
  isFinal: boolean;
}

/**
 * Interrupted acknowledgment
 * Server -> Client
 */
export interface InterruptedMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.INTERRUPTED;
}

/**
 * Session ended message
 * Server -> Client
 */
export interface SessionEndedMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.SESSION_ENDED;
  /** Reason for session end */
  reason: 'user_requested' | 'stream_closed' | 'error';
}

/**
 * Error message
 * Server -> Client
 */
export interface ErrorMessage extends VoiceWebSocketMessage {
  type: VoiceMessageType.ERROR;
  /** Error code */
  code: string;
  /** Error message */
  message: string;
}

// ========== Socket.io Event Types ==========

/**
 * Client to server events
 */
export interface ClientToServerEvents {
  start_session: (data: StartSessionMessage) => void;
  audio_input: (data: AudioInputMessage) => void;
  interrupt: (data: InterruptMessage) => void;
  end_session: (data: EndSessionMessage) => void;
}

/**
 * Server to client events
 */
export interface ServerToClientEvents {
  connected: (data: ConnectedMessage) => void;
  session_started: (data: SessionStartedMessage) => void;
  audio_output: (data: AudioOutputMessage) => void;
  transcript: (data: TranscriptMessage) => void;
  interrupted: (data: InterruptedMessage) => void;
  session_ended: (data: SessionEndedMessage) => void;
  error: (data: ErrorMessage) => void;
}

/**
 * Inter-server events (not used in this implementation)
 */
export interface InterServerEvents {
  // Reserved for future use (e.g., server-to-server communication)
}

/**
 * Socket data (stored on socket instance)
 */
export interface SocketData {
  userId?: string;
  appId?: string;
  sessionId?: string;
  isAuthenticated?: boolean;
}
