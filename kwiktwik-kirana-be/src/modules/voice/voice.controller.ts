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

    this.logger.log(`Voice stream request - user: ${userId}, app: ${appId}, version: ${apiVersion}`);

    // Get version configuration
    const config = this.voiceConfigService.getVersionConfig(apiVersion);

    // Validate API key is configured
    if (!config.apiKey) {
      this.logger.error(`Gemini API key not configured for version ${apiVersion}`);
      throw new ServiceUnavailableException('Voice service not configured');
    }

    // Create provider instance
    let provider: VoiceProvider;
    switch (config.provider) {
      case 'gemini':
        provider = new GeminiVoiceProvider(config.apiKey);
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
      userId: userId.toString(),
      appId,
      language: language || 'en-US',
      apiVersion,
      voiceName: voiceName || config.defaultVoice,
      inputFormat: config.inputFormat,
      outputFormat: config.outputFormat,
    };

    // Create voice stream
    const voiceStream = await provider.createStream(sessionConfig);

    // Set response headers for HTTP/2 streaming
    res.setHeader('Content-Type', 'audio/pcm16;rate=24000;channels=1');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Voice-Provider', config.provider);
    res.setHeader('X-Voice-Version', apiVersion);
    res.setHeader('X-Voice-Session-Id', `${Date.now()}-${userId}`);

    // Track connection state
    let isClosed = false;
    let bytesReceived = 0;
    let bytesSent = 0;

    // Handle audio output from provider -> mobile
    voiceStream.onAudioOutput((audioChunk: Buffer) => {
      if (!isClosed && res.writable) {
        res.write(audioChunk);
        bytesSent += audioChunk.length;
      }
    });

    // Handle transcription (optional - log only for now)
    voiceStream.onTranscript((text: string, isFinal: boolean) => {
      this.logger.debug(`Transcript [${isFinal ? 'final' : 'partial'}]: ${text}`);
    });

    // Handle errors
    voiceStream.onError((error: Error) => {
      this.logger.error(`Voice stream error for user ${userId}:`, error.message);
      if (!isClosed) {
        isClosed = true;
        res.status(500).end();
      }
    });

    // Handle stream close
    voiceStream.onClose(() => {
      this.logger.log(`Voice stream closed - user: ${userId}, received: ${bytesReceived} bytes, sent: ${bytesSent} bytes`);
      if (!isClosed) {
        isClosed = true;
        res.end();
      }
    });

    // Handle mobile disconnect
    req.on('close', () => {
      this.logger.log(`Client disconnected - user: ${userId}`);
      if (!isClosed) {
        isClosed = true;
        voiceStream.close();
      }
    });

    // Handle incoming audio from mobile -> provider
    req.on('data', (chunk: Buffer) => {
      if (!isClosed) {
        bytesReceived += chunk.length;
        voiceStream.sendAudio(chunk);
      }
    });

    // Handle request end
    req.on('end', () => {
      this.logger.log(`Audio input ended - user: ${userId}, total received: ${bytesReceived} bytes`);
      // Keep connection open for response - Gemini will continue generating audio
    });

    // Handle request errors
    req.on('error', (error: Error) => {
      this.logger.error(`Request error for user ${userId}:`, error.message);
      if (!isClosed) {
        isClosed = true;
        voiceStream.close();
        res.status(500).end();
      }
    });

    // Log stream start
    this.logger.log(`Voice stream started - user: ${userId}, provider: ${config.provider}`);
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
    const apiVersion = 'v1';
    const config = this.voiceConfigService.getVersionConfig(apiVersion);

    if (!config.apiKey) {
      throw new ServiceUnavailableException('Voice service not configured');
    }

    let provider: VoiceProvider;
    switch (config.provider) {
      case 'gemini':
        provider = new GeminiVoiceProvider(config.apiKey);
        break;
      default:
        throw new ServiceUnavailableException(`Unknown provider: ${config.provider}`);
    }

    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      throw new ServiceUnavailableException('Voice provider not available');
    }

    return {
      status: 'healthy',
      provider: config.provider,
      version: apiVersion,
    };
  }
}
