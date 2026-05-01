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

  constructor(
    ws: WebSocket,
    logger: Logger,
  ) {
    this.ws = ws;
    this.logger = logger;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.ws.on('open', () => {
      this.state = VoiceConnectionState.CONNECTED;
      this.logger.log('Gemini Live API WebSocket connected');
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
      this.logger.error('Gemini Live API WebSocket error:', error);
      this.errorCallback?.(error);
    });

    this.ws.on('close', (code, reason) => {
      this.state = VoiceConnectionState.DISCONNECTED;
      this.logger.log(`Gemini Live API WebSocket closed: ${code} - ${reason}`);
      this.closeCallback?.();
    });
  }

  private handleGeminiMessage(message: unknown): void {
    // Gemini Live API message format
    // Based on Gemini Live API documentation
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
      error?: { message: string; code: string };
    };

    // Handle errors
    if (msg.error) {
      this.errorCallback?.(new Error(`${msg.error.code}: ${msg.error.message}`));
      return;
    }

    // Handle audio output
    if (msg.serverContent?.modelTurn?.parts) {
      for (const part of msg.serverContent.modelTurn.parts) {
        // Audio data
        if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
          const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
          this.audioOutputCallback?.(audioBuffer);
        }

        // Text transcript
        if (part.text && this.transcriptCallback) {
          this.transcriptCallback(part.text, msg.serverContent.turnComplete || false);
        }
      }
    }

    // Handle interruption
    if (msg.serverContent?.interrupted) {
      this.logger.log('Gemini generation interrupted');
    }
  }

  sendAudio(chunk: Buffer): void {
    if (this.state !== VoiceConnectionState.CONNECTED) {
      this.logger.warn('Cannot send audio: WebSocket not connected');
      return;
    }

    // Gemini Live API expects realtimeInput for streaming audio chunks
    // Use 16kHz PCM16 LE — required input format for Gemini Live API
    const base64Audio = chunk.toString('base64');
    const message = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: 'audio/pcm;rate=16000',
            data: base64Audio,
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

    const message = {
      clientContent: {
        turnComplete: true,
        interrupted: true,
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
    private readonly model: string = 'gemini-2.0-flash-live-001',
  ) {}

  async createStream(config: VoiceSessionConfig): Promise<VoiceStream> {
    const wsUrl = this.buildWebSocketUrl(config);
    this.logger.log(`Connecting to Gemini Live API: ${wsUrl.replace(this.apiKey, '***')}`);

    const ws = new WebSocket(wsUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Wait for connection or timeout
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Gemini Live API connection timeout'));
      }, 10000);

      ws.on('open', () => {
        clearTimeout(timeout);
        resolve();
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Send setup message with configuration
    const setupMessage = this.buildSetupMessage(config);
    ws.send(JSON.stringify(setupMessage));

    this.logger.log(`Gemini Live API stream created for user: ${config.userId}`);
    return new GeminiVoiceStream(ws, this.logger);
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple health check - try to connect and immediately close
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
      const ws = new WebSocket(wsUrl);

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          ws.close();
          resolve(false);
        }, 5000);

        ws.on('open', () => {
          clearTimeout(timeout);
          ws.close();
          resolve(true);
        });

        ws.on('error', () => {
          clearTimeout(timeout);
          resolve(false);
        });
      });
    } catch (error) {
      return false;
    }
  }

  private buildWebSocketUrl(config: VoiceSessionConfig): string {
    // Gemini Live API WebSocket endpoint
    // Reference: https://ai.google.dev/gemini-api/docs/live-api
    return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
  }

  private buildSetupMessage(config: VoiceSessionConfig): unknown {
    return {
      setup: {
        model: `models/${this.model}`,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: config.voiceName || 'Puck',
              },
            },
          },
        },
        systemInstruction: {
          parts: [
            {
              text: this.getSystemInstruction(config.language),
            },
          ],
        },
      },
    };
  }

  private getSystemInstruction(language: string): string {
    const instructions: Record<string, string> = {
      'en-US': 'You are a helpful voice assistant. Respond naturally in English.',
      'en': 'You are a helpful voice assistant. Respond naturally in English.',
      'hi-IN': 'आप एक सहायक voice assistant हैं। कृपया हिंदी में प्राकृतिक रूप से जवाब दें।',
      'hi': 'आप एक सहायक voice assistant हैं। कृपया हिंदी में प्राकृतिक रूप से जवाब दें।',
    };

    return instructions[language] || instructions['en-US'];
  }
}
