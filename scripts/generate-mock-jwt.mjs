#!/usr/bin/env node
/**
 * Generate Mock JWT Token Script
 * 
 * Generates a JWT token for testing with Swagger UI.
 * This script creates a token that can be used with the mock server.
 * 
 * Usage:
 *   node scripts/generate-mock-jwt.mjs [options]
 * 
 * Options:
 *   --phone <phone>     Phone number (default: +919999999999)
 *   --name <name>       User name (default: Test User)
 *   --app-id <appId>    App ID (default: com.paymentalert.app)
 *   --json              Output as JSON for programmatic use
 * 
 * Note: For mock mode testing, use phone +919999999999 with OTP 123456
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

// Parse command line args
const args = process.argv.slice(2);
const getArg = (name, defaultValue) => {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultValue;
};

const phoneNumber = getArg('--phone', '+919999999999');
const userName = getArg('--name', 'Test User');
const appId = getArg('--app-id', 'com.paymentalert.app');
const outputJson = args.includes('--json');

// Generate user ID
const userId = nanoid();
const cleanPhone = phoneNumber.replace(/\D/g, '');
const email = `${cleanPhone}@alertpay.local`;

// Generate JWT
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
const token = jwt.sign(
  { sub: userId, appId },
  jwtSecret,
  { expiresIn: '30d' }
);

if (outputJson) {
  console.log(JSON.stringify({
    userId,
    name: userName,
    email,
    phoneNumber,
    appId,
    token,
    expiresIn: '30d'
  }));
} else {
  console.log('\n' + '='.repeat(60));
  console.log('✅ MOCK TEST USER JWT GENERATED');
  console.log('='.repeat(60));
  console.log('\n📋 User Details (for reference):');
  console.log(`   User ID:    ${userId}`);
  console.log(`   Name:       ${userName}`);
  console.log(`   Email:      ${email}`);
  console.log(`   Phone:      ${phoneNumber}`);
  console.log(`   App ID:     ${appId}`);
  console.log(`\n🔑 JWT Token (copy this for Swagger UI):`);
  console.log(`\n${token}\n`);
  console.log('='.repeat(60));
  console.log('\n📖 To use with Swagger UI:');
  console.log('   1. Start mock server: pnpm start:dev:mock');
  console.log('   2. Open http://localhost:4010/docs');
  console.log('   3. Click "Authorize" button');
  console.log('   4. Paste the token in the JWT field');
  console.log('   5. X-App-ID is pre-set to: com.paymentalert.app');
  console.log('\n💡 Note: For mock mode, use test phone +919999999999 with OTP 123456');
  console.log('='.repeat(60) + '\n');
}