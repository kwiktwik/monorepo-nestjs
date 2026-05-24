# Client Diagnostic Events API

## Overview

Diagnostic events (API failures, network timeouts, crashes, etc.) are now collected via a dedicated endpoint on the backend. These events are **not analytics** — they're for debugging and monitoring.

**Base URL**: Your existing backend URL (same as all other APIs)

---

## Endpoint

### `POST /v1/client-events`

Send a batch of diagnostic events from the app. Events are processed asynchronously — the endpoint returns immediately.

### Headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer <jwt_token>` (same auth as all other endpoints) |
| `X-App-ID` | Yes | App identifier (same as all other endpoints) |
| `Content-Type` | Yes | `application/json` |

### Request Body

```json
{
  "events": [
    {
      "eventType": "API_CALL_FAILED",
      "deviceModel": "Pixel 8",
      "osVersion": "15",
      "appVersion": "2.1.0",
      "timestamp": "2025-06-01T12:30:00.000Z",
      "payload": {
        "endpoint": "/api/user/profile",
        "method": "GET",
        "statusCode": 500,
        "error": "Internal Server Error",
        "latencyMs": 2340
      }
    }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `events` | Array | Yes | Array of event objects (max **100** per request) |
| `events[].eventType` | String | Yes | Event type (see table below) |
| `events[].deviceModel` | String | No | Device model (e.g. `"Pixel 8"`, `"Samsung S24"`) |
| `events[].osVersion` | String | No | Android OS version (e.g. `"14"`, `"15"`) |
| `events[].appVersion` | String | No | App version name (e.g. `"2.1.0"`) |
| `events[].timestamp` | String | No | ISO 8601 timestamp when the event occurred on device |
| `events[].payload` | Object | No | Event-specific data (see examples below) |

> **Note**: `userId` is automatically attached from the JWT token — do NOT send it in the request body.

### Event Types

| eventType | When to send | Recommended payload fields |
|---|---|---|
| `API_CALL_FAILED` | Any API call returns 4xx/5xx | `endpoint`, `method`, `statusCode`, `error`, `latencyMs` |
| `NETWORK_TIMEOUT` | API call times out | `endpoint`, `method`, `timeoutMs` |
| `NETWORK_ERROR` | No internet / DNS failure | `endpoint`, `method`, `error` |
| `SLOW_API_CALL` | API call takes > threshold (e.g. 5s) | `endpoint`, `method`, `latencyMs` |
| `AUTH_TOKEN_EXPIRED` | JWT refresh fails or 401 received | `endpoint`, `error` |
| `WEBSOCKET_DISCONNECT` | WebSocket connection drops unexpectedly | `reason`, `reconnectAttempt` |
| `APP_CRASH` | Uncaught exception (if not covered by Sentry) | `error`, `stackTrace` |
| `APP_ANR` | Application Not Responding detected | `durationMs`, `screen` |

You can also send **custom event types** — the field is a free-form string. The above are the recommended standard names.

### Response

**Status: `202 Accepted`**

```json
{
  "accepted": true,
  "count": 1
}
```

### Error Responses

| Status | Body | Cause |
|---|---|---|
| `401` | `{ "message": "Unauthorized" }` | Missing or invalid JWT / X-App-ID |
| `400` | `{ "message": [...] }` | Validation error (empty events array, missing eventType, etc.) |
| `429` | `{ "message": "Too many requests..." }` | Rate limit exceeded (100 req/min per IP) |

---

## Integration Guide

### 1. Batching (recommended)

Don't send one HTTP request per event. **Buffer events in memory and flush periodically**:

- Flush every **30 seconds** or when buffer reaches **20 events**, whichever comes first
- Also flush on `onPause()` / app going to background
- Max 100 events per request

```kotlin
// Pseudocode
class EventBuffer {
    private val buffer = mutableListOf<ClientEvent>()
    private val MAX_BUFFER = 20
    private val FLUSH_INTERVAL = 30_000L // 30 seconds

    fun track(event: ClientEvent) {
        buffer.add(event)
        if (buffer.size >= MAX_BUFFER) flush()
    }

    fun flush() {
        if (buffer.isEmpty()) return
        val events = buffer.toList()
        buffer.clear()

        // Fire and forget — don't block UI
        scope.launch(Dispatchers.IO) {
            try {
                api.postClientEvents(IngestRequest(events = events))
            } catch (e: Exception) {
                // Silently drop — these are diagnostic, not critical
            }
        }
    }
}
```

### 2. Fire and forget

This is a **diagnostic** endpoint. Never let it block the user experience:
- Don't retry on failure
- Don't show errors to the user
- Don't wait for the response before continuing
- If the request fails, silently drop the events

### 3. Payload guidelines

- Keep `payload` small — only include useful debugging fields
- Don't include sensitive data (passwords, tokens, PII)
- Truncate long strings (e.g. stack traces) to ~1000 chars

---

## Example: Retrofit integration

```kotlin
interface ClientEventsApi {
    @POST("v1/client-events")
    suspend fun sendEvents(@Body request: IngestRequest): Response<IngestResponse>
}

data class ClientEvent(
    val eventType: String,
    val deviceModel: String? = Build.MODEL,
    val osVersion: String? = Build.VERSION.RELEASE,
    val appVersion: String? = BuildConfig.VERSION_NAME,
    val timestamp: String? = Instant.now().toString(),
    val payload: Map<String, Any?>? = null,
)

data class IngestRequest(val events: List<ClientEvent>)
data class IngestResponse(val accepted: Boolean, val count: Int)
```

### Interceptor example — auto-track API failures

```kotlin
class ApiFailureTracker(private val eventBuffer: EventBuffer) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val startMs = System.currentTimeMillis()

        return try {
            val response = chain.proceed(request)
            val latencyMs = System.currentTimeMillis() - startMs

            if (!response.isSuccessful) {
                eventBuffer.track(ClientEvent(
                    eventType = "API_CALL_FAILED",
                    payload = mapOf(
                        "endpoint" to request.url.encodedPath,
                        "method" to request.method,
                        "statusCode" to response.code,
                        "latencyMs" to latencyMs,
                    )
                ))
            } else if (latencyMs > 5000) {
                eventBuffer.track(ClientEvent(
                    eventType = "SLOW_API_CALL",
                    payload = mapOf(
                        "endpoint" to request.url.encodedPath,
                        "method" to request.method,
                        "latencyMs" to latencyMs,
                    )
                ))
            }

            response
        } catch (e: SocketTimeoutException) {
            eventBuffer.track(ClientEvent(
                eventType = "NETWORK_TIMEOUT",
                payload = mapOf(
                    "endpoint" to request.url.encodedPath,
                    "method" to request.method,
                    "timeoutMs" to (System.currentTimeMillis() - startMs),
                )
            ))
            throw e
        } catch (e: IOException) {
            eventBuffer.track(ClientEvent(
                eventType = "NETWORK_ERROR",
                payload = mapOf(
                    "endpoint" to request.url.encodedPath,
                    "method" to request.method,
                    "error" to (e.message ?: "Unknown"),
                )
            ))
            throw e
        }
    }
}
```

---

## Quick test (cURL)

```bash
curl -X POST https://your-backend.com/v1/client-events \
  -H "Authorization: Bearer <your_jwt>" \
  -H "X-App-ID: com.jugnu.alertpe" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "eventType": "API_CALL_FAILED",
        "deviceModel": "Pixel 8",
        "osVersion": "15",
        "appVersion": "2.1.0",
        "payload": {
          "endpoint": "/api/user/profile",
          "method": "GET",
          "statusCode": 500,
          "error": "Internal Server Error",
          "latencyMs": 2340
        }
      }
    ]
  }'

# Expected: {"accepted":true,"count":1}
```