/**
 * Test database connection - run with: pnpm run db:check
 *
 * Prerequisite: Start rds-tunnel first (SSH tunnel to localhost:5433)
 * Loads .env.local and connects using the same logic as the app.
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
  const connectionString = getConnectionString();
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }, // RDS via SSH tunnel
  });

  try {
    const host = process.env.DATABASE_URL || '?';
    const port = process.env.DB_PORT || '5432';
    console.log(`Connecting to ${host}:${port}...`);
    const client = await pool.connect();
    console.log('Connected.');

    const result = await client.query('SELECT 1 as ok');
    console.log('Query OK:', result.rows[0]);

    const tables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'otp_codes'
    `);
    console.log('otp_codes table exists:', tables.rows.length > 0);

    client.release();
    await pool.end();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    if (err.code) console.error('Code:', err.code);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

main();
