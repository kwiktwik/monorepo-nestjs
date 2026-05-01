# Voice Module

Provider-agnostic voice-to-voice streaming module for NestJS backend.

## Overview

This module provides **WebSocket-based** real-time voice conversations using the Gemini Live API (and future providers like OpenAI).

**⚠️ Migration Notice:** This module has been migrated from HTTP/2 streaming to WebSocket for better bidirectional communication and real-time performance.

## Architecture

```
Mobile App ←→ NestJS Backend ←→ Gemini Live API
  (WebSocket)     (Proxy)          (WebSocket)
```

## Features

- ✅ **WebSocket Streaming** - Bidirectional real-time communication
- ✅ **Provider Agnostic** - Swap Gemini ↔ OpenAI with one config change
- ✅ **API Versioning** - Supports v1 (Gemini), ready for v2 (OpenAI)
- ✅ **Low Latency** - ~10ms overhead with WebSocket streaming
- ✅ **JWT Authentication** - Uses existing auth guards
- ✅ **Multi-tenant** - Supports different apps with different configs

## WebSocket API

### Connection

```javascript
const socket = io('wss://api.yourapp.com/voice', {
  auth: {
    token: 'Bearer <jwt_token>'
  },
  extraHeaders: {
    'X-App-ID': 'com.yourapp.id'
  },
  query: {
    version: 'v1'
  }
});
```

### Message Flow

1. **Connect** → Wait for `connected` event
2. **Start Session** → Emit `start_session` → Wait for `session_started`
3. **Send Audio** → Emit `audio_input` with base64-encoded PCM16 audio
4. **Receive Audio** → Listen for `audio_output` events with base64 audio
5. **Transcription** → Listen for `transcript` events
6. **Interrupt** → Emit `interrupt` to stop current generation
7. **End Session** → Emit `end_session` or disconnect

### Message Types

#### Client → Server

```typescript
// Start session
socket.emit('start_session', {
  type: 'start_session',
  apiVersion: 'v1',
  language: 'en-US',
  voiceName: 'Achernar'
});

// Send audio (base64-encoded PCM16)
socket.emit('audio_input', {
  type: 'audio_input',
  audio: '<base64-encoded-audio>'
});

// Interrupt current generation
socket.emit('interrupt', {
  type: 'interrupt'
});

// End session
socket.emit('end_session', {
  type: 'end_session'
});
```

#### Server → Client

```typescript
// Connection established
socket.on('connected', (data) => {
  console.log('Connected:', data.sessionId);
});

// Session started
socket.on('session_started', (data) => {
  console.log('Session started:', data.provider, data.voiceName);
});

// Receive audio (base64-encoded PCM16)
socket.on('audio_output', (data) => {
  const audioBuffer = Buffer.from(data.audio, 'base64');
  // Play audio...
});

// Transcription events
socket.on('transcript', (data) => {
  console.log(data.isFinal ? 'Final:' : 'Partial:', data.text);
});

// Interrupt acknowledged
socket.on('interrupted', () => {
  console.log('Generation interrupted');
});

// Session ended
socket.on('session_ended', (data) => {
  console.log('Session ended:', data.reason);
});

// Errors
socket.on('error', (data) => {
  console.error('Error:', data.code, data.message);
});
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

# Optional: Change voice (Achernar, Puck, Charon, Kore, Fenrir, Aoede)
GEMINI_VOICE_V1=Achernar
```

## Flutter Integration

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class VoiceService {
  IO.Socket? socket;
  Function(List<int> audioChunk)? onAudioOutput;
  Function(String text, bool isFinal)? onTranscript;

  void connect(String jwtToken, String appId) {
    socket = IO.io('wss://api.yourapp.com/voice', IO.OptionBuilder()
      .setAuth({'token': 'Bearer $jwtToken'})
      .setExtraHeaders({'X-App-ID': appId})
      .setQuery({'version': 'v1'})
      .enableAutoConnect()
      .build());

    socket!.on('connected', (data) {
      print('Connected: ${data['sessionId']}');
      // Start voice session
      socket!.emit('start_session', {
        'apiVersion': 'v1',
        'language': 'en-US',
        'voiceName': 'Achernar',
      });
    });

    socket!.on('session_started', (data) {
      print('Session started with ${data['provider']}');
    });

    socket!.on('audio_output', (data) {
      final audioBytes = base64Decode(data['audio']);
      onAudioOutput?.call(audioBytes);
    });

    socket!.on('transcript', (data) {
      onTranscript?.call(data['text'], data['isFinal']);
    });

    socket!.on('error', (data) {
      print('Error: ${data['message']}');
    });
  }

  void sendAudio(List<int> audioBytes) {
    final base64Audio = base64Encode(audioBytes);
    socket?.emit('audio_input', {'audio': base64Audio});
  }

  void interrupt() {
    socket?.emit('interrupt', {});
  }

  void disconnect() {
    socket?.emit('end_session', {});
    socket?.disconnect();
  }
}
```

## JavaScript/React Native Integration

```javascript
import { io } from 'socket.io-client';

class VoiceService {
  constructor() {
    this.socket = null;
  }

  connect(jwtToken, appId) {
    this.socket = io('wss://api.yourapp.com/voice', {
      auth: { token: `Bearer ${jwtToken}` },
      extraHeaders: { 'X-App-ID': appId },
      query: { version: 'v1' },
    });

    this.socket.on('connected', (data) => {
      console.log('Connected:', data.sessionId);
      this.socket.emit('start_session', {
        apiVersion: 'v1',
        language: 'en-US',
        voiceName: 'Achernar',
      });
    });

    this.socket.on('session_started', (data) => {
      console.log('Session started:', data);
    });

    this.socket.on('audio_output', (data) => {
      const audioBuffer = Buffer.from(data.audio, 'base64');
      // Play audio using Web Audio API or native player
      this.playAudio(audioBuffer);
    });

    this.socket.on('transcript', (data) => {
      console.log(data.isFinal ? 'Final:' : 'Partial:', data.text);
    });

    this.socket.on('error', (data) => {
      console.error('Voice error:', data.code, data.message);
    });
  }

  sendAudio(audioBuffer) {
    const base64Audio = audioBuffer.toString('base64');
    this.socket?.emit('audio_input', { audio: base64Audio });
  }

  interrupt() {
    this.socket?.emit('interrupt', {});
  }

  disconnect() {
    this.socket?.emit('end_session', {});
    this.socket?.disconnect();
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
├── voice.module.ts                    # Module definition
├── voice.gateway.ts                   # WebSocket gateway (NEW - primary)
├── voice.controller.ts                # HTTP/2 endpoint (DEPRECATED)
├── config/
│   └── voice-config.service.ts        # Version-aware config
├── interfaces/
│   └── voice-provider.interface.ts    # Provider contract
├── providers/
│   ├── gemini-voice.provider.ts       # Gemini implementation
│   ├── vertex-voice.provider.ts       # Vertex AI implementation
│   └── openai-voice.provider.ts       # OpenAI stub
├── types/
│   └── voice.types.ts                 # Type definitions
└── dto/
    ├── voice-events.dto.ts            # HTTP request/response DTOs
    └── voice-websocket.dto.ts         # WebSocket message DTOs (NEW)
```

## Migration from HTTP/2

If you're currently using the HTTP/2 streaming endpoint:

1. Update your client to use WebSocket instead of HTTP/2
2. Implement message-based communication as shown above
3. Test with the provided examples
4. The HTTP/2 endpoint (`POST /api/v1/voice/stream`) is now deprecated

## Future Enhancements

- [ ] V2: OpenAI Realtime API support
- [ ] Rate limiting per user
- [ ] Session persistence/logging
- [ ] Multiple concurrent voices
- [ ] Voice activity detection (VAD)
- [ ] Binary WebSocket frames (more efficient than base64)
