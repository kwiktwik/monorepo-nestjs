import { CompanionProfile } from '../../slydee/slydee.types';

export interface AudioFormat {
  encoding: 'pcm16' | 'pcm' | 'opus' | 'mp3';
  sampleRate: number;
  channels: number;
}

export interface VoiceSessionConfig {
  userId: string;
  appId: string;
  language: string;
  apiVersion: string;
  voiceName?: string;
  inputFormat: AudioFormat;
  outputFormat: AudioFormat;
  persona?: CompanionProfile;
  systemInstruction?: string;
}

export enum VoiceConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export interface VoiceRateLimitConfig {
  maxSessionsPerUser: number;
  sessionTimeoutMs: number;
  maxChunkSize: number;
}
