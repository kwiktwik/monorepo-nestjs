# NestJS ShareStatus Backend - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `DATABASE_URL` - PostgreSQL connection string (same as kirana-fe)
- `JWT_SECRET` - Secret key for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `EQUENCE_USERNAME` - Equence SMS username
- `EQUENCE_PASSWORD` - Equence SMS password
- `EQUENCE_SENDER_ID` - SMS sender ID (default: ALRTSN)
- `EQUENCE_TMPL_ID` - SMS template ID

### 3. Development
```bash
pnpm run start:dev
```

Server runs on: http://localhost:4010

### 4. Production Build
```bash
pnpm run build
```

### 5. Production Deployment
```bash
# Using PM2
pm2 start ecosystem.config.cjs --only kwiktwik-kirana-be

# Or directly
pnpm run start:prod
```

## API Endpoints

### Health Check
```bash
curl http://localhost:4010/health
```

### Authentication (requires X-App-ID header)
```bash
# Send OTP
curl -X POST http://localhost:4010/api/phone-number/send-otp \
  -H "Content-Type: application/json" \
  -H "X-App-ID: com.sharestatus.app" \
  -d '{"phoneNumber": "+919876543210"}'

# Verify OTP
curl -X POST http://localhost:4010/api/phone-number/verify \
  -H "Content-Type: application/json" \
  -H "X-App-ID: com.sharestatus.app" \
  -d '{"phoneNumber": "+919876543210", "code": "123456"}'

# Google Sign-In
curl -X POST http://localhost:4010/api/auth/google-signin \
  -H "Content-Type: application/json" \
  -H "X-App-ID: com.sharestatus.app" \
  -d '{"idToken": "google-id-token-here"}'
```

### Protected Routes (require X-App-ID + Authorization header)
```bash
# Get Config
curl http://localhost:4010/api/config/v2 \
  -H "X-App-ID: com.sharestatus.app" \
  -H "Authorization: Bearer <jwt-token>"

# Get User Profile
curl http://localhost:4010/api/user/v1 \
  -H "X-App-ID: com.sharestatus.app" \
  -H "Authorization: Bearer <jwt-token>"

# Update User Profile
curl -X POST http://localhost:4010/api/user/v1 \
  -H "Content-Type: application/json" \
  -H "X-App-ID: com.sharestatus.app" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"name": "John Doe", "phoneNumber": "+919876543210"}'

# Delete User Account
curl -X DELETE http://localhost:4010/api/user/v1 \
  -H "X-App-ID: com.sharestatus.app" \
  -H "Authorization: Bearer <jwt-token>"
```

## Supported App IDs

- `com.sharestatus.app`
- `com.sharekaro.kirana`
- `sharekaro-andriod`

## Database Schema

The server uses Drizzle ORM and connects to the same PostgreSQL database as `kirana-fe`. It reads/writes to existing tables:

- `user` - User accounts
- `account` - OAuth accounts
- `user_metadata` - App-specific user data
- `orders` - Payment orders
- `subscriptions` - Recurring subscriptions
- `play_store_ratings` - App ratings
- `otp_codes` - OTP verification (new table)

## OTP Abuse Prevention

The server implements rate limiting for OTP requests:
- **60 seconds cooldown** between OTP requests per phone number
- **10 OTPs per day** per phone number
- **20 OTPs per hour** per IP address
- **5 failed attempts** per OTP code before it's burned

## Architecture

```
Request Flow:
1. AppId Guard validates X-App-ID header
2. JWT Guard validates Bearer token (for protected routes)
3. Controller handles request
4. Service layer processes business logic
5. Drizzle ORM queries PostgreSQL
6. Response returned to client
```

## Tech Stack

- **NestJS** - Node.js framework
- **Drizzle ORM** - Type-safe SQL query builder
- **Passport JWT** - Authentication strategy
- **Google Auth Library** - Google Sign-In verification
- **Equence SMS API** - OTP delivery
- **bcryptjs** - Password/OTP hashing
- **class-validator** - Request validation
- **pnpm** - Package manager

## Production Checklist

- [ ] Set strong `JWT_SECRET` in production
- [ ] Configure `DATABASE_URL` to production database
- [ ] Set up Equence SMS credentials
- [ ] Configure Google OAuth credentials
- [ ] Review CORS origins in `main.ts`
- [ ] Set `NODE_ENV=production`
- [ ] Run `pnpm run build` before deployment
- [ ] Start with PM2 for process management
- [ ] Monitor logs: `pm2 logs kwiktwik-kirana-be`

## Troubleshooting

### Build Errors
```bash
# Clean and rebuild
rm -rf dist node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:password@host:5432/dbname`
- Check network connectivity to database
- Ensure database exists and user has permissions

### OTP Not Sending
- Verify Equence credentials in `.env`
- Check Equence account balance/status
- Review server logs for SMS API errors

### JWT Token Issues
- Ensure `JWT_SECRET` is set
- Check token expiration (default: 30 days)
- Verify `Authorization: Bearer <token>` header format

## Support

For issues or questions, check the logs:
```bash
# PM2 logs
pm2 logs kwiktwik-kirana-be

# Development logs
pnpm run start:dev
```
