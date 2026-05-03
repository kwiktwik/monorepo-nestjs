# Slydee API Documentation

Complete API reference for the Slydee AI Dating Companion feature.
Base URL: `{SERVER_URL}/slydee`

---

## Authentication

All endpoints marked with **Auth Required** need these headers:

| Header          | Value                          | Required |
|-----------------|--------------------------------|----------|
| `Authorization` | `Bearer <jwt_token>`           | Yes      |
| `X-App-ID`      | `com.kwiktwik.datingai`        | Yes      |

---

## Data Models

### CompanionProfile

```json
{
  "id": "b65067c4-4499-4266-9d33-ad30480b3934",
  "name": "Nisha",
  "location": "Kochi",
  "age": 23,
  "bio": "Marine Biologist, Ocean Guardian, Protecting our blue planet.",
  "description": "Diving off Kochi's shores...",
  "imageUrls": [
    "http://136.110.243.144/companion_profiles/nisha_0.jpg"
  ],
  "gifUrls": [],
  "interests": ["Environment", "Science", "Conservation"],
  "isLocked": false,
  "isSafeCompatible": true,
  "freeChatCount": 0,
  "position": 38,
  "createdAt": "2025-10-13T23:55:25.865Z",
  "updatedAt": "2026-02-12T17:00:48.163Z"
}
```

### SwipeEntry (stored in userMetadata)

```json
{
  "companionId": "b65067c4-...",
  "direction": "right",
  "swipedAt": "2026-07-15T10:30:00.000Z"
}
```

### MatchEntry (stored in userMetadata)

```json
{
  "companionId": "b65067c4-...",
  "companionName": "Nisha",
  "companionImage": "http://136.110.243.144/companion_profiles/nisha_0.jpg",
  "conversationId": "a1b2c3d4-...",
  "matchedAt": "2026-07-15T10:30:00.000Z"
}
```

### userMetadata.clientData structure

Both `slydeeSwipes` and `slydeeMatches` are stored in the user's `clientData`
field inside the `user_metadata` table. This data is also returned by the
existing `GET /user/profile` endpoint under the `clientData` key.

```json
{
  "slydeeSwipes": [ SwipeEntry, ... ],
  "slydeeMatches": [ MatchEntry, ... ]
}
```

---

## App Flow (Recommended Order)

```
1. GET  /slydee/companions       → Pre-cache all profiles on app launch
2. GET  /slydee/discover         → Load the swipe card stack
3. POST /slydee/swipe            → User swipes left or right
4. GET  /slydee/matches          → Show the matches / chat list screen
5. POST /slydee/companion-chat   → User sends a message in chat
```

---

## Endpoints

---

### 1. Get All Companions

Fetch the full catalog of AI companion profiles. Use on app launch to cache
images and data locally.

```
GET /slydee/companions
```

**Auth Required:** No

#### Response `200 OK`

```json
{
  "success": true,
  "data": [ CompanionProfile, ... ],
  "count": 42
}
```

---

### 2. Get Companion by ID

Fetch a single companion profile by ID.

```
GET /slydee/companions/:id
```

**Auth Required:** No

#### Path Parameters

| Param | Type   | Description     |
|-------|--------|-----------------|
| `id`  | string | Companion UUID  |

#### Response `200 OK` (found)

```json
{
  "success": true,
  "data": { CompanionProfile }
}
```

#### Response `200 OK` (not found)

```json
{
  "success": false,
  "message": "Companion with ID xyz not found"
}
```

---

### 3. Discover (Swipe Card Stack)

Returns companions the user has **not yet swiped on**. These are the cards shown
in the swipe UI. Only unlocked (`isLocked: false`) companions are returned.

```
GET /slydee/discover
GET /slydee/discover?safeOnly=true
```

**Auth Required:** Yes

#### Query Parameters

| Param      | Type   | Default | Description                                  |
|------------|--------|---------|----------------------------------------------|
| `safeOnly` | string | -       | Pass `"true"` to only show safe-compatible   |

#### Response `200 OK`

```json
{
  "success": true,
  "data": [ CompanionProfile, ... ],
  "count": 15
}
```

When `count` is `0`, all companions have been swiped. The app can show an
"End of deck" state.

---

### 4. Swipe on a Companion

Records a swipe action. **Left swipe** = skip (companion won't appear in
discover again). **Right swipe** = like, which creates a match, starts a
conversation, and generates an AI greeting message.

```
POST /slydee/swipe
```

**Auth Required:** Yes

#### Request Body

| Field         | Type   | Required | Description                                          |
|---------------|--------|----------|------------------------------------------------------|
| `companionId` | string | Yes      | UUID of the companion being swiped                   |
| `direction`   | string | Yes      | `"left"` or `"right"`                                |
| `language`    | string | No       | Language for AI greeting (e.g. `"hi"`, `"en"`). Default: `"Hinglish"`. Only used on right swipe |
| `tone`        | string | No       | Tone for AI greeting. Default: `"flirty"`. Only used on right swipe |

**Available tones:** `flirty`, `witty`, `casual`, `bold`, `romantic`

#### Request Example (left swipe)

```json
{
  "companionId": "b65067c4-4499-4266-9d33-ad30480b3934",
  "direction": "left"
}
```

#### Response `201` (left swipe)

```json
{
  "success": true,
  "direction": "left",
  "matched": false
}
```

#### Request Example (right swipe)

```json
{
  "companionId": "58501dc8-1dd9-4360-a58d-01c868d07487",
  "direction": "right",
  "language": "hi",
  "tone": "flirty"
}
```

#### Response `201` (right swipe - match created)

```json
{
  "success": true,
  "direction": "right",
  "matched": true,
  "companion": { CompanionProfile },
  "conversationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "greeting": "Hey there! I'm Nisha. I heard you like the ocean too? 😊",
  "greetingMessageId": "f1e2d3c4-b5a6-7890-abcd-ef1234567890"
}
```

**Client behavior on right swipe:**
1. Show a "It's a Match!" animation with `companion.name` and `companion.imageUrls[0]`
2. Navigate to the chat screen using `conversationId`
3. Display the `greeting` as the first message from the companion

---

### 5. Get Matches

Returns all companions the user has right-swiped on (matched with). Use this to
render the matches / chat list screen.

```
GET /slydee/matches
```

**Auth Required:** Yes

#### Response `200 OK`

```json
{
  "success": true,
  "matches": [
    {
      "companionId": "58501dc8-...",
      "companionName": "Nisha",
      "companionImage": "http://136.110.243.144/.../nisha_0.jpg",
      "conversationId": "a1b2c3d4-...",
      "matchedAt": "2026-07-15T10:30:00.000Z"
    },
    {
      "companionId": "4e640f0d-...",
      "companionName": "Sofia",
      "companionImage": "http://136.110.243.144/.../sofia_0.jpg",
      "conversationId": "b2c3d4e5-...",
      "matchedAt": "2026-07-15T11:15:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 6. Send Chat Message

Send a text message to a matched companion. The server saves it, generates an AI
reply using the companion's persona, saves the reply, and returns it.

```
POST /slydee/companion-chat
```

**Auth Required:** Yes

#### Request Body

| Field         | Type     | Required | Description                                        |
|---------------|----------|----------|----------------------------------------------------|
| `companionId` | string   | Yes      | UUID of the companion                              |
| `userMessage` | string   | Yes      | The user's message text                            |
| `chatHistory` | array    | No       | Recent messages for extra context (usually not needed; server loads history from DB) |
| `language`    | string   | No       | Language code (e.g. `"hi"`, `"en"`). Default: `"Hinglish"` |
| `tone`        | string   | No       | Response tone. Default: `"flirty"`                 |

**chatHistory item shape** (if provided):

| Field     | Type   | Description                  |
|-----------|--------|------------------------------|
| `role`    | string | `"user"` or `"companion"`    |
| `content` | string | Message text                 |

#### Request Example

```json
{
  "companionId": "58501dc8-1dd9-4360-a58d-01c868d07487",
  "userMessage": "Hey Nisha! What are you up to today?",
  "language": "hi",
  "tone": "flirty"
}
```

#### Response `201`

```json
{
  "reply": "Arre, bas aaj thodi snorkeling karke aayi! Tu bata, miss kiya mujhe? 😏",
  "conversationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userMessageId": "msg-uuid-1",
  "companionMessageId": "msg-uuid-2"
}
```

**Client behavior:**
1. Send request when user taps send
2. Show a typing indicator while waiting
3. Display `reply` as a new message from the companion
4. Store `conversationId` for subsequent calls

---

### 7. Random Match (Alternative)

Automatically picks a random unswiped companion, creates a match, and returns a
greeting. Useful for a "Surprise Me" button. Internally records a right swipe.

```
POST /slydee/random-match
```

**Auth Required:** Yes

#### Request Body

| Field      | Type    | Required | Description                                   |
|------------|---------|----------|-----------------------------------------------|
| `safeOnly` | boolean | No       | Only pick safe-compatible companions           |
| `language` | string  | No       | Language for AI greeting. Default: `"Hinglish"` |
| `tone`     | string  | No       | Tone for AI greeting. Default: `"flirty"`      |

#### Request Example

```json
{
  "safeOnly": true,
  "language": "hi",
  "tone": "casual"
}
```

#### Response `201` (match created)

Same shape as a right-swipe response:

```json
{
  "success": true,
  "direction": "right",
  "matched": true,
  "companion": { CompanionProfile },
  "conversationId": "uuid",
  "greeting": "Hi! I'm Sofia...",
  "greetingMessageId": "uuid"
}
```

#### Response `201` (no companions left)

```json
{
  "success": false,
  "message": "No companions available"
}
```

---

## Supporting Endpoints (Conversations & Messages)

These are general messaging endpoints also used by Slydee. Use the
`conversationId` returned by the swipe/match endpoints.

---

### Get Message History

Load paginated chat messages for a conversation.

```
GET /messages/conversation/:conversationId?limit=50&cursor=<messageId>
```

**Auth Required:** Yes

#### Query Parameters

| Param    | Type   | Default | Description                                    |
|----------|--------|---------|------------------------------------------------|
| `limit`  | string | `50`    | Max messages to return                         |
| `before` | string | -       | Return messages before this timestamp (ISO)    |
| `after`  | string | -       | Return messages after this timestamp (ISO)     |
| `cursor` | string | -       | Message ID cursor for pagination               |

#### Response `200 OK`

```json
[
  {
    "id": "msg-uuid-1",
    "conversationId": "conv-uuid",
    "appId": "com.kwiktwik.datingai",
    "senderId": "user-uuid",
    "content": "Hey! How are you?",
    "type": "text",
    "replyToId": null,
    "metadata": {},
    "isEdited": false,
    "isDeleted": false,
    "createdAt": "2026-07-15T10:31:00.000Z",
    "updatedAt": "2026-07-15T10:31:00.000Z"
  },
  {
    "id": "msg-uuid-2",
    "conversationId": "conv-uuid",
    "appId": "com.kwiktwik.datingai",
    "senderId": "companion-uuid",
    "content": "Hey there! I'm doing great 😊",
    "type": "text",
    "replyToId": null,
    "metadata": {},
    "isEdited": false,
    "isDeleted": false,
    "createdAt": "2026-07-15T10:31:05.000Z",
    "updatedAt": "2026-07-15T10:31:05.000Z"
  }
]
```

**Tip:** Compare `senderId` with the current user's ID. If they match, it's a
sent message; otherwise it's the companion's reply.

---

### Get User Conversations

List all conversations for the current user. Useful for the chat list screen.

```
GET /conversations
```

**Auth Required:** Yes

#### Response `200 OK`

```json
[
  {
    "id": "conv-uuid",
    "appId": "com.kwiktwik.datingai",
    "type": "direct",
    "name": null,
    "description": null,
    "avatarUrl": null,
    "createdBy": "user-uuid",
    "lastMessageAt": "2026-07-15T10:31:05.000Z",
    "lastMessagePreview": "Hey there! I'm doing great 😊",
    "metadata": {},
    "participants": [
      {
        "id": "p-uuid-1",
        "userId": "user-uuid",
        "role": "admin",
        "user": { "id": "user-uuid", "name": "Rajat", "image": null }
      },
      {
        "id": "p-uuid-2",
        "userId": "companion-uuid",
        "role": "member",
        "user": { "id": "companion-uuid", "name": "Nisha", "image": "http://..." }
      }
    ]
  }
]
```

---

### Mark Conversation as Read

```
POST /conversations/:conversationId/read
```

**Auth Required:** Yes

#### Response `200 OK`

```json
{ "message": "Marked as read" }
```

---

### Get Unread Count

```
GET /conversations/:conversationId/unread
```

**Auth Required:** Yes

#### Response `200 OK`

```json
{ "unreadCount": 3 }
```

---

## Error Responses

All endpoints may return these standard errors:

| Status | Body                                                         | When                          |
|--------|--------------------------------------------------------------|-------------------------------|
| `401`  | `{ "message": "Unauthorized" }`                              | Missing or invalid JWT        |
| `400`  | `{ "message": ["companionId must be a string"], "error": "Bad Request" }` | Validation failed  |
| `404`  | `{ "message": "Companion xyz not found" }`                   | Invalid companion ID          |

---

## Complete Client Integration Example

### Screen 1: Swipe Screen

```
1. On screen load → GET /slydee/discover
2. Show companion cards as a swipeable stack
3. On left swipe  → POST /slydee/swipe { companionId, direction: "left" }
4. On right swipe → POST /slydee/swipe { companionId, direction: "right" }
5. If right swipe response has matched: true → show match animation → open chat
6. When card stack is empty (count: 0) → show "No more profiles" state
```

### Screen 2: Matches / Chat List

```
1. On screen load → GET /slydee/matches
2. Render list using companionName, companionImage, matchedAt
3. On tap → open chat screen with conversationId
4. Optional: also call GET /conversations for lastMessagePreview + unread count
```

### Screen 3: Chat Screen

```
1. On screen load → GET /messages/conversation/:conversationId?limit=50
2. Render message bubbles (compare senderId to current user ID)
3. On send → POST /slydee/companion-chat { companionId, userMessage }
4. Show typing indicator while request is in flight
5. On response → append companion's reply bubble
6. Mark as read → POST /conversations/:conversationId/read
```
