# KwikTwik Kirana Backend

Clean NestJS backend for ShareStatus app with JWT authentication, OTP, and Google sign-in.

## Tech Stack

- **NestJS** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Passport.js** with JWT strategy
- **Google Auth Library** for Google sign-in
- **Equence SMS API** for OTP delivery

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Run the server:
```bash
# Development
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod
```

## Notification Event Testing

### Seed Notification Users

```bash
node scripts/seed-notification-users.mjs
```

This seeds 10 users and sessions for the app ID (default: `com.sharekaro.kirana`). It prints JWTs to the console for quick testing.

Environment overrides:
- `SEED_APP_ID` - override app id used for user metadata and JWT tokens.
- `JWT_SECRET` - must match the API server JWT secret.
- `DATABASE_URL` / `DB_NAME` / `DB_PORT` / `DB_USER` / `RDS_PASSWORD` - database connection.

### Test /event API

```bash
SEED_JWT_TOKEN="<paste-jwt>" node scripts/test-notification-event.mjs
```

This logs the payload, makes a POST request to `/api/event`, and prints the response.

### E2E Notification Event Flow Test

```bash
node scripts/e2e-notification-test.mjs
```

This script:
1. Creates 3 test users (Alice, Bob, Charlie).
2. Generates JWTs for each.
3. Ingests 3 different event types (`order.created`, `purchase.completed`, `payment.failed`).
4. Verifies the database status of each event after processing (PENDING -> PROCESSING -> COMPLETED).

Environment overrides:
- `SEED_BASE_URL` - base server URL (default: http://localhost:4010)
- `JWT_SECRET` - must match server secret for JWT validation.
- `DATABASE_URL` - full connection string.

## API Routes

### Authentication (No JWT required, only X-App-ID header)
- `POST /api/phone-number/send-otp` - Send OTP to phone number
- `POST /api/phone-number/verify` - Verify OTP and get JWT token
- `POST /api/auth/google-signin` - Sign in with Google ID token

### App Configuration (Requires X-App-ID + JWT)
- `GET /api/config/v2` - Get app configuration

### User Management (Requires X-App-ID + JWT)
- `GET /api/user/v1` - Get current user profile
- `POST /api/user/v1` - Update user profile
- `DELETE /api/user/v1` - Delete user account

### Health Check
- `GET /health` - Server health status

## Headers Required

All routes require `X-App-ID` header with one of:
- `com.sharestatus.app`
- `com.sharekaro.kirana`
- `sharekaro-andriod`

Authenticated routes also require:
```
Authorization: Bearer <jwt-token>
```

## OTP Abuse Prevention

- **60s cooldown** per phone number
- **10 OTPs per day** per phone number
- **20 OTPs per hour** per IP address
- **5 wrong attempts** per OTP code

## Environment Variables

See `.env.example` for required configuration.

## Production Deployment

The app is managed by PM2. Configuration in `ecosystem.config.cjs`:
```bash
pnpm run build
pm2 start ecosystem.config.cjs --only kwiktwik-kirana-be
```

Port: **4010**
