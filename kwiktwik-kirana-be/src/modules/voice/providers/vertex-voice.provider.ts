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
  private audioChunksSent = 0;
  private audioChunksReceived = 0;
  private textChunksReceived = 0;
  private audioBuffer: Buffer[] = [];
  private maxBufferSize = 100; // Max 100 chunks to prevent memory issues
  private bufferedChunksDropped = 0;
  private readonly sampleRate: number;

  constructor(ws: WebSocket, logger: Logger, sampleRate: number = 24000) {
    this.ws = ws;
    this.logger = logger;
    this.sampleRate = sampleRate;
    this.setupEventHandlers();
    // If WebSocket is already open (happens when created after await in createStream),
    // update state immediately since the 'open' event already fired
    if (this.ws.readyState === WebSocket.OPEN) {
      this.state = VoiceConnectionState.CONNECTED;
      this.logger.log(`[LIVE VOICE API] Vertex AI WebSocket already open, state set to CONNECTED (sampleRate: ${this.sampleRate}Hz)`);
      // Flush any buffered audio chunks
      this.flushAudioBuffer();
    }
  }

  private setupEventHandlers(): void {
    this.ws.on('open', () => {
      this.state = VoiceConnectionState.CONNECTED;
      this.logger.log('[LIVE VOICE API] Vertex AI WebSocket connected and ready');
      // Flush any buffered audio chunks
      this.flushAudioBuffer();
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      try {
        this.handleMessage(JSON.parse(data.toString()));
      } catch (err) {
        this.logger.error('[LIVE VOICE API] Failed to parse Vertex AI message:', err);
      }
    });

    this.ws.on('error', (error) => {
      this.state = VoiceConnectionState.ERROR;
      this.logger.error('[LIVE VOICE API] Vertex AI WebSocket error:', error.message || error);
      this.errorCallback?.(error);
    });

    this.ws.on('close', (code, reason) => {
      this.state = VoiceConnectionState.DISCONNECTED;
      const remainingBuffer = this.audioBuffer.length;
      this.logger.log(`[LIVE VOICE API] Vertex AI WebSocket closed: code=${code}, reason=${reason || 'N/A'}`);
      if (remainingBuffer > 0) {
        this.logger.warn(`[LIVE VOICE API] ${remainingBuffer} audio chunks were buffered but never sent before connection closed`);
      }
      this.logger.log(`[LIVE VOICE API] Vertex session summary - audio sent: ${this.audioChunksSent}, audio received: ${this.audioChunksReceived}, text received: ${this.textChunksReceived}`);
      this.closeCallback?.();
    });
  }

  private handleMessage(msg: Record<string, unknown>): void {
    // Debug: Log all message keys received
    const msgKeys = Object.keys(msg);
    this.logger.debug(`[LIVE VOICE API] Received message with keys: ${msgKeys.join(', ')}`);

    // setupComplete ack — nothing to do
    if (msg.setupComplete) {
      this.logger.log('[LIVE VOICE API] Vertex AI setup confirmed');
      return;
    }

    // Check for toolCall / toolCallCancellation (not handled yet, but log them)
    if (msg.toolCall) {
      this.logger.log('[LIVE VOICE API] Vertex AI toolCall received (not implemented)');
      return;
    }
    if (msg.toolCallCancellation) {
      this.logger.log('[LIVE VOICE API] Vertex AI toolCallCancellation received');
      return;
    }

    const serverContent = msg.serverContent as {
      modelTurn?: { parts?: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> };
      turnComplete?: boolean;
      interrupted?: boolean;
    } | undefined;

    if (serverContent) {
      this.logger.debug(`[LIVE VOICE API] serverContent received - turnComplete: ${serverContent.turnComplete}, hasModelTurn: ${!!serverContent.modelTurn}`);

      if (serverContent.modelTurn?.parts) {
        this.logger.debug(`[LIVE VOICE API] Processing ${serverContent.modelTurn.parts.length} parts in modelTurn`);
        for (const part of serverContent.modelTurn.parts) {
          // Debug: Log what we see in each part
          this.logger.debug(`[LIVE VOICE API] Part keys: ${Object.keys(part).join(', ')}, hasInlineData: ${!!part.inlineData}, hasText: ${!!part.text}`);

          if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
            const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
            this.audioChunksReceived++;
            if (this.audioChunksReceived <= 5 || this.audioChunksReceived % 10 === 0) {
              this.logger.log(`[LIVE VOICE API] Vertex audio chunk #${this.audioChunksReceived} received (${audioBuffer.length} bytes)`);
            }
            this.audioOutputCallback?.(audioBuffer);
          } else if (part.inlineData) {
            this.logger.debug(`[LIVE VOICE API] Part has inlineData but mimeType is: ${part.inlineData.mimeType}`);
          }
          if (part.text) {
            this.textChunksReceived++;
            this.logger.log(`[LIVE VOICE API] Vertex transcript chunk #${this.textChunksReceived}: ${part.text.slice(0, 100)}${part.text.length > 100 ? '...' : ''}`);
            this.transcriptCallback?.(part.text, serverContent.turnComplete ?? false);
          }
        }
      } else if (serverContent.modelTurn) {
        this.logger.debug(`[LIVE VOICE API] modelTurn exists but has no parts`);
      }
    }

    if (serverContent?.turnComplete) {
      this.logger.log('[LIVE VOICE API] Vertex AI turn complete');
    }

    if (serverContent?.interrupted) {
      this.logger.log('[LIVE VOICE API] Vertex AI generation interrupted');
    }

    const error = msg.error as { message: string; code: string } | undefined;
    if (error) {
      this.logger.error(`[LIVE VOICE API] Vertex AI error: ${error.code} - ${error.message}`);
      this.errorCallback?.(new Error(`${error.code}: ${error.message}`));
    }
  }

  sendAudio(chunk: Buffer): void {
    // Buffer audio if not connected yet
    if (this.state !== VoiceConnectionState.CONNECTED) {
      if (this.audioBuffer.length < this.maxBufferSize) {
        this.audioBuffer.push(chunk);
        if (this.audioBuffer.length === 1 || this.audioBuffer.length % 20 === 0) {
          this.logger.log(`[LIVE VOICE API] Buffering audio chunk #${this.audioBuffer.length} while Vertex connection is ${this.state} (${chunk.length} bytes)`);
        }
      } else {
        this.bufferedChunksDropped++;
        if (this.bufferedChunksDropped === 1 || this.bufferedChunksDropped % 50 === 0) {
          this.logger.warn(`[LIVE VOICE API] Audio buffer full, dropped ${this.bufferedChunksDropped} chunks. Vertex state: ${this.state}`);
        }
      }
      return;
    }
    this.sendAudioChunk(chunk);
  }

  private sendAudioChunk(chunk: Buffer): void {
    this.audioChunksSent++;
    if (this.audioChunksSent <= 5 || this.audioChunksSent % 20 === 0) {
      this.logger.log(`[LIVE VOICE API] Sending audio to Vertex chunk #${this.audioChunksSent} (${chunk.length} bytes, ${this.sampleRate}Hz)`);
    }
    // IMPORTANT: Audio format must match the config sample rate
    // The Android client sends audio at the configured sample rate (default 24000 Hz)
    this.ws.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{ data: chunk.toString('base64'), mimeType: `audio/pcm;rate=${this.sampleRate}` }],
      },
    }));
  }

  private flushAudioBuffer(): void {
    if (this.audioBuffer.length === 0) return;

    const chunksToSend = this.audioBuffer.length;
    this.logger.log(`[LIVE VOICE API] Flushing ${chunksToSend} buffered audio chunks to Vertex AI (dropped: ${this.bufferedChunksDropped})`);

    for (const chunk of this.audioBuffer) {
      this.sendAudioChunk(chunk);
    }
    this.audioBuffer = [];
    this.bufferedChunksDropped = 0;
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
    private readonly model = 'gemini-2.5-flash-live-preview',
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
    this.logger.log(`[LIVE VOICE API] Starting Vertex AI stream creation for user: ${config.userId}, app: ${config.appId}`);
    const token = await this.getAccessToken();
    const wsUrl = this.buildWebSocketUrl();
    this.logger.log(`[LIVE VOICE API] Connecting to Vertex AI: ${wsUrl}`);
    this.logger.log(`[LIVE VOICE API] Vertex config - model: ${this.model}, voice: ${config.voiceName || 'default'}, language: ${config.language}`);

    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // 1. Wait for TCP/TLS open
    this.logger.log('[LIVE VOICE API] Waiting for Vertex AI WebSocket connection...');
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => {
        this.logger.error('[LIVE VOICE API] Vertex AI connection timeout after 10000ms');
        ws.terminate();
        reject(new Error('Vertex AI connection timeout'));
      }, 10000);
      ws.once('open', () => {
        clearTimeout(t);
        this.logger.log('[LIVE VOICE API] Vertex AI WebSocket connected');
        resolve();
      });
      ws.once('error', (e) => {
        clearTimeout(t);
        this.logger.error('[LIVE VOICE API] Vertex AI WebSocket connection error:', e.message || e);
        reject(e);
      });
    });

    // 2. Send setup
    this.logger.log('[LIVE VOICE API] Sending Vertex AI setup message...');
    const setupMsg = this.buildSetupMessage(config);
    this.logger.log(`[LIVE VOICE API] Vertex setup payload: ${JSON.stringify(setupMsg).slice(0, 300)}...`);
    ws.send(JSON.stringify(setupMsg));

    // 3. Wait for first message (setupComplete ack) — mirrors Python's await ws.recv()
    this.logger.log('[LIVE VOICE API] Waiting for Vertex AI setup acknowledgement...');
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => {
        this.logger.error('[LIVE VOICE API] Vertex AI setup acknowledgement timeout after 10000ms');
        ws.off('message', onMsg);
        ws.off('close', onClose);
        ws.terminate();
        reject(new Error('Vertex AI setup acknowledgement timeout'));
      }, 10000);

      const onMsg = (data: WebSocket.RawData) => {
        clearTimeout(t);
        ws.off('message', onMsg);
        ws.off('close', onClose);
        const ackData = data.toString();
        this.logger.log(`[LIVE VOICE API] Vertex AI setup acknowledgement: ${ackData.slice(0, 200)}`);
        if (ackData.includes('setupComplete') || ackData.includes('error')) {
          this.logger.log('[LIVE VOICE API] Vertex AI setup handshake completed');
        } else {
          this.logger.warn(`[LIVE VOICE API] Vertex AI unexpected setup response: ${ackData.slice(0, 200)}`);
        }
        resolve();
      };

      const onClose = (code: number, reason: Buffer) => {
        clearTimeout(t);
        ws.off('message', onMsg);
        this.logger.error(`[LIVE VOICE API] Vertex AI WS closed during setup: code=${code}, reason=${reason}`);
        reject(new Error(`Vertex AI WS closed during setup: ${code} ${reason}`));
      };

      ws.once('message', onMsg);
      ws.once('close', onClose);
    });

    this.logger.log(`[LIVE VOICE API] Vertex AI stream created successfully for user: ${config.userId} with sampleRate: ${config.inputFormat?.sampleRate || 24000}Hz`);
    return new VertexVoiceStream(ws, this.logger, config.inputFormat?.sampleRate || 24000);
  }

  async isAvailable(): Promise<boolean> {
    this.logger.log('[LIVE VOICE API CHECK] Starting availability check for Vertex AI...');
    try {
      this.logger.log('[LIVE VOICE API CHECK] Requesting access token...');
      const token = await this.getAccessToken();
      if (token) {
        this.logger.log('[LIVE VOICE API CHECK] Vertex AI access token obtained successfully');
        return true;
      } else {
        this.logger.error('[LIVE VOICE API CHECK] Vertex AI access token is empty');
        return false;
      }
    } catch (error) {
      this.logger.error('[LIVE VOICE API CHECK] Vertex AI availability check failed:', error);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private buildWebSocketUrl(): string {
    // Vertex AI BidiGenerateContent endpoint - using v1 instead of v1beta1
    return (
      `wss://${this.region}-aiplatform.googleapis.com/ws/` +
      `google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent`
    );
  }

  private buildSetupMessage(config: VoiceSessionConfig): unknown {
    const modelPath = `projects/${this.projectId}/locations/${this.region}/publishers/google/models/${this.model}`;
    this.logger.log(`[LIVE VOICE API] Setup message model path: ${modelPath}`);
    this.logger.log(`[LIVE VOICE API] Voice config - voiceName: ${config.voiceName || 'Puck (default)'}, language: ${config.language}`);

    const setupMessage = {
      setup: {
        model: modelPath,
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

    this.logger.log(`[LIVE VOICE API] Full setup message: ${JSON.stringify(setupMessage)}`);
    return setupMessage;
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
