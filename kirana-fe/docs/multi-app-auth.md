# Multi-App Authentication API Documentation

## Overview

This API supports multiple applications using the same authentication endpoints. Apps are identified by the `X-App-ID` header, and users are isolated per app.

## Registered Applications

The following apps are currently registered:

- `alertpay-android` - AlertPay Android mobile app
- `alertpay-ios` - AlertPay iOS mobile app
- `alertpay-web` - AlertPay web application
- `alertpay-default` - Default app for backward compatibility

To register a new app, add it to `/lib/config/apps.ts`.

## Required Headers

All authentication requests **should** include the `X-App-ID` header for proper app isolation:

```
X-App-ID: <your-app-id>
```

**Example:**
```
X-App-ID: alertpay-android
```

**Backward Compatibility:**
- If `X-App-ID` header is **not provided**, requests will default to `alertpay-default` app
- This ensures existing integrations without the header continue to work
- For new integrations, always include the `X-App-ID` header for proper app isolation

## API Endpoints

### 1. Send OTP

**Endpoint:** `POST /api/phone-number/send-otp`

**Headers:**
```
Content-Type: application/json
X-App-ID: alertpay-android
```

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "appHash": "ABC123XYZ" // Optional, for Android SMS retriever
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phoneNumber": "+919876543210"
  }
}
```

**Error Responses:**
- `400` - Missing app ID or phone number
- `401` - Invalid or disabled app ID
- `403` - OTP login not enabled for this app
- `500` - Failed to send OTP

---

### 2. Verify OTP

**Endpoint:** `POST /api/phone-number/verify`

**Headers:**
```
Content-Type: application/json
X-App-ID: alertpay-android
```

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "code": "123456",
  "disableSession": false // Optional, default: false
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "status": true,
    "token": "abc123sessiontoken456",
    "user": {
      "id": "user_abc123",
      "email": "9876543210@alertpay.local",
      "emailVerified": false,
      "name": "User 3210",
      "image": null,
      "phoneNumber": "+919876543210",
      "phoneNumberVerified": true,
      "createdAt": "2026-01-15T15:50:00.000Z",
      "updatedAt": "2026-01-15T15:50:00.000Z"
    },
    "appId": "alertpay-android"
  }
}
```

**Error Responses:**
- `400` - Missing app ID, phone number, or OTP code
- `401` - Invalid or expired OTP, invalid app ID
- `403` - OTP login not enabled for this app
- `500` - Server error

---

### 3. Truecaller Login

**Endpoint:** `POST /api/truecaller/token`

**Headers:**
```
Content-Type: application/json
X-App-ID: alertpay-android
```

**Request Body:**
```json
{
  "grant_type": "authorization_code",
  "client_id": "your_truecaller_client_id",
  "code": "authorization_code_from_truecaller",
  "code_verifier": "pkce_code_verifier"
}
```

**Response:**
```json
{
  "success": true,
  "token": "abc123sessiontoken456",
  "expires_at": "2026-02-14T15:50:00.000Z",
  "user": {
    "id": "user_xyz789",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "image": "https://example.com/photo.jpg",
    "emailVerified": true,
    "phoneNumberVerified": true
  },
  "user_profile": {
    "sub": "truecaller_user_id",
    "given_name": "John",
    "family_name": "Doe",
    "phone_number": "+919876543210",
    "email": "john@example.com",
    "picture": "https://example.com/photo.jpg",
    "phone_number_verified": true
  },
  "appId": "alertpay-android"
}
```

**Error Responses:**
- `400` - Missing required parameters
- `401` - Invalid app ID
- `403` - Invalid credentials or Truecaller login not enabled
- `500` - Server error

---

## User Isolation

Users are isolated per app based on `phoneNumber + appId` combination:

- Same phone number in different apps = **different user accounts**
- Each app has its own user base
- Sessions are scoped to specific apps

**Example:**

```
Phone: +919876543210
App: alertpay-android
→ User ID: user_abc123

Phone: +919876543210  (same number)
App: partner-app-1    (different app)
→ User ID: user_xyz789 (different user)
```

## Testing

### Test Mode

For testing, use the following credentials:

**Phone Number:** `+919999999999` or `+91919999999999`  
**OTP Code:** `123456`

This bypasses actual SMS sending and works with any registered app.

### Example: Multi-App Testing

**Test 1: Android App Login**
```bash
# Send OTP
curl -X POST http://localhost:3000/api/phone-number/send-otp \
  -H "Content-Type: application/json" \
  -H "X-App-ID: alertpay-android" \
  -d '{"phoneNumber": "+919999999999"}'

# Verify OTP
curl -X POST http://localhost:3000/api/phone-number/verify \
  -H "Content-Type: application/json" \
  -H "X-App-ID: alertpay-android" \
  -d '{"phoneNumber": "+919999999999", "code": "123456"}'
```

**Test 2: iOS App Login (Same Phone)**
```bash
# Send OTP
curl -X POST http://localhost:3000/api/phone-number/send-otp \
  -H "Content-Type: application/json" \
  -H "X-App-ID: alertpay-ios" \
  -d '{"phoneNumber": "+919999999999"}'

# Verify OTP
curl -X POST http://localhost:3000/api/phone-number/verify \
  -H "Content-Type: application/json" \
  -H "X-App-ID: alertpay-ios" \
  -d '{"phoneNumber": "+919999999999", "code": "123456"}'
```

**Result:** Two separate user accounts will be created, one for each app.

## Error Handling

### Missing App ID
```json
{
  "error": "Missing app identifier. Please provide X-App-ID header."
}
```
**Status:** `400 Bad Request`

### Invalid App ID
```json
{
  "error": "Invalid or disabled app identifier: unknown-app"
}
```
**Status:** `401 Unauthorized`

### Feature Not Enabled
```json
{
  "error": "Feature 'truecallerLogin' is not enabled for app: alertpay-web"
}
```
**Status:** `403 Forbidden`

## Adding New Apps

To register a new application:

1. Open `/lib/config/apps.ts`
2. Add your app to the `REGISTERED_APPS` object:

```typescript
"your-app-id": {
  id: "your-app-id",
  name: "Your App Name",
  description: "Description of your app",
  enabled: true,
  rateLimit: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  features: {
    otpLogin: true,
    truecallerLogin: true,
    googleLogin: true,
  },
},
```

3. Restart your application
4. Use `X-App-ID: your-app-id` in requests

## Security Considerations

- App IDs are validated against a whitelist
- Only registered and enabled apps can authenticate
- Each app has isolated user data
- Sessions are scoped to specific apps
- Rate limiting is applied per app
