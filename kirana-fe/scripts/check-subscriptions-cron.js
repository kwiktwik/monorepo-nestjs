#!/usr/bin/env node

/**
 * Cron script to check subscriptions that haven't been cancelled within 4 hours
 * This script is executed by PM2 every hour
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

// Validate required environment variables
if (!CRON_SECRET) {
    console.error('[CRON] ERROR: CRON_SECRET environment variable is not set');
    process.exit(1);
}

// Parse the base URL to determine protocol and hostname
const apiUrl = new URL('/api/cron/check-subscriptions', BASE_URL);
const USE_HTTPS = apiUrl.protocol === 'https:';
const PORT = apiUrl.port || (USE_HTTPS ? 443 : 80);

const options = {
    hostname: apiUrl.hostname,
    port: PORT,
    path: apiUrl.pathname,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
};

console.log(`[CRON] Starting subscription check at ${new Date().toISOString()}`);
console.log(`[CRON] Calling: ${apiUrl.href}`);

const client = USE_HTTPS ? https : http;

const req = client.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`[CRON] Response status: ${res.statusCode}`);

        try {
            const result = JSON.parse(data);
            console.log('[CRON] Response:', JSON.stringify(result, null, 2));

            if (res.statusCode === 200 && result.success) {
                console.log(`[CRON] ✅ Successfully processed ${result.processed} subscriptions`);
                process.exit(0);
            } else {
                console.error('[CRON] ❌ Request failed:', result);
                process.exit(1);
            }
        } catch (err) {
            console.error('[CRON] ❌ Failed to parse response:', data);
            process.exit(1);
        }
    });
});

req.on('error', (error) => {
    console.error('[CRON] ❌ Request error:', error.message);
    process.exit(1);
});

req.on('timeout', () => {
    console.error('[CRON] ❌ Request timeout after 30 seconds');
    req.destroy();
    process.exit(1);
});

req.end();
