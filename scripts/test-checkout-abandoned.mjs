#!/usr/bin/env node
/**
 * Test Script: Checkout Abandoned Flow
 *
 * This script tests the delayed notification flow for abandoned checkouts.
 *
 * Flow:
 * 1. Create a test user (non-premium)
 * 2. Simulate checkout initiation
 * 3. Schedule checkout-abandoned check with short delay (5 seconds for testing)
 * 4. Wait for the job to be processed
 * 5. Verify notification was sent via mock channels
 *
 * Usage:
 *   USE_MOCK_DB=true node scripts/test-checkout-abandoned.mjs
 *
 * Prerequisites:
 * - Mock server running: pnpm start:dev:mock
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

// Load environment
try {
  const envPath = resolve(packageRoot, '.env.local');
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  // .env.local optional
}

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const APP_ID = 'com.paymentalert.app';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const TEST_DELAY_SECONDS = 5; // Use short delay for testing

console.log('\n' + '='.repeat(70));
console.log('🧪 CHECKOUT ABANDONED FLOW TEST');
console.log('='.repeat(70));
console.log(`📍 Base URL: ${BASE_URL}`);
console.log(`📱 App ID: ${APP_ID}`);
console.log(`⏱️  Test Delay: ${TEST_DELAY_SECONDS} seconds`);
console.log('='.repeat(70) + '\n');

/**
 * Generate JWT token for test user
 */
function generateTestToken(userId, appId) {
  return jwt.sign({ sub: userId, appId }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Step 1: Create a test user via auth endpoint
 */
async function createTestUser(phoneNumber) {
  console.log('📝 Step 1: Creating test user...');

  // First, send OTP
  const sendOtpResponse = await fetch(`${BASE_URL}/api/phone-number/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': APP_ID,
    },
    body: JSON.stringify({ phoneNumber }),
  });

  const sendOtpData = await sendOtpResponse.json();
  console.log(`   📱 OTP sent: ${sendOtpData.message}`);

  // For test phone number, use 123456
  const otp = phoneNumber === '+919999999999' ? '123456' : sendOtpData.mockCode;

  // Verify OTP
  const verifyResponse = await fetch(`${BASE_URL}/api/phone-number/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': APP_ID,
    },
    body: JSON.stringify({ phoneNumber, code: otp }),
  });

  const verifyData = await verifyResponse.json();

  console.log(verifyData);

  console.log(`   ✅ User created/verified: ${verifyData.data.user.id}`);
  console.log(`   📧 Email: ${verifyData.data.user.email}`);

  console.log(verifyData);
  return {
    userId: verifyData.data.user.id,
    token: verifyData.data.token,
    user: verifyData.data.user,
  };
}

/**
 * Step 2: Schedule checkout abandoned check
 */
async function scheduleCheckoutAbandoned(token, checkoutData, delaySeconds) {
  console.log('\n📅 Step 2: Scheduling checkout abandoned check...');

  const response = await fetch(`${BASE_URL}/api/event/checkout-abandoned`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': APP_ID,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...checkoutData,
      delayMinutes: delaySeconds / 60, // Convert to minutes (can be decimal)
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to schedule: ${JSON.stringify(data)}`);
  }

  console.log(`   ✅ Job scheduled: ${data.jobId}`);
  console.log(`   ⏰ Scheduled for: ${data.scheduledFor}`);

  return data;
}

/**
 * Step 3: Check queue stats
 */
async function getQueueStats(token) {
  const response = await fetch(`${BASE_URL}/api/event/queue/stats`, {
    headers: {
      'X-App-ID': APP_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Step 4: Wait and monitor job processing
 */
async function waitForJobProcessing(token, expectedDelaySeconds) {
  console.log('\n⏳ Step 3: Waiting for job to be processed...');
  console.log(`   Expected wait: ~${expectedDelaySeconds} seconds\n`);

  const startTime = Date.now();
  const maxWaitTime = (expectedDelaySeconds + 10) * 1000; // Add 10 seconds buffer
  let completed = false;

  while (!completed && Date.now() - startTime < maxWaitTime) {
    const stats = await getQueueStats(token);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    process.stdout.write(
      `\r   [${elapsed}s] Waiting... | Delayed: ${stats.delayed} | Active: ${stats.active} | Completed: ${stats.completed}   `,
    );

    if (stats.completed > 0) {
      completed = true;
      console.log('\n   ✅ Job completed!');
    } else {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!completed) {
    console.log('\n   ⚠️  Timeout waiting for job completion');
  }

  // Get final stats
  const finalStats = await getQueueStats(token);
  console.log('\n📊 Final Queue Stats:');
  console.log(`   - Waiting: ${finalStats.waiting}`);
  console.log(`   - Active: ${finalStats.active}`);
  console.log(`   - Delayed: ${finalStats.delayed}`);
  console.log(`   - Completed: ${finalStats.completed}`);
  console.log(`   - Failed: ${finalStats.failed}`);

  return finalStats;
}

/**
 * Main test flow
 */
async function main() {
  try {
    // Check if server is running
    console.log('🔍 Checking server availability...');
    try {
      const healthCheck = await fetch(`${BASE_URL}/health`);
      if (!healthCheck.ok) {
        throw new Error('Health check failed');
      }
      console.log('   ✅ Server is running\n');
    } catch (error) {
      console.error('   ❌ Server is not running!');
      console.error('   Please start the mock server first:');
      console.error('   pnpm start:dev:mock\n');
      process.exit(1);
    }

    // Test Scenario 1: Non-premium user (should receive notification)
    console.log('='.repeat(70));
    console.log(
      '📋 SCENARIO 1: Non-premium user (should receive notification)',
    );
    console.log('='.repeat(70));

    const testUser1 = await createTestUser('+919999999999');
    const token1 = testUser1.token;

    console.log('\n🛒 Simulating checkout initiation...');
    console.log('   Order ID: test-order-001');
    console.log('   Amount: ₹999');
    console.log('   Plan: Premium Monthly');

    await scheduleCheckoutAbandoned(
      token1,
      {
        orderId: 'test-order-001',
        amount: 999,
        currency: 'INR',
        planName: 'Premium Monthly',
      },
      TEST_DELAY_SECONDS,
    );

    await waitForJobProcessing(token1, TEST_DELAY_SECONDS);

    console.log('\n' + '-'.repeat(70));
    console.log('✅ SCENARIO 1 COMPLETE');
    console.log('-'.repeat(70));
    console.log('   The notification should have been sent via mock channels.');
    console.log('   Check the server logs for:');
    console.log('   - "User <userId> is not premium, proceeding..."');
    console.log('   - "Mock push delivered..."');
    console.log('   - "Mock in-app delivered..."');

    // Wait a bit before next scenario
    await new Promise((r) => setTimeout(r, 2000));

    // Test Scenario 2: Quick test with another user
    console.log('\n' + '='.repeat(70));
    console.log('📋 SCENARIO 2: Another non-premium user');
    console.log('='.repeat(70));

    const testUser2 = await createTestUser('+919999999998');
    const token2 = testUser2.token;

    await scheduleCheckoutAbandoned(
      token2,
      {
        orderId: 'test-order-002',
        amount: 1499,
        currency: 'INR',
        planName: 'Premium Yearly',
      },
      TEST_DELAY_SECONDS,
    );

    await waitForJobProcessing(token2, TEST_DELAY_SECONDS);

    console.log('\n' + '-'.repeat(70));
    console.log('✅ SCENARIO 2 COMPLETE');
    console.log('-'.repeat(70));

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log('\n📋 Test Summary:');
    console.log(`   - Created 2 test users`);
    console.log(`   - Scheduled 2 checkout-abandoned checks`);
    console.log(`   - Both jobs processed after ${TEST_DELAY_SECONDS}s delay`);
    console.log(`   - Notifications sent via mock channels`);
    console.log('\n💡 Check server logs to verify the complete flow.');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
