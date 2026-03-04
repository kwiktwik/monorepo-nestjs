# PM2 Cron Setup for Subscription Checks

## What was added:

1. **Cron Script**: `scripts/check-subscriptions-cron.js`
   - Calls the subscription check endpoint every hour
   - Properly handles errors and timeouts
   - Logs all activity for debugging

2. **PM2 Configuration**: Updated `ecosystem.config.cjs`
   - Added cron job that runs every hour at minute 0
   - Automatically managed by PM2

## Deployment Instructions

### 1. Ensure CRON_SECRET is set in your .env file

```bash
# Add to /Users/rajat/projects/alertpay/alterpay-fe/.env
CRON_SECRET=your-secure-random-token-here

# Generate secure token:
openssl rand -hex 32
```

### 2. Deploy to EC2

Push your changes to git and pull on EC2:

```bash
# On EC2
cd /path/to/alertpay-fe
git pull
```

### 3. Restart PM2 with new configuration

```bash
# Reload PM2 with updated ecosystem config
pm2 reload ecosystem.config.cjs --env production

# Or if starting fresh:
pm2 start ecosystem.config.cjs --env production

# Save PM2 configuration
pm2 save
```

### 4. Verify the cron job is running

```bash
# List all PM2 processes
pm2 list

# You should see:
# ├─ alertpay-fe-3000 (cluster x2)
# ├─ alertpay-fe-3010 (cluster x2)
# └─ check-subscriptions-cron (cron)

# Check cron logs
pm2 logs check-subscriptions-cron --lines 50
```

### 5. Test the cron job manually

```bash
# Trigger the cron job immediately (without waiting for the hour)
pm2 restart check-subscriptions-cron

# Watch the logs
pm2 logs check-subscriptions-cron --lines 100
```

## Expected Log Output

When the cron runs successfully, you should see:

```
[CRON] Starting subscription check at 2026-01-24T11:00:00.000Z
[CRON] Calling: http://localhost:3000/api/cron/check-subscriptions
[CRON] Response status: 200
[CRON] Response: {
  "success": true,
  "total": 0,
  "processed": 0,
  "failed": 0,
  "dryRun": false,
  "processingTimeMs": 45,
  "message": "No eligible subscriptions found"
}
[CRON] ✅ Successfully processed 0 subscriptions
```

## Troubleshooting

### Cron job not appearing in PM2 list

```bash
# Check PM2 version (needs >= 2.4.0 for cron support)
pm2 --version

# Update PM2 if needed
npm install -g pm2@latest
```

### Cron job failing with authentication error

- Verify `CRON_SECRET` is set in `.env` file
- Restart PM2 to pick up new environment variables: `pm2 reload ecosystem.config.cjs`

### Cron job not running hourly

```bash
# Check PM2 cron status
pm2 describe check-subscriptions-cron

# Look for "cron_restart: 0 * * * *"
```

### Check main app logs for API endpoint

```bash
# View logs from the main Next.js app
pm2 logs alertpay-fe-3000 | grep CRON
```

## Monitoring

Monitor cron job health:

```bash
# Check last 20 cron executions
pm2 logs check-subscriptions-cron --lines 20

# Real-time monitoring
pm2 monit
```
