/**
 * Voice Controller
 * HTTP/2 streaming endpoint for voice-to-voice conversations
 * API Version: v1
 */

import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  UseGuards,
  Version,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppId } from '../../common/decorators/app-id.decorator';
import type { AuthenticatedUser } from '../../common/types';
import { VoiceProvider } from './interfaces/voice-provider.interface';
import { VoiceConfigService } from './config/voice-config.service';
import { GeminiVoiceProvider } from './providers/gemini-voice.provider';
import { VertexVoiceProvider } from './providers/vertex-voice.provider';
import { VoiceSessionConfig } from './types/voice.types';

/**
 * JWT Payload interface
 */
interface JwtPayload {
  userId: string;
  [key: string]: unknown;
}

@ApiTags('voice')
@Controller('voice')
@UseGuards(AppIdGuard, JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
export class VoiceController {
  private readonly logger = new Logger(VoiceController.name);

  constructor(
    private readonly voiceConfigService: VoiceConfigService,
  ) {}

  /**
   * V1: Voice streaming endpoint
   * POST /api/v1/voice/stream
   * 
   * Request: Raw PCM16 audio stream (24kHz, mono)
   * Response: HTTP/2 chunked stream with PCM16 audio
   */
  @Post('stream')
  @Version('1')
  @ApiOperation({
    summary: 'Start voice-to-voice streaming session (v1)',
    description: `
      Bidirectional voice streaming endpoint.
      
      **Request:**
      - Content-Type: audio/pcm16;rate=24000
      - Body: Raw PCM16 audio chunks
      
      **Response:**
      - Content-Type: audio/pcm16;rate=24000
      - Transfer-Encoding: chunked
      - Body: Streamed PCM16 audio chunks
      
      **Audio Format:**
      - Encoding: PCM16 (signed 16-bit little-endian)
      - Sample Rate: 24000 Hz
      - Channels: Mono (1)
      - Chunk Size: ~100ms (4800 bytes)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Voice stream established - audio streaming in progress',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 503,
    description: 'Service Unavailable - Voice provider not available',
  })
  async streamV1(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-app-id') appId: string,
    @Headers('accept-language') language: string,
    @Headers('x-voice-name') voiceName: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const userId = user?.userId || 'anonymous';
    const apiVersion = 'v1';

    this.logger.log(`[LIVE VOICE API] Voice stream request received - user: ${userId}, app: ${appId}, version: ${apiVersion}`);
    this.logger.log(`[LIVE VOICE API] Request headers - language: ${language || 'en-US'}, voiceName: ${voiceName || 'default'}`);

    // Get version configuration
    this.logger.log(`[LIVE VOICE API] Getting version config for API version: ${apiVersion}`);
    const config = this.voiceConfigService.getVersionConfig(apiVersion);
    this.logger.log(`[LIVE VOICE API] Config loaded - provider: ${config.provider}, model: ${config.model}, defaultVoice: ${config.defaultVoice}`);

    // Create provider instance
    this.logger.log(`[LIVE VOICE API] Creating voice provider: ${config.provider}`);
    let provider: VoiceProvider;
    switch (config.provider) {
      case 'gemini':
        if (!config.apiKey) {
          this.logger.error('[LIVE VOICE API] Gemini API key not configured');
          throw new ServiceUnavailableException('Gemini API key not configured');
        }
        this.logger.log('[LIVE VOICE API] Initializing GeminiVoiceProvider');
        provider = new GeminiVoiceProvider(config.apiKey, config.model);
        break;
      case 'vertex':
        this.logger.log('[LIVE VOICE API] Initializing VertexVoiceProvider');
        provider = new VertexVoiceProvider(
          config.projectId,
          config.region,
          config.model,
          config.serviceAccountPath,
        );
        break;
      default:
        this.logger.error(`[LIVE VOICE API] Unsupported voice provider: ${config.provider}`);
        throw new BadRequestException(`Unsupported voice provider: ${config.provider}`);
    }

    // Check provider availability
    this.logger.log(`[LIVE VOICE API] Checking ${config.provider} provider availability...`);
    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      this.logger.error(`[LIVE VOICE API] ${config.provider} provider is not available`);
      throw new ServiceUnavailableException('Voice provider not available');
    }
    this.logger.log(`[LIVE VOICE API] ${config.provider} provider is available`);

    // Build session configuration
    const sessionConfig: VoiceSessionConfig = {
      userId: userId.toString(),
      appId,
      language: language || 'en-US',
      apiVersion,
      voiceName: voiceName || config.defaultVoice,
      inputFormat: config.inputFormat,
      outputFormat: config.outputFormat,
    };

    // Create voice stream
    this.logger.log(`[LIVE VOICE API] Creating voice stream with session config: ${JSON.stringify(sessionConfig)}`);
    const voiceStream = await provider.createStream(sessionConfig);
    this.logger.log(`[LIVE VOICE API] Voice stream created successfully`);

    // Set response headers for HTTP/2 streaming
    const sessionId = `${Date.now()}-${userId}`;
    res.setHeader('Content-Type', 'audio/pcm16;rate=24000;channels=1');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Voice-Provider', config.provider);
    res.setHeader('X-Voice-Version', apiVersion);
    res.setHeader('X-Voice-Session-Id', sessionId);
    this.logger.log(`[LIVE VOICE API] Response headers set - sessionId: ${sessionId}`);

    // Track connection state
    let isClosed = false;
    let bytesReceived = 0;
    let bytesSent = 0;
    let chunksReceived = 0;
    let chunksSent = 0;

    // Handle audio output from provider -> mobile
    voiceStream.onAudioOutput((audioChunk: Buffer) => {
      if (!isClosed && res.writable) {
        res.write(audioChunk);
        bytesSent += audioChunk.length;
        chunksSent++;
        if (chunksSent <= 5 || chunksSent % 10 === 0) {
          this.logger.log(`[LIVE VOICE API] Audio output chunk #${chunksSent} sent to client (${audioChunk.length} bytes)`);
        }
      }
    });

    // Handle transcription (optional - log only for now)
    voiceStream.onTranscript((text: string, isFinal: boolean) => {
      this.logger.log(`[LIVE VOICE API] Transcript [${isFinal ? 'final' : 'partial'}]: ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`);
    });

    // Handle errors
    voiceStream.onError((error: Error) => {
      this.logger.error(`[LIVE VOICE API] Voice stream error for user ${userId}: ${error.message}`);
      if (!isClosed) {
        isClosed = true;
        res.status(500).end();
      }
    });

    // Handle stream close
    voiceStream.onClose(() => {
      this.logger.log(`[LIVE VOICE API] Voice stream closed - user: ${userId}, chunks received: ${chunksReceived}, chunks sent: ${chunksSent}, bytes received: ${bytesReceived}, bytes sent: ${bytesSent}`);
      if (!isClosed) {
        isClosed = true;
        res.end();
      }
    });

    // Handle mobile disconnect
    req.on('close', () => {
      this.logger.log(`[LIVE VOICE API] Client disconnected - user: ${userId}`);
      if (!isClosed) {
        isClosed = true;
        voiceStream.close();
      }
    });

    // Handle incoming audio from mobile -> provider
    req.on('data', (chunk: Buffer) => {
      if (!isClosed) {
        bytesReceived += chunk.length;
        chunksReceived++;
        if (chunksReceived <= 5 || chunksReceived % 20 === 0) {
          this.logger.log(`[LIVE VOICE API] Audio input chunk #${chunksReceived} received from client (${chunk.length} bytes)`);
        }
        voiceStream.sendAudio(chunk);
      }
    });

    // Handle request end
    req.on('end', () => {
      this.logger.log(`[LIVE VOICE API] Audio input ended - user: ${userId}, total chunks: ${chunksReceived}, total bytes: ${bytesReceived}`);
      // Keep connection open for response - Gemini will continue generating audio
    });

    // Handle request errors
    req.on('error', (error: Error) => {
      this.logger.error(`[LIVE VOICE API] Request error for user ${userId}: ${error.message}`);
      if (!isClosed) {
        isClosed = true;
        voiceStream.close();
        res.status(500).end();
      }
    });

    // Log stream start
    this.logger.log(`[LIVE VOICE API] Voice stream fully started and ready - user: ${userId}, provider: ${config.provider}, sessionId: ${sessionId}`);
  }

  /**
   * Health check endpoint
   * GET /api/v1/voice/health
   */
  @Post('health')
  @Version('1')
  @ApiOperation({ summary: 'Check voice service health' })
  @ApiResponse({ status: 200, description: 'Service healthy' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async healthCheck(): Promise<{ status: string; provider: string; version: string }> {
    this.logger.log('[LIVE VOICE API] Health check initiated');
    const apiVersion = 'v1';
    const config = this.voiceConfigService.getVersionConfig(apiVersion);
    this.logger.log(`[LIVE VOICE API] Health check - provider: ${config.provider}, model: ${config.model}`);

    let provider: VoiceProvider;
    switch (config.provider) {
      case 'gemini':
        if (!config.apiKey) {
          this.logger.error('[LIVE VOICE API] Health check failed: Gemini API key not configured');
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
        this.logger.error(`[LIVE VOICE API] Health check failed: Unknown provider: ${config.provider}`);
        throw new ServiceUnavailableException(`Unknown provider: ${config.provider}`);
    }

    this.logger.log(`[LIVE VOICE API] Health check - checking ${config.provider} availability...`);
    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      this.logger.error(`[LIVE VOICE API] Health check failed: ${config.provider} provider is not available`);
      throw new ServiceUnavailableException('Voice provider not available');
    }

    this.logger.log(`[LIVE VOICE API] Health check passed - ${config.provider} is healthy`);
    return {
      status: 'healthy',
      provider: config.provider,
      version: apiVersion,
    };
  }
}
