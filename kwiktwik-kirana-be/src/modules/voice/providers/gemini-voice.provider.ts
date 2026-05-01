/**
 * Gemini Live API Voice Provider Implementation
 * Connects to Google's Gemini Live API via WebSocket
 * Implements VoiceProvider interface for provider abstraction
 */

import { Injectable, Logger } from '@nestjs/common';
import WebSocket from 'ws';
import { VoiceProvider, VoiceStream } from '../interfaces/voice-provider.interface';
import { VoiceSessionConfig, VoiceConnectionState } from '../types/voice.types';

/**
 * Gemini Live API WebSocket stream implementation
 */
class GeminiVoiceStream implements VoiceStream {
  private ws: WebSocket;
  private state: VoiceConnectionState = VoiceConnectionState.CONNECTING;
  private audioOutputCallback?: (audio: Buffer) => void;
  private transcriptCallback?: (text: string, isFinal: boolean) => void;
  private errorCallback?: (error: Error) => void;
  private closeCallback?: () => void;
  private readonly logger: Logger;

  constructor(ws: WebSocket, logger: Logger) {
    this.ws = ws;
    this.logger = logger;
    this.setupEventHandlers();
  }

  private audioChunksReceived = 0;
  private textChunksReceived = 0;

  private setupEventHandlers(): void {
    this.ws.on('open', () => {
      this.state = VoiceConnectionState.CONNECTED;
      this.logger.log('[LIVE VOICE API] Gemini Live API WebSocket connected and ready');
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleGeminiMessage(message);
      } catch (error) {
        this.logger.error('Failed to parse Gemini message:', error);
      }
    });

    this.ws.on('error', (error) => {
      this.state = VoiceConnectionState.ERROR;
      this.logger.error('[LIVE VOICE API] Gemini Live API WebSocket error:', error.message || error);
      this.errorCallback?.(error);
    });

    this.ws.on('close', (code, reason) => {
      this.state = VoiceConnectionState.DISCONNECTED;
      this.logger.log(`[LIVE VOICE API] Gemini Live API WebSocket closed: code=${code}, reason=${reason || 'N/A'}`);
      this.logger.log(`[LIVE VOICE API] Session summary - audio sent: ${this.audioChunksSent}, audio received: ${this.audioChunksReceived}, text received: ${this.textChunksReceived}`);
      this.closeCallback?.();
    });
  }

  private handleGeminiMessage(message: unknown): void {
    const msg = message as {
      serverContent?: {
        modelTurn?: {
          parts?: Array<{
            inlineData?: { data: string; mimeType: string };
            text?: string;
          }>;
        };
        turnComplete?: boolean;
        interrupted?: boolean;
      };
      setupComplete?: Record<string, unknown>;
      error?: { message: string; code: string };
    };

    // Handle errors
    if (msg.error) {
      this.logger.error(`[LIVE VOICE API] Gemini API error: ${msg.error.code} - ${msg.error.message}`);
      this.errorCallback?.(new Error(`${msg.error.code}: ${msg.error.message}`));
      return;
    }

    // setupComplete is just an ack — nothing to do here
    if (msg.setupComplete) {
      this.logger.log('[LIVE VOICE API] Gemini setup confirmed via serverContent');
      return;
    }

    // Handle audio output + transcript
    if (msg.serverContent?.modelTurn?.parts) {
      for (const part of msg.serverContent.modelTurn.parts) {
        if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
          const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
          this.audioChunksReceived++;
          if (this.audioChunksReceived <= 5 || this.audioChunksReceived % 10 === 0) {
            this.logger.log(`[LIVE VOICE API] Audio chunk #${this.audioChunksReceived} received (${audioBuffer.length} bytes)`);
          }
          this.audioOutputCallback?.(audioBuffer);
        }

        if (part.text && this.transcriptCallback) {
          this.textChunksReceived++;
          this.logger.log(`[LIVE VOICE API] Transcript chunk #${this.textChunksReceived}: ${part.text.slice(0, 100)}${part.text.length > 100 ? '...' : ''}`);
          this.transcriptCallback(part.text, msg.serverContent.turnComplete ?? false);
        }
      }
    }

    if (msg.serverContent?.turnComplete) {
      this.logger.log('[LIVE VOICE API] Turn complete - all chunks received');
    }

    if (msg.serverContent?.interrupted) {
      this.logger.log('[LIVE VOICE API] Gemini generation interrupted');
    }
  }

  private audioChunksSent = 0;

  sendAudio(chunk: Buffer): void {
    if (this.state !== VoiceConnectionState.CONNECTED) {
      this.logger.warn(`[LIVE VOICE API] Cannot send audio: WebSocket state is ${this.state}`);
      return;
    }

    this.audioChunksSent++;
    if (this.audioChunksSent <= 5 || this.audioChunksSent % 20 === 0) {
      this.logger.log(`[LIVE VOICE API] Sending audio chunk #${this.audioChunksSent} (${chunk.length} bytes)`);
    }

    const base64Audio = chunk.toString('base64');
    const message = {
      realtimeInput: {
        mediaChunks: [
          {
            data: base64Audio,
            mimeType: 'audio/pcm;rate=16000',
          },
        ],
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  sendText(text: string): void {
    if (this.state !== VoiceConnectionState.CONNECTED) {
      this.logger.warn('Cannot send text: WebSocket not connected');
      return;
    }

    const message = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  interrupt(): void {
    if (this.state !== VoiceConnectionState.CONNECTED) {
      return;
    }

    // Signal end of user turn without any content
    const message = {
      clientContent: {
        turnComplete: true,
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  onAudioOutput(callback: (audio: Buffer) => void): void {
    this.audioOutputCallback = callback;
  }

  onTranscript(callback: (text: string, isFinal: boolean) => void): void {
    this.transcriptCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  onClose(callback: () => void): void {
    this.closeCallback = callback;
  }

  close(): void {
    this.state = VoiceConnectionState.DISCONNECTING;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  getState(): string {
    return this.state;
  }
}

/**
 * Gemini Live API Voice Provider
 * Implements VoiceProvider interface for Gemini
 */
@Injectable()
export class GeminiVoiceProvider implements VoiceProvider {
  readonly version = 'v1';
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiVoiceProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly model = 'gemini-2.5-flash-live-preview',
  ) { }

  async createStream(config: VoiceSessionConfig): Promise<VoiceStream> {
    const wsUrl = this.buildWebSocketUrl();
    this.logger.log(`[LIVE VOICE API] Starting stream creation for user: ${config.userId}, app: ${config.appId}`);
    this.logger.log(`[LIVE VOICE API] Connecting to Gemini Live API: ${wsUrl.replace(this.apiKey, '***')}`);
    this.logger.log(`[LIVE VOICE API] Config - model: ${this.model}, voice: ${config.voiceName || 'default'}, language: ${config.language}`);

    const ws = new WebSocket(wsUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Wait for TCP/TLS connection
    this.logger.log('[LIVE VOICE API] Waiting for WebSocket TCP/TLS connection...');
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.logger.error('[LIVE VOICE API] WebSocket connection timeout after 10000ms');
        ws.terminate();
        reject(new Error('Gemini Live API connection timeout'));
      }, 10000);

      ws.once('open', () => {
        clearTimeout(timeout);
        this.logger.log('[LIVE VOICE API] WebSocket TCP/TLS connection established');
        resolve();
      });

      ws.once('error', (error) => {
        clearTimeout(timeout);
        this.logger.error('[LIVE VOICE API] WebSocket connection error:', error.message);
        reject(error);
      });

      ws.once('close', (code, reason) => {
        this.logger.warn(`[LIVE VOICE API] WebSocket closed during connection: code=${code}, reason=${reason}`);
      });
    });

    // Send setup message
    this.logger.log('[LIVE VOICE API] Sending setup message...');
    const setupMessage = this.buildSetupMessage(config);
    this.logger.log(`[LIVE VOICE API] Setup payload: ${JSON.stringify(setupMessage).slice(0, 300)}...`);
    ws.send(JSON.stringify(setupMessage));

    // Wait for the setupComplete ack (first message back from the server)
    this.logger.log('[LIVE VOICE API] Waiting for setup acknowledgement...');
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.logger.error('[LIVE VOICE API] Setup acknowledgement timeout after 10000ms');
        ws.off('message', onFirstMessage);
        ws.off('close', onClose);
        ws.terminate();
        reject(new Error('Gemini Live API setup acknowledgement timeout'));
      }, 10000);

      const onFirstMessage = (data: WebSocket.RawData) => {
        clearTimeout(timeout);
        ws.off('message', onFirstMessage);
        ws.off('close', onClose);
        const ackData = data.toString();
        this.logger.log(`[LIVE VOICE API] Gemini setup acknowledgement received: ${ackData.slice(0, 200)}`);
        if (ackData.includes('setupComplete') || ackData.includes('error')) {
          this.logger.log('[LIVE VOICE API] Setup handshake completed successfully');
        } else {
          this.logger.warn(`[LIVE VOICE API] Unexpected setup response: ${ackData.slice(0, 200)}`);
        }
        resolve();
      };

      const onClose = (code: number, reason: Buffer) => {
        clearTimeout(timeout);
        ws.off('message', onFirstMessage);
        this.logger.error(`[LIVE VOICE API] WebSocket closed during setup: code=${code}, reason=${reason}`);
        reject(new Error(`Gemini WS closed during setup: ${code} ${reason}`));
      };

      ws.once('message', onFirstMessage);
      ws.once('close', onClose);
    });

    this.logger.log(`[LIVE VOICE API] Stream created successfully for user: ${config.userId}`);
    return new GeminiVoiceStream(ws, this.logger);
  }

  async isAvailable(): Promise<boolean> {
    this.logger.log('[LIVE VOICE API CHECK] Starting availability check for Gemini Live API...');
    try {
      const wsUrl = this.buildWebSocketUrl();
      this.logger.log(`[LIVE VOICE API CHECK] Connecting to: ${wsUrl.replace(this.apiKey, '***')}`);

      const ws = new WebSocket(wsUrl);

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          this.logger.error('[LIVE VOICE API CHECK] Connection timeout after 5000ms');
          ws.terminate();
          resolve(false);
        }, 5000);

        ws.on('open', () => {
          clearTimeout(timeout);
          this.logger.log('[LIVE VOICE API CHECK] Gemini Live API connection successful');
          ws.close();
          resolve(true);
        });

        ws.on('error', (error) => {
          clearTimeout(timeout);
          this.logger.error('[LIVE VOICE API CHECK] Gemini Live API connection failed:', error.message);
          resolve(false);
        });

        ws.on('close', (code, reason) => {
          this.logger.warn(`[LIVE VOICE API CHECK] Connection closed: code=${code}, reason=${reason}`);
        });
      });
    } catch (error) {
      this.logger.error('[LIVE VOICE API CHECK] Exception during availability check:', error);
      return false;
    }
  }


  private buildWebSocketUrl(): string {

    return (
      `wss://generativelanguage.googleapis.com/ws/` +
      `google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent` +
      `?key=${this.apiKey}`
    );
  }

  /**
   * Build the setup payload.
   *
   * IMPORTANT: Top-level key MUST be "setup" (not "config").
   * Field names must be snake_case to match the REST/WS JSON mapping.
   * Model name must be prefixed with "models/".
   */
  private buildSetupMessage(config: VoiceSessionConfig): unknown {
    return {
      setup: {
        model: `models/${this.model}`,   // e.g. "models/gemini-2.5-flash-live-preview"
        generation_config: {
          response_modalities: ['AUDIO'],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: config.voiceName || 'Puck',
              },
            },
          },
        },
        system_instruction: {
          parts: [{ text: this.getSystemInstruction(config) }],
        },
      },
    };
  }

  private getSystemInstruction(config: VoiceSessionConfig): string {
    const language = config.language;
    const persona = config.persona;

    // If a manual system instruction is provided, use it
    if (config.systemInstruction) {
      return config.systemInstruction;
    }

    // If we have a persona, build a detailed prompt
    if (persona) {
      const interestsStr = persona.interests?.length > 0
        ? ` Your interests include: ${persona.interests.join(', ')}.`
        : '';

      return `You are ${persona.name}. 
Role Description: ${persona.bio}
Visual/Personality Context: ${persona.description}
Location: ${persona.location}
Age: ${persona.age}${interestsStr}

Respond naturally as this character in a voice-to-voice conversation. 
Keep responses concise, engaging, and stay strictly in character.
Primary language: ${language}.

${persona.location?.toLowerCase().includes('india') || language.startsWith('hi') ? 'Note: Use common Indian expressions and cultural nuances where appropriate. If the user speaks in a mix of Hindi and English (Hinglish), respond in a similar natural Hinglish style.' : ''}`;
    }

    // Fallback to generic instructions
    const instructions: Record<string, string> = {
      'en-US': 'You are a helpful voice assistant. Respond naturally in English.',
      'en': 'You are a helpful voice assistant. Respond naturally in English.',
      'hi-IN': 'आप एक सहायक voice assistant हैं। कृपया हिंदी और अंग्रेजी के मिश्रण (Hinglish) में प्राकृतिक रूप से जवाब दें।',
      'hi': 'आप एक सहायक voice assistant हैं। कृपया हिंदी और अंग्रेजी के मिश्रण (Hinglish) में प्राकृतिक रूप से जवाब दें।',
    };

    return instructions[language] ?? instructions['en-US'];
  }
}