#!/usr/bin/env node
/**
 * Migration script to fix user data inconsistencies
 * - Anonymize emails for soft-deleted users
 * - Remove phone numbers from deleted users
 * - Ensure proper data integrity
 *
 * Run with: node scripts/fix-user-data.mjs
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

// Load .env.local
try {
  const envPath = resolve(process.cwd(), '.env.local');
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
  console.log('⚠️  .env.local not found, using environment variables');
}

const { Pool } = pg;

async function main() {
  console.log('🔧 Starting user data migration...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // 1. Fix deleted users that still have original emails
    console.log('1️⃣ Anonymizing emails for soft-deleted users...');

    const deletedUsersResult = await pool.query(`
      SELECT id, email, "deleted_at" 
      FROM "user" 
      WHERE "is_deleted" = true 
      AND email IS NOT NULL 
      AND email NOT LIKE 'deleted_%'
    `);

    console.log(
      `   Found ${deletedUsersResult.rows.length} deleted users to fix`,
    );

    for (const user of deletedUsersResult.rows) {
      const deletedAt = user.deleted_at || new Date();
      const anonymizedEmail = `deleted_${user.id}_${deletedAt.getTime()}@deleted.local`;

      await pool.query(
        `
        UPDATE "user" 
        SET email = $1, 
            "phoneNumber" = NULL, 
            name = 'Deleted User', 
            image = NULL, 
            "updatedAt" = NOW()
        WHERE id = $2
      `,
        [anonymizedEmail, user.id],
      );

      console.log(
        `   ✓ Fixed user ${user.id}: ${user.email} → ${anonymizedEmail}`,
      );
    }

    // 2. Remove phone numbers from deleted users
    console.log('\n2️⃣ Removing phone numbers from deleted users...');

    const phonesResult = await pool.query(`
      SELECT id, "phoneNumber" 
      FROM "user" 
      WHERE "is_deleted" = true 
      AND "phoneNumber" IS NOT NULL
    `);

    console.log(
      `   Found ${phonesResult.rows.length} deleted users with phone numbers`,
    );

    for (const user of phonesResult.rows) {
      await pool.query(
        `
        UPDATE "user" 
        SET "phoneNumber" = NULL, 
            "updatedAt" = NOW()
        WHERE id = $1
      `,
        [user.id],
      );

      console.log(`   ✓ Cleared phone ${user.phoneNumber} for user ${user.id}`);
    }

    // 3. Check for duplicate emails among active users
    console.log('\n3️⃣ Checking for duplicate emails among active users...');

    const duplicatesResult = await pool.query(`
      SELECT email, COUNT(*) as count
      FROM "user"
      WHERE "is_deleted" = false
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    if (duplicatesResult.rows.length > 0) {
      console.log(
        `   ⚠️  Found ${duplicatesResult.rows.length} duplicate emails:`,
      );
      for (const row of duplicatesResult.rows) {
        console.log(`      - ${row.email}: ${row.count} users`);
      }
      console.log('   Please resolve these manually!');
    } else {
      console.log('   ✓ No duplicate emails found');
    }

    // 4. Check for duplicate phone numbers among active users
    console.log(
      '\n4️⃣ Checking for duplicate phone numbers among active users...',
    );

    const duplicatePhonesResult = await pool.query(`
      SELECT "phoneNumber", COUNT(*) as count
      FROM "user"
      WHERE "is_deleted" = false 
      AND "phoneNumber" IS NOT NULL
      GROUP BY "phoneNumber"
      HAVING COUNT(*) > 1
    `);

    if (duplicatePhonesResult.rows.length > 0) {
      console.log(
        `   ⚠️  Found ${duplicatePhonesResult.rows.length} duplicate phone numbers:`,
      );
      for (const row of duplicatePhonesResult.rows) {
        console.log(`      - ${row.phoneNumber}: ${row.count} users`);
      }
      console.log('   Please resolve these manually!');
    } else {
      console.log('   ✓ No duplicate phone numbers found');
    }

    // 5. Summary
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(
      `   - Fixed ${deletedUsersResult.rows.length} deleted users' emails`,
    );
    console.log(
      `   - Cleared ${phonesResult.rows.length} deleted users' phone numbers`,
    );
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
