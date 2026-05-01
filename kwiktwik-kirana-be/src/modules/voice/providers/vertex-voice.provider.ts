import { Injectable, Logger } from '@nestjs/common';
import WebSocket from 'ws';
import { VoiceProvider, VoiceStream } from '../interfaces/voice-provider.interface';
import { VoiceSessionConfig, VoiceConnectionState } from '../types/voice.types';
import {
  VERTEX_AI_CONFIG,
  getVertexAccessToken,
  type VertexAiConfig,
} from '../../../common/config/vertex-ai.config';
import { buildSystemInstruction } from '../config/system-instruction.builder';

const WS_TIMEOUT_MS = 10_000;
const MAX_AUDIO_BUFFER = 100;

class VertexVoiceStream implements VoiceStream {
  private state: VoiceConnectionState = VoiceConnectionState.CONNECTING;
  private audioOutputCallback?: (audio: Buffer) => void;
  private transcriptCallback?: (text: string, isFinal: boolean) => void;
  private errorCallback?: (error: Error) => void;
  private closeCallback?: () => void;
  private audioChunksSent = 0;
  private audioChunksReceived = 0;
  private textChunksReceived = 0;
  private audioBuffer: Buffer[] = [];
  private bufferedChunksDropped = 0;

  constructor(
    private readonly ws: WebSocket,
    private readonly logger: Logger,
    private readonly sampleRate: number = 24000,
  ) {
    this.setupEventHandlers();
    if (this.ws.readyState === WebSocket.OPEN) {
      this.state = VoiceConnectionState.CONNECTED;
      this.flushAudioBuffer();
    }
  }

  private setupEventHandlers(): void {
    this.ws.on('open', () => {
      this.state = VoiceConnectionState.CONNECTED;
      this.logger.log('[Voice] WebSocket connected');
      this.flushAudioBuffer();
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      try {
        this.handleMessage(JSON.parse(data.toString()));
      } catch (err) {
        this.logger.error('[Voice] Failed to parse message:', err);
      }
    });

    this.ws.on('error', (error) => {
      this.state = VoiceConnectionState.ERROR;
      this.logger.error('[Voice] WebSocket error:', error.message || error);
      this.errorCallback?.(error);
    });

    this.ws.on('close', (code, reason) => {
      this.state = VoiceConnectionState.DISCONNECTED;
      this.logger.log(
        `[Voice] WebSocket closed: code=${code}, sent=${this.audioChunksSent}, received=${this.audioChunksReceived}, text=${this.textChunksReceived}`,
      );
      this.closeCallback?.();
    });
  }

  private handleMessage(msg: Record<string, unknown>): void {
    if (msg.setupComplete) return;

    if (msg.toolCall || msg.toolCallCancellation) {
      this.logger.debug('[Voice] Tool call message received (not handled)');
      return;
    }

    const serverContent = msg.serverContent as {
      modelTurn?: {
        parts?: Array<{
          inlineData?: { data: string; mimeType: string };
          text?: string;
        }>;
      };
      turnComplete?: boolean;
      interrupted?: boolean;
    } | undefined;

    if (serverContent?.modelTurn?.parts) {
      for (const part of serverContent.modelTurn.parts) {
        if (
          part.inlineData?.data &&
          part.inlineData.mimeType?.startsWith('audio/')
        ) {
          const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
          this.audioChunksReceived++;
          this.audioOutputCallback?.(audioBuffer);
        }
        if (part.text && this.transcriptCallback) {
          this.textChunksReceived++;
          this.transcriptCallback(
            part.text,
            serverContent.turnComplete ?? false,
          );
        }
      }
    }

    if (serverContent?.interrupted) {
      this.logger.log('[Voice] Generation interrupted');
    }

    const error = msg.error as
      | { message: string; code: string }
      | undefined;
    if (error) {
      this.logger.error(`[Voice] API error: ${error.code} - ${error.message}`);
      this.errorCallback?.(new Error(`${error.code}: ${error.message}`));
    }
  }

  sendAudio(chunk: Buffer): void {
    if (this.state !== VoiceConnectionState.CONNECTED) {
      if (this.audioBuffer.length < MAX_AUDIO_BUFFER) {
        this.audioBuffer.push(chunk);
      } else {
        this.bufferedChunksDropped++;
      }
      return;
    }
    this.emitAudioChunk(chunk);
  }

  private emitAudioChunk(chunk: Buffer): void {
    this.audioChunksSent++;
    this.ws.send(
      JSON.stringify({
        realtimeInput: {
          mediaChunks: [
            {
              data: chunk.toString('base64'),
              mimeType: `audio/pcm;rate=${this.sampleRate}`,
            },
          ],
        },
      }),
    );
  }

  private flushAudioBuffer(): void {
    if (this.audioBuffer.length === 0) return;
    this.logger.log(
      `[Voice] Flushing ${this.audioBuffer.length} buffered chunks (dropped: ${this.bufferedChunksDropped})`,
    );
    for (const chunk of this.audioBuffer) {
      this.emitAudioChunk(chunk);
    }
    this.audioBuffer = [];
    this.bufferedChunksDropped = 0;
  }

  sendText(text: string): void {
    if (this.state !== VoiceConnectionState.CONNECTED) return;
    this.ws.send(
      JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true,
        },
      }),
    );
  }

  interrupt(): void {
    if (this.state !== VoiceConnectionState.CONNECTED) return;
    this.ws.send(JSON.stringify({ clientContent: { turnComplete: true } }));
  }

  onAudioOutput(cb: (audio: Buffer) => void): void {
    this.audioOutputCallback = cb;
  }
  onTranscript(cb: (text: string, isFinal: boolean) => void): void {
    this.transcriptCallback = cb;
  }
  onError(cb: (error: Error) => void): void {
    this.errorCallback = cb;
  }
  onClose(cb: () => void): void {
    this.closeCallback = cb;
  }

  close(): void {
    this.state = VoiceConnectionState.DISCONNECTING;
    if (this.ws.readyState === WebSocket.OPEN) this.ws.terminate();
  }

  getState(): string {
    return this.state;
  }
}

@Injectable()
export class VertexVoiceProvider implements VoiceProvider {
  readonly name = 'vertex';
  readonly version = 'v1';

  private readonly logger = new Logger(VertexVoiceProvider.name);
  private readonly vertexConfig: VertexAiConfig;
  private readonly model: string;

  constructor(model = 'gemini-2.5-flash-live-preview') {
    this.vertexConfig = VERTEX_AI_CONFIG;
    this.model = model;
  }

  async createStream(config: VoiceSessionConfig): Promise<VoiceStream> {
    this.logger.log(
      `[Voice] Creating stream for user=${config.userId}, voice=${config.voiceName || 'default'}, lang=${config.language}`,
    );
    const token = await getVertexAccessToken(this.vertexConfig);
    const wsUrl = this.buildWebSocketUrl();

    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    await this.waitForOpen(ws);

    const setupMsg = this.buildSetupMessage(config);
    ws.send(JSON.stringify(setupMsg));

    await this.waitForSetupAck(ws);

    const sampleRate = config.inputFormat?.sampleRate || 24000;
    this.logger.log(
      `[Voice] Stream ready for user=${config.userId}, sampleRate=${sampleRate}Hz`,
    );
    return new VertexVoiceStream(ws, this.logger, sampleRate);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const token = await getVertexAccessToken(this.vertexConfig);
      return !!token;
    } catch {
      return false;
    }
  }

  private buildWebSocketUrl(): string {
    const { region } = this.vertexConfig;
    return (
      `wss://${region}-aiplatform.googleapis.com/ws/` +
      `google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent`
    );
  }

  private buildSetupMessage(config: VoiceSessionConfig): unknown {
    const { projectId, region } = this.vertexConfig;
    const modelPath = `projects/${projectId}/locations/${region}/publishers/google/models/${this.model}`;

    return {
      setup: {
        model: modelPath,
        generation_config: {
          response_modalities: ['AUDIO'],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: config.voiceName || 'Achernar',
              },
            },
          },
        },
        system_instruction: {
          parts: [{ text: buildSystemInstruction(config) }],
        },
      },
    };
  }

  private waitForOpen(ws: WebSocket): Promise<void> {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        ws.terminate();
        reject(new Error('Vertex AI connection timeout'));
      }, WS_TIMEOUT_MS);

      ws.once('open', () => {
        clearTimeout(t);
        resolve();
      });
      ws.once('error', (e) => {
        clearTimeout(t);
        reject(e);
      });
    });
  }

  private waitForSetupAck(ws: WebSocket): Promise<void> {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        ws.off('message', onMsg);
        ws.off('close', onClose);
        ws.terminate();
        reject(new Error('Vertex AI setup acknowledgement timeout'));
      }, WS_TIMEOUT_MS);

      const onMsg = (data: WebSocket.RawData) => {
        clearTimeout(t);
        ws.off('message', onMsg);
        ws.off('close', onClose);
        resolve();
      };

      const onClose = (code: number, reason: Buffer) => {
        clearTimeout(t);
        ws.off('message', onMsg);
        reject(
          new Error(`Vertex AI WS closed during setup: ${code} ${reason}`),
        );
      };

      ws.once('message', onMsg);
      ws.once('close', onClose);
    });
  }
}
