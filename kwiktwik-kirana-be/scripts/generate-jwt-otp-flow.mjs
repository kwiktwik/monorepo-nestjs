#!/usr/bin/env node
/**
 * Generate JWT via OTP Login Flow for Mobile 8855866494
 *
 * This script performs the full OTP login flow against the production API:
 * 1. Sends OTP to phone number 8855866494
 * 2. Prompts for OTP code
 * 3. Verifies OTP and returns JWT token
 *
 * Usage:
 *   node scripts/generate-jwt-otp-flow.mjs
 *
 * Options:
 *   --phone <phone>     Phone number (default: 8855866494)
 *   --app-id <appId>    App ID (default: com.paymentalert.app)
 *   --api-url <url>     API base URL (default: https://services.kiranaapps.com)
 *   --json              Output as JSON
 */

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// Parse command line args
const args = process.argv.slice(2);
const getArg = (name, defaultValue) => {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultValue;
};

const phoneNumber = getArg('--phone', '8855866494');
const appId = getArg('--app-id', 'com.paymentalert.app');
const apiUrl = getArg('--api-url', 'https://services.kiranaapps.com');
const outputJson = args.includes('--json');

async function sendOtp(phone) {
  const phoneWithPlus = phone.startsWith('+') ? phone : `+91${phone}`;

  const response = await fetch(`${apiUrl}/api/phone-number/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': appId,
    },
    body: JSON.stringify({
      phoneNumber: phoneWithPlus,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Failed to send OTP: ${data.message || response.statusText}`,
    );
  }

  return data;
}

async function verifyOtp(phone, code) {
  const phoneWithPlus = phone.startsWith('+') ? phone : `+91${phone}`;

  const response = await fetch(`${apiUrl}/api/phone-number/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': appId,
    },
    body: JSON.stringify({
      phoneNumber: phoneWithPlus,
      code: code,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Failed to verify OTP: ${data.message || response.statusText}`,
    );
  }

  return data;
}

async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 OTP LOGIN FLOW FOR JWT GENERATION');
    console.log('='.repeat(60));
    console.log(`\n📱 Phone Number: ${phoneNumber}`);
    console.log(`🌐 API URL: ${apiUrl}`);
    console.log(`📱 App ID: ${appId}`);
    console.log('');

    // Step 1: Send OTP
    console.log('📤 Sending OTP...');
    const sendResult = await sendOtp(phoneNumber);

    if (sendResult.success) {
      console.log('✅ OTP sent successfully!');
      if (sendResult.message) {
        console.log(`ℹ️  ${sendResult.message}`);
      }
    } else {
      console.error(
        '❌ Failed to send OTP:',
        sendResult.message || 'Unknown error',
      );
      process.exit(1);
    }

    // Step 2: Get OTP from user
    console.log('');
    const otpCode = await askQuestion('Enter the OTP code you received: ');

    if (!otpCode || otpCode.trim().length === 0) {
      console.error('❌ OTP code cannot be empty');
      process.exit(1);
    }

    // Step 3: Verify OTP
    console.log('\n📤 Verifying OTP...');
    const verifyResult = await verifyOtp(phoneNumber, otpCode.trim());

    if (verifyResult.success && verifyResult.data?.token) {
      const { token, user } = verifyResult.data;

      if (outputJson) {
        console.log(
          JSON.stringify({
            success: true,
            token,
            user,
            phoneNumber,
            appId,
          }),
        );
      } else {
        console.log('\n' + '='.repeat(60));
        console.log('✅ JWT TOKEN GENERATED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log('\n📋 User Details:');
        console.log(`   User ID:    ${user?.id || 'N/A'}`);
        console.log(`   Name:       ${user?.name || 'N/A'}`);
        console.log(`   Email:      ${user?.email || 'N/A'}`);
        console.log(`   Phone:      ${phoneNumber}`);
        console.log(`   App ID:     ${appId}`);
        console.log(`\n🔑 JWT Token:`);
        console.log(`\n${token}\n`);
        console.log('='.repeat(60));
        console.log('\n📖 Usage:');
        console.log(
          '   curl -H "Authorization: Bearer <token>" -H "X-App-ID: ' +
            appId +
            '" "' +
            apiUrl +
            '/api/config/v3"',
        );
        console.log('='.repeat(60) + '\n');
      }
    } else {
      console.error(
        '❌ Failed to get JWT token:',
        verifyResult.message || 'Unknown error',
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
