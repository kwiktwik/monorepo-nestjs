#!/usr/bin/env node
/**
 * Generate JWT Token Script for Mobile 8855866494
 *
 * Generates a JWT token for production use with phone number 8855866494.
 * Looks up the user in the database and generates JWT with actual user ID.
 * Creates a new user if not found.
 *
 * Usage:
 *   node scripts/generate-jwt-8855866494.mjs [options]
 *
 * Options:
 *   --name <name>       User name (default: Test User)
 *   --app-id <appId>    App ID (default: com.paymentalert.app)
 *   --json              Output as JSON for programmatic use
 *   --no-create         Don't create user if not exists
 *   --jwt-secret <s>    JWT secret for signing (defaults to JWT_SECRET env var)
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import pg from 'pg';

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

const { Pool } = pg;

function getConnectionString() {
  let url = process.env.DATABASE_URL || '';
  if (
    url &&
    !url.startsWith('postgresql://') &&
    !url.startsWith('postgres://')
  ) {
    const host = url;
    const port = process.env.DB_PORT || '5432';
    const user = process.env.AWS_RDS_USER || 'postgres';
    const password = process.env.RDS_PASSWORD || process.env.AWS_RDS_PASSWORD;
    const dbName = process.env.DB_NAME || 'kiranaapps';
    if (!password) {
      throw new Error('RDS_PASSWORD or AWS_RDS_PASSWORD required');
    }
    url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;
  }
  return url;
}

// Parse command line args
const args = process.argv.slice(2);
const getArg = (name, defaultValue) => {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultValue;
};

const phoneNumber = getArg('--phone', '8855866494');
const userName = getArg('--name', 'Test User');
const appId = getArg('--app-id', 'com.paymentalert.app');
const jwtSecret = getArg(
  '--jwt-secret',
  process.env.JWT_SECRET || 'your-secret-key-change-this',
);
const outputJson = args.includes('--json');
const shouldCreateUser = !args.includes('--no-create');

async function main() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    console.error(
      'Error: DATABASE_URL not set. Please check your .env.local file.',
    );
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();

    // Look up user by phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const phoneWithPlus = cleanPhone.startsWith('+')
      ? cleanPhone
      : `+91${cleanPhone}`;

    let userResult = await client.query(
      'SELECT id, name, email, "phoneNumber" FROM "user" WHERE "phoneNumber" = $1 OR "phoneNumber" = $2 LIMIT 1',
      [phoneNumber, phoneWithPlus],
    );

    let userId;
    let userEmail;
    let userNameFromDb;
    let isNewUser = false;

    if (userResult.rows.length > 0) {
      // User found
      const user = userResult.rows[0];
      userId = user.id;
      userEmail = user.email;
      userNameFromDb = user.name;
      console.log(`✅ Found existing user: ${userId}`);
    } else if (shouldCreateUser) {
      // Create new user
      userId = nanoid();
      userEmail = `${cleanPhone}@kiranaapps.local`;
      isNewUser = true;

      await client.query(
        `INSERT INTO "user" (id, name, email, "emailVerified", "phoneNumber", "phoneNumberVerified", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, true, $4, true, NOW(), NOW())`,
        [userId, userName, userEmail, phoneWithPlus],
      );
      console.log(`✅ Created new user: ${userId}`);
    } else {
      console.error(
        `❌ User not found with phone ${phoneNumber}. Use --create to create user.`,
      );
      client.release();
      await pool.end();
      process.exit(1);
    }

    client.release();

    // Generate JWT
    const token = jwt.sign({ sub: userId, appId }, jwtSecret, {
      expiresIn: '30d',
    });

    if (outputJson) {
      console.log(
        JSON.stringify({
          userId,
          name: userNameFromDb || userName,
          email: userEmail || `${cleanPhone}@kiranaapps.local`,
          phoneNumber,
          appId,
          token,
          expiresIn: '30d',
          isNewUser,
        }),
      );
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('✅ JWT GENERATED FOR MOBILE 8855866494');
      console.log('='.repeat(60));
      console.log('\n📋 User Details:');
      console.log(`   User ID:    ${userId}`);
      console.log(`   Name:       ${userNameFromDb || userName}`);
      console.log(
        `   Email:      ${userEmail || `${cleanPhone}@kiranaapps.local`}`,
      );
      console.log(`   Phone:      ${phoneNumber}`);
      console.log(`   App ID:     ${appId}`);
      if (isNewUser) {
        console.log(`   Status:     🆕 New user created`);
      } else {
        console.log(`   Status:     👤 Existing user`);
      }
      console.log(`\n🔑 JWT Token (copy this for Swagger UI):`);
      console.log(`\n${token}\n`);
      console.log('='.repeat(60));
      console.log('\n📖 To use with Swagger UI:');
      console.log('   1. Start server: pnpm start:dev');
      console.log('   2. Open http://localhost:3002/docs');
      console.log('   3. Click "Authorize" button');
      console.log('   4. Paste the token in the JWT field');
      console.log('   5. X-App-ID is pre-set to: com.paymentalert.app');
      console.log('='.repeat(60) + '\n');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
