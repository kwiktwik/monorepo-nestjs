/**
 * Vertex AI Voice Provider Implementation
 * Uses a GCP Service Account for OAuth2 authentication
 * Connects to the Vertex AI BidiGenerateContent WebSocket endpoint
 */

import { Injectable, Logger } from '@nestjs/common';
import { GoogleAuth } from 'google-auth-library';
import WebSocket from 'ws';
import { VoiceProvider, VoiceStream } from '../interfaces/voice-provider.interface';
import { VoiceSessionConfig, VoiceConnectionState } from '../types/voice.types';

// ---------------------------------------------------------------------------
// Stream implementation (identical message handling to GeminiVoiceStream)
// ---------------------------------------------------------------------------

class VertexVoiceStream implements VoiceStream {
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

  private setupEventHandlers(): void {
    this.ws.on('open', () => {
      this.state = VoiceConnectionState.CONNECTED;
      this.logger.log('Vertex AI WebSocket connected');
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      try {
        this.handleMessage(JSON.parse(data.toString()));
      } catch (err) {
        this.logger.error('Failed to parse Vertex AI message:', err);
      }
    });

    this.ws.on('error', (error) => {
      this.state = VoiceConnectionState.ERROR;
      this.logger.error('Vertex AI WebSocket error:', error);
      this.errorCallback?.(error);
    });

    this.ws.on('close', (code, reason) => {
      this.state = VoiceConnectionState.DISCONNECTED;
      this.logger.log(`Vertex AI WebSocket closed: ${code} - ${reason}`);
      this.closeCallback?.();
    });
  }

  private handleMessage(msg: Record<string, unknown>): void {
    // setupComplete ack — nothing to do
    if (msg.setupComplete) {
      this.logger.log('Vertex AI setup confirmed');
      return;
    }

    const serverContent = msg.serverContent as {
      modelTurn?: { parts?: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> };
      turnComplete?: boolean;
      interrupted?: boolean;
    } | undefined;

    if (serverContent?.modelTurn?.parts) {
      for (const part of serverContent.modelTurn.parts) {
        if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
          this.audioOutputCallback?.(Buffer.from(part.inlineData.data, 'base64'));
        }
        if (part.text) {
          this.transcriptCallback?.(part.text, serverContent.turnComplete ?? false);
        }
      }
    }

    if (serverContent?.interrupted) {
      this.logger.log('Vertex AI generation interrupted');
    }

    const error = msg.error as { message: string; code: string } | undefined;
    if (error) {
      this.errorCallback?.(new Error(`${error.code}: ${error.message}`));
    }
  }

  sendAudio(chunk: Buffer): void {
    if (this.state !== VoiceConnectionState.CONNECTED) {
      this.logger.warn('Cannot send audio: WebSocket not connected');
      return;
    }
    this.ws.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{ data: chunk.toString('base64'), mimeType: 'audio/pcm;rate=16000' }],
      },
    }));
  }

  sendText(text: string): void {
    if (this.state !== VoiceConnectionState.CONNECTED) return;
    this.ws.send(JSON.stringify({
      clientContent: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true },
    }));
  }

  interrupt(): void {
    if (this.state !== VoiceConnectionState.CONNECTED) return;
    this.ws.send(JSON.stringify({ clientContent: { turnComplete: true } }));
  }

  onAudioOutput(cb: (audio: Buffer) => void): void { this.audioOutputCallback = cb; }
  onTranscript(cb: (text: string, isFinal: boolean) => void): void { this.transcriptCallback = cb; }
  onError(cb: (error: Error) => void): void { this.errorCallback = cb; }
  onClose(cb: () => void): void { this.closeCallback = cb; }

  close(): void {
    this.state = VoiceConnectionState.DISCONNECTING;
    if (this.ws.readyState === WebSocket.OPEN) this.ws.terminate();
  }

  getState(): string { return this.state; }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

@Injectable()
export class VertexVoiceProvider implements VoiceProvider {
  readonly name = 'vertex';
  readonly version = 'v1';

  private readonly logger = new Logger(VertexVoiceProvider.name);
  private readonly auth: GoogleAuth;

  constructor(
    private readonly projectId: string,
    private readonly region: string = 'us-central1',
    private readonly model = 'gemini-2.0-flash-live-001',
    /** Absolute or relative path to service-account JSON, or leave empty to use ADC */
    serviceAccountPath?: string,
  ) {
    this.auth = new GoogleAuth({
      ...(serviceAccountPath ? { keyFile: serviceAccountPath } : {}),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  async createStream(config: VoiceSessionConfig): Promise<VoiceStream> {
    const token = await this.getAccessToken();
    const wsUrl = this.buildWebSocketUrl();
    this.logger.log(`Connecting to Vertex AI: ${wsUrl}`);

    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // 1. Wait for TCP/TLS open
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => { ws.terminate(); reject(new Error('Vertex AI connection timeout')); }, 10000);
      ws.once('open', () => { clearTimeout(t); resolve(); });
      ws.once('error', (e) => { clearTimeout(t); reject(e); });
    });

    // 2. Send setup
    ws.send(JSON.stringify(this.buildSetupMessage(config)));

    // 3. Wait for first message (setupComplete ack) — mirrors Python's await ws.recv()
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => {
        ws.off('message', onMsg);
        ws.off('close', onClose);
        ws.terminate();
        reject(new Error('Vertex AI setup acknowledgement timeout'));
      }, 10000);

      const onMsg = (data: WebSocket.RawData) => {
        clearTimeout(t);
        ws.off('message', onMsg);
        ws.off('close', onClose);
        this.logger.log(`Vertex AI setup ack: ${data.toString().slice(0, 200)}`);
        resolve();
      };

      const onClose = (code: number, reason: Buffer) => {
        clearTimeout(t);
        ws.off('message', onMsg);
        reject(new Error(`Vertex AI WS closed during setup: ${code} ${reason}`));
      };

      ws.once('message', onMsg);
      ws.once('close', onClose);
    });

    this.logger.log(`Vertex AI stream created for user: ${config.userId}`);
    return new VertexVoiceStream(ws, this.logger);
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private buildWebSocketUrl(): string {
    // Vertex AI BidiGenerateContent endpoint
    return (
      `wss://${this.region}-aiplatform.googleapis.com/ws/` +
      `google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`
    );
  }

  private buildSetupMessage(config: VoiceSessionConfig): unknown {
    return {
      setup: {
        model: `projects/${this.projectId}/locations/${this.region}/publishers/google/models/${this.model}`,
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
          parts: [{ text: this.getSystemInstruction(config.language) }],
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
    return instructions[language] ?? instructions['en-US'];
  }

  private async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient();
    const tokenResponse = await client.getAccessToken();
    if (!tokenResponse.token) throw new Error('Failed to obtain Vertex AI access token');
    return tokenResponse.token;
  }
}
