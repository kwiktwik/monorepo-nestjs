/**
 * Voice WebSocket Gateway
 * WebSocket endpoint for voice-to-voice conversations
 * Replaces HTTP/2 streaming with bidirectional WebSocket communication
 * API Version: v1
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Logger,
  UseGuards,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VoiceConfigService } from './config/voice-config.service';
import { VoiceProvider, VoiceStream } from './interfaces/voice-provider.interface';
import { GeminiVoiceProvider } from './providers/gemini-voice.provider';
import { VertexVoiceProvider } from './providers/vertex-voice.provider';
import { VoiceSessionConfig } from './types/voice.types';
import {
  VoiceMessageType,
} from './dto/voice-websocket.dto';
import type {
  VoiceWebSocketMessage,
  AudioInputMessage,
  StartSessionMessage,
  InterruptMessage,
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  InterServerEvents,
} from './dto/voice-websocket.dto';

/**
 * JWT Payload interface
 */
interface JwtPayload {
  userId: string;
  [key: string]: unknown;
}

/**
 * Socket with user data
 */
interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  data: SocketData & {
    voiceStream?: VoiceStream;
    sessionConfig?: VoiceSessionConfig;
  };
}

/**
 * Voice WebSocket Gateway
 * Handles bidirectional voice streaming via WebSocket
 */
@WebSocketGateway({
  namespace: '/voice',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(VoiceGateway.name);

  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(
    private readonly voiceConfigService: VoiceConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Handle new WebSocket connection
   * Authenticate and initialize session
   */
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const clientId = client.id;
    this.logger.log(`[VOICE WEBSOCKET] Client connected: ${clientId}`);

    try {
      // Extract authentication from handshake
      const token = this.extractToken(client);
      const appId = client.handshake.headers['x-app-id'] as string;
      const apiVersion = (client.handshake.query.version as string) || 'v1';

      if (!token) {
        this.logger.warn(`[VOICE WEBSOCKET] Connection rejected - no token: ${clientId}`);
        client.emit('error', { type: VoiceMessageType.ERROR, code: 'AUTH_ERROR', message: 'Authentication token required' });
        client.disconnect(true);
        return;
      }

      if (!appId) {
        this.logger.warn(`[VOICE WEBSOCKET] Connection rejected - no appId: ${clientId}`);
        client.emit('error', { type: VoiceMessageType.ERROR, code: 'AUTH_ERROR', message: 'X-App-ID header required' });
        client.disconnect(true);
        return;
      }

      // Verify JWT token
      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify(token) as JwtPayload;
      } catch (error) {
        this.logger.warn(`[VOICE WEBSOCKET] Invalid token: ${clientId}`);
        client.emit('error', { type: VoiceMessageType.ERROR, code: 'AUTH_ERROR', message: 'Invalid authentication token' });
        client.disconnect(true);
        return;
      }

      const userId = payload.userId;
      if (!userId) {
        this.logger.warn(`[VOICE WEBSOCKET] Token missing userId: ${clientId}`);
        client.emit('error', { type: VoiceMessageType.ERROR, code: 'AUTH_ERROR', message: 'Invalid token payload' });
        client.disconnect(true);
        return;
      }

      // Store session data
      client.data.userId = userId;
      client.data.appId = appId;
      client.data.isAuthenticated = true;
      client.data.sessionId = `${Date.now()}-${userId}`;

      this.logger.log(`[VOICE WEBSOCKET] Client authenticated - user: ${userId}, app: ${appId}, client: ${clientId}`);

      // Send connection acknowledgment
      client.emit('connected', {
        type: VoiceMessageType.CONNECTED,
        sessionId: client.data.sessionId!,
        apiVersion,
        message: 'Connected to voice service. Send "start_session" to begin.',
      });

    } catch (error) {
      this.logger.error(`[VOICE WEBSOCKET] Connection error: ${error instanceof Error ? error.message : String(error)}`);
      client.emit('error', { type: VoiceMessageType.ERROR, code: 'CONNECTION_ERROR', message: 'Failed to establish connection' });
      client.disconnect(true);
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnect(client: AuthenticatedSocket): void {
    const clientId = client.id;
    const userId = client.data.userId;

    this.logger.log(`[VOICE WEBSOCKET] Client disconnected: ${clientId}, user: ${userId || 'unknown'}`);

    // Clean up voice stream
    if (client.data.voiceStream) {
      try {
        client.data.voiceStream.close();
        this.logger.log(`[VOICE WEBSOCKET] Voice stream closed for user: ${userId}`);
      } catch (error) {
        this.logger.error(`[VOICE WEBSOCKET] Error closing voice stream: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Start voice session
   * Initialize voice provider and create bidirectional stream
   */
  @SubscribeMessage('start_session')
  async handleStartSession(
    @MessageBody() data: StartSessionMessage,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const clientId = client.id;
    const userId = client.data.userId;
    const appId = client.data.appId;
    const sessionId = client.data.sessionId;

    if (!userId || !appId) {
      client.emit('error', { type: VoiceMessageType.ERROR, code: 'AUTH_ERROR', message: 'Not authenticated' });
      return;
    }

    this.logger.log(`[VOICE WEBSOCKET] Start session request - user: ${userId}, client: ${clientId}`);

    try {
      const apiVersion = data.apiVersion || 'v1';
      const language = data.language || 'en-US';
      const voiceName = data.voiceName;

      // Get version configuration
      this.logger.log(`[VOICE WEBSOCKET] Getting config for version: ${apiVersion}`);
      const config = this.voiceConfigService.getVersionConfig(apiVersion);
      this.logger.log(`[VOICE WEBSOCKET] Config loaded - provider: ${config.provider}, model: ${config.model}`);

      // Create provider instance
      this.logger.log(`[VOICE WEBSOCKET] Creating voice provider: ${config.provider}`);
      let provider: VoiceProvider;
      switch (config.provider) {
        case 'gemini':
          if (!config.apiKey) {
            throw new ServiceUnavailableException('Gemini API key not configured');
          }
          provider = new GeminiVoiceProvider(config.apiKey, config.model);
          break;
        case 'vertex':
          provider = new VertexVoiceProvider(
            config.projectId,
            config.region,
            config.model,
            config.serviceAccountPath,
          );
          break;
        default:
          throw new BadRequestException(`Unsupported voice provider: ${config.provider}`);
      }

      // Check provider availability
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        throw new ServiceUnavailableException('Voice provider not available');
      }

      // Build session configuration
      const sessionConfig: VoiceSessionConfig = {
        userId,
        appId,
        language,
        apiVersion,
        voiceName: voiceName || config.defaultVoice,
        inputFormat: config.inputFormat,
        outputFormat: config.outputFormat,
      };

      client.data.sessionConfig = sessionConfig;

      // Create voice stream
      this.logger.log(`[VOICE WEBSOCKET] Creating voice stream with config: ${JSON.stringify(sessionConfig)}`);
      const voiceStream = await provider.createStream(sessionConfig);
      client.data.voiceStream = voiceStream;

      // Track connection state
      let chunksReceived = 0;
      let chunksSent = 0;
      let bytesReceived = 0;
      let bytesSent = 0;

      // Handle audio output from provider -> client
      voiceStream.onAudioOutput((audioChunk: Buffer) => {
        if (client.connected) {
          // Send audio as base64-encoded string via WebSocket
          const base64Audio = audioChunk.toString('base64');
          client.emit('audio_output', {
            type: VoiceMessageType.AUDIO_OUTPUT,
            audio: base64Audio,
            timestamp: new Date().toISOString(),
          });
          bytesSent += audioChunk.length;
          chunksSent++;
          if (chunksSent <= 5 || chunksSent % 10 === 0) {
            this.logger.log(`[VOICE WEBSOCKET] Audio output chunk #${chunksSent} sent to client (${audioChunk.length} bytes)`);
          }
        }
      });

      // Handle transcription events
      voiceStream.onTranscript((text: string, isFinal: boolean) => {
        if (client.connected) {
          client.emit('transcript', {
            type: VoiceMessageType.TRANSCRIPT,
            text,
            isFinal,
            timestamp: new Date().toISOString(),
          });
          this.logger.log(`[VOICE WEBSOCKET] Transcript [${isFinal ? 'final' : 'partial'}]: ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`);
        }
      });

      // Handle errors
      voiceStream.onError((error: Error) => {
        this.logger.error(`[VOICE WEBSOCKET] Voice stream error for user ${userId}: ${error.message}`);
        if (client.connected) {
          client.emit('error', {
            type: VoiceMessageType.ERROR,
            code: 'STREAM_ERROR',
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Handle stream close
      voiceStream.onClose(() => {
        this.logger.log(`[VOICE WEBSOCKET] Voice stream closed - user: ${userId}, chunks received: ${chunksReceived}, chunks sent: ${chunksSent}`);
        if (client.connected) {
          client.emit('session_ended', {
            type: VoiceMessageType.SESSION_ENDED,
            reason: 'stream_closed',
            timestamp: new Date().toISOString(),
          });
        }
        client.data.voiceStream = undefined;
      });

      // Send session started acknowledgment
      client.emit('session_started', {
        type: VoiceMessageType.SESSION_STARTED,
        sessionId,
        provider: config.provider,
        apiVersion,
        voiceName: sessionConfig.voiceName,
        audioFormat: {
          encoding: config.outputFormat.encoding,
          sampleRate: config.outputFormat.sampleRate,
          channels: config.outputFormat.channels,
        },
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`[VOICE WEBSOCKET] Session started successfully - user: ${userId}, sessionId: ${sessionId}`);

    } catch (error) {
      this.logger.error(`[VOICE WEBSOCKET] Failed to start session: ${error instanceof Error ? error.message : String(error)}`);
      client.emit('error', {
        type: VoiceMessageType.ERROR,
        code: 'SESSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to start voice session',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle audio input from client
   * Forward audio to voice provider
   */
  @SubscribeMessage('audio_input')
  async handleAudioInput(
    @MessageBody() data: AudioInputMessage,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const userId = client.data.userId;
    const voiceStream = client.data.voiceStream;

    if (!userId) {
      client.emit('error', { type: VoiceMessageType.ERROR, code: 'AUTH_ERROR', message: 'Not authenticated' });
      return;
    }

    if (!voiceStream) {
      client.emit('error', { type: VoiceMessageType.ERROR, code: 'SESSION_ERROR', message: 'No active voice session. Send "start_session" first.' });
      return;
    }

    try {
      // Decode base64 audio to Buffer
      const audioBuffer = Buffer.from(data.audio, 'base64');

      // Send to voice provider
      voiceStream.sendAudio(audioBuffer);

      // Log periodically
      if (Math.random() < 0.01) { // ~1% of messages
        this.logger.log(`[VOICE WEBSOCKET] Audio input received from client (${audioBuffer.length} bytes)`);
      }

    } catch (error) {
      this.logger.error(`[VOICE WEBSOCKET] Error processing audio input: ${error instanceof Error ? error.message : String(error)}`);
      client.emit('error', {
        type: VoiceMessageType.ERROR,
        code: 'AUDIO_ERROR',
        message: 'Failed to process audio input',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle interruption signal from client
   */
  @SubscribeMessage('interrupt')
  async handleInterrupt(
    @MessageBody() data: InterruptMessage,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const userId = client.data.userId;
    const voiceStream = client.data.voiceStream;

    if (!userId) {
      client.emit('error', { type: VoiceMessageType.ERROR, code: 'AUTH_ERROR', message: 'Not authenticated' });
      return;
    }

    if (!voiceStream) {
      client.emit('error', { type: VoiceMessageType.ERROR, code: 'SESSION_ERROR', message: 'No active voice session' });
      return;
    }

    this.logger.log(`[VOICE WEBSOCKET] Interruption received from user: ${userId}`);

    try {
      voiceStream.interrupt();
      client.emit('interrupted', {
        type: VoiceMessageType.INTERRUPTED,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`[VOICE WEBSOCKET] Error handling interrupt: ${error instanceof Error ? error.message : String(error)}`);
      client.emit('error', {
        type: VoiceMessageType.ERROR,
        code: 'INTERRUPT_ERROR',
        message: 'Failed to process interrupt',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle end session request
   */
  @SubscribeMessage('end_session')
  async handleEndSession(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const userId = client.data.userId;
    const voiceStream = client.data.voiceStream;

    if (!userId) {
      client.emit('error', { type: VoiceMessageType.ERROR, code: 'AUTH_ERROR', message: 'Not authenticated' });
      return;
    }

    this.logger.log(`[VOICE WEBSOCKET] End session request from user: ${userId}`);

    if (voiceStream) {
      try {
        voiceStream.close();
        client.data.voiceStream = undefined;
        this.logger.log(`[VOICE WEBSOCKET] Voice session ended by user: ${userId}`);
      } catch (error) {
        this.logger.error(`[VOICE WEBSOCKET] Error ending session: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    client.emit('session_ended', {
      type: VoiceMessageType.SESSION_ENDED,
      reason: 'user_requested',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Extract JWT token from socket handshake
   */
  private extractToken(client: AuthenticatedSocket): string | null {
    // Try authorization header first
    const authHeader = client.handshake.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
      }
    }

    // Try query parameter
    const tokenFromQuery = client.handshake.query.token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    return null;
  }
}
