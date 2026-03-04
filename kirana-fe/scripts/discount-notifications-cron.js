#!/usr/bin/env node

/**
 * Script to trigger discount notifications cron job.
 * Can be run standalone or with PM2.
 * 
 * Usage:
 *   node scripts/discount-notifications-cron.js
 * 
 * Or with PM2:
 *   pm2 start ecosystem.config.cjs
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  console.error('[discount-notifications] ERROR: CRON_SECRET environment variable is not set');
  process.exit(1);
}

const endpoint = `${BASE_URL}/api/cron/discount-notifications`;

console.log(`[discount-notifications] Triggering cron job at ${new Date().toISOString()}`);
console.log(`[discount-notifications] Endpoint: ${endpoint}`);

async function triggerDiscountNotifications() {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });
    
    const data = await response.json();
    
    console.log(`[discount-notifications] Response status: ${response.status}`);
    console.log(`[discount-notifications] Response:`, JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error(`[discount-notifications] ❌ Failed with status ${response.status}`);
      process.exit(1);
    }
    
    console.log(`[discount-notifications] ✅ Success! Sent ${data.sent || 0} notifications`);
    process.exit(0);
    
  } catch (error) {
    console.error(`[discount-notifications] ❌ Error:`, error.message);
    process.exit(1);
  }
}

// Run if executed directly
triggerDiscountNotifications();
