# Cron Job Running Guide

This document explains how cron jobs run in `kwiktwik-kirana-be`, how to verify they are active, and how to trigger supported jobs manually.

## How Cron Works Here

- Cron jobs are implemented using NestJS scheduler decorators (`@Cron(...)`).
- Jobs run only when the backend process is running (`pnpm run start:dev` or `pnpm run start:prod`).
- Schedules use the server timezone unless a timezone is explicitly set in code.
- If you run multiple backend instances, the same cron can execute on each instance.

## Active Cron Jobs

### 1) Razorpay: 4-Hour Subscription Event

- **File:** `src/modules/razorpay/scheduler/four-hour-event.scheduler.ts`
- **Method:** `processFourHourEvents()`
- **Schedule:** `CronExpression.EVERY_HOUR` (hourly)
- **What it does:** Sends analytics events for eligible subscriptions not cancelled within 4 hours.

### 2) Migration Maintenance

- **File:** `src/modules/migration/migration-cron.service.ts`
- **Method:** `handleStaleMigrationCleanup()`
- **Schedule:** `CronExpression.EVERY_5_MINUTES`
- **What it does:** Cleans stale/abandoned migration records.

- **Method:** `logDailyMigrationStats()`
- **Schedule:** `CronExpression.EVERY_DAY_AT_MIDNIGHT`
- **What it does:** Logs daily migration statistics.

### 3) PhonePe Redemptions

- **File:** `src/modules/phonepe-v2/application/services/redemption-scheduler.service.ts`
- **Method:** `processDueRedemptions()`
- **Schedule:** `0 1 * * *` (daily at 01:00 server time)
- **What it does:** Processes due redemptions and retryable failed redemptions.

- **Method:** `processStuckActivations()`
- **Schedule:** `CronExpression.EVERY_30_MINUTES`
- **What it does:** Polls and resolves subscriptions stuck in activation state.

- **Method:** `processStuckRedemptions()`
- **Schedule:** `CronExpression.EVERY_HOUR`
- **What it does:** Polls and resolves redemptions stuck in pending state.

## Run Cron Jobs Locally

1. Install dependencies and configure env:

```bash
pnpm install
cp .env.example .env
```

2. Start backend:

```bash
pnpm run start:dev
```

3. Watch logs for cron execution:

```bash
pnpm run start:dev | rg -i "cron|migration|redemption|4-hour|4h"
```

## Run Cron Jobs In Production

1. Build app:

```bash
pnpm run build
```

2. Start backend process (example):

```bash
pm2 start ecosystem.config.cjs --only kwiktwik-kirana-be
```

3. Inspect logs:

```bash
pm2 logs kwiktwik-kirana-be --lines 200
```

4. Filter cron lines:

```bash
pm2 logs kwiktwik-kirana-be --lines 500 | rg -i "cron|migration|redemption|4-hour|4h"
```

## Manual Trigger (Supported Job)

The 4-hour Razorpay analytics cron can be triggered manually via admin API:

```bash
curl -X POST "http://localhost:3002/api/trigger-four-hour-cron" \
  -H "Authorization: Bearer <admin-jwt>"
```

Expected success response:

```json
{ "message": "Four hour cron triggered successfully" }
```
