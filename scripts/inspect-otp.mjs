/**
 * Inspect otp_codes table - run with: pnpm run db:inspect-otp [phone]
 *
 * Shows recent OTP records. Pass phone (e.g. +918855966494) to filter.
 * Uses same .env.local and connection as the app.
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
    const password = process.env.AWS_RDS_PASSWORD;
    const dbName = process.env.DB_NAME || 'kiranaapps';
    if (!password) {
      throw new Error('AWS_RDS_PASSWORD required');
    }
    url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;
  }
  return url;
}

async function main() {
  const phoneFilter = process.argv[2]; // e.g. +918855966494
  const connectionString = getConnectionString();
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    const where = phoneFilter
      ? 'WHERE phone_number = $1'
      : '';
    const params = phoneFilter ? [phoneFilter] : [];
    const result = await client.query(
      `SELECT id, phone_number, verified, attempts, created_at, expires_at
       FROM otp_codes ${where}
       ORDER BY created_at DESC
       LIMIT 20`,
      params,
    );
    client.release();
    await pool.end();

    if (result.rows.length === 0) {
      console.log(phoneFilter
        ? `No OTP records found for ${phoneFilter}`
        : 'No OTP records in database');
      console.log('\nTip: Request a new OTP via send-otp, then run this again.');
      process.exit(0);
      return;
    }

    console.log(phoneFilter
      ? `Recent OTPs for ${phoneFilter}:`
      : 'Recent OTPs (all):');
    console.table(result.rows.map((r) => ({
      id: r.id,
      phone_number: r.phone_number,
      verified: r.verified,
      attempts: r.attempts,
      created_at: r.created_at,
      expires_at: r.expires_at,
    })));

    // Helpful hint
    const unverified = result.rows.filter((r) => !r.verified);
    if (phoneFilter && unverified.length === 0 && result.rows.length > 0) {
      console.log('\nAll OTPs for this number are already verified.');
      console.log('Request a NEW OTP via send-otp, then verify within 10 minutes.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

main();
