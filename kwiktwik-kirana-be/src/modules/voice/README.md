# Voice Module

Provider-agnostic voice-to-voice streaming module for NestJS backend.

## Overview

This module provides HTTP/2 streaming endpoints for real-time voice conversations using the Gemini Live API (and future providers like OpenAI).

## Architecture

```
Mobile App ←→ NestJS Backend ←→ Gemini Live API
  (HTTP/2)      (Proxy)          (WebSocket)
```

## Features

- ✅ **Provider Agnostic** - Swap Gemini ↔ OpenAI with one config change
- ✅ **API Versioning** - Supports v1 (Gemini), ready for v2 (OpenAI)
- ✅ **Low Latency** - ~10ms overhead with HTTP/2 streaming
- ✅ **JWT Authentication** - Uses existing auth guards
- ✅ **Multi-tenant** - Supports different apps with different configs

## API Endpoints

### V1 - Current (Gemini)

```http
POST /api/v1/voice/stream
Authorization: Bearer <jwt_token>
X-App-ID: com.yourapp.id
Content-Type: audio/pcm16;rate=24000
Accept: audio/pcm16;rate=24000

<raw PCM16 audio stream>
```

**Response:** HTTP/2 chunked stream with PCM16 audio

### Health Check

```http
POST /api/v1/voice/health
Authorization: Bearer <jwt_token>
```

## Audio Format

- **Encoding:** PCM16 (signed 16-bit little-endian)
- **Sample Rate:** 24000 Hz
- **Channels:** Mono (1)
- **Chunk Size:** ~100ms (4800 bytes)

## Configuration

Add to `.env.local`:

```bash
# Gemini Live API
GEMINI_API_KEY_V1=your-gemini-api-key-here

# Optional: Change voice (Puck, Charon, Kore, Fenrir, Aoede)
GEMINI_VOICE_V1=Puck
```

## Flutter Integration

```dart
import 'package:dio/dio.dart';

class VoiceService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://api.yourapp.com/api',
    headers: {
      'Authorization': 'Bearer $jwtToken',
      'X-App-ID': 'com.yourapp.id',
    },
  ));

  Future<void> startVoiceStream({
    required Stream<List<int>> audioInput,
    required Function(List<int> audioChunk) onAudioOutput,
  }) async {
    final response = await _dio.post<ResponseBody>(
      '/v1/voice/stream',
      data: audioInput,
      options: Options(
        responseType: ResponseType.stream,
        headers: {
          'Content-Type': 'audio/pcm16;rate=24000',
          'Accept': 'audio/pcm16;rate=24000',
        },
      ),
    );

    await for (final chunk in response.data!.stream) {
      onAudioOutput(chunk);
    }
  }
}
```

## Swapping Providers

To switch from Gemini to OpenAI in the future:

1. Implement `OpenAIVoiceProvider` in `providers/openai-voice.provider.ts`
2. Update `.env.local`:
   ```bash
   VOICE_PROVIDER_V1=openai
   OPENAI_API_KEY_V1=your-openai-key
   ```
3. No mobile app changes needed!

## File Structure

```
src/modules/voice/
├── voice.module.ts              # Module definition
├── voice.controller.ts          # HTTP/2 streaming endpoint
├── config/
│   └── voice-config.service.ts  # Version-aware config
├── interfaces/
│   └── voice-provider.interface.ts  # Provider contract
├── providers/
│   ├── gemini-voice.provider.ts     # Gemini implementation
│   └── openai-voice.provider.ts     # OpenAI stub
├── types/
│   └── voice.types.ts           # Type definitions
└── dto/
    └── voice-events.dto.ts      # Request/response DTOs
```

## Future Enhancements

- [ ] V2: OpenAI Realtime API support
- [ ] Rate limiting per user
- [ ] Session persistence/logging
- [ ] Multiple concurrent voices
- [ ] Voice activity detection (VAD)
