/**
 * Seed script for the crafto_quotes table
 *
 * Usage:
 *   node scripts/seed-crafto-quotes.mjs /path/to/crafto_quotes_rows.sql
 *   DRY_RUN=true node scripts/seed-crafto-quotes.mjs /path/to/crafto_quotes_rows.sql
 *
 * Reads DATABASE_URL from .env.local or environment.
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

// ── Load .env.local then .env ───────────────────────────────────
for (const envFile of ['.env.local', '.env']) {
  try {
    const envPath = resolve(packageRoot, envFile);
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
    // file optional
  }
}

// ── Config ──────────────────────────────────────────────────────
const { Pool } = pg;

function getConnectionString() {
  let url = process.env.DATABASE_URL;
  if (!url) {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const user = process.env.DB_USER || 'postgres';
    const password =
      process.env.RDS_PASSWORD || process.env.AWS_RDS_PASSWORD || 'postgres';
    const dbName = process.env.DB_NAME || 'kiranaapps';
    url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;
  }
  return url;
}

const DRY_RUN = process.env.DRY_RUN === 'true';
const SQL_FILE = process.argv[2];

if (!SQL_FILE) {
  console.error('Usage: node scripts/seed-crafto-quotes.mjs <path-to-sql-file>');
  process.exit(1);
}

// ── Seed ────────────────────────────────────────────────────────
async function seed() {
  console.log(`\nSeeding crafto_quotes from: ${SQL_FILE}`);
  console.log(
    `Database: ${getConnectionString().replace(/:[^@]+@/, ':***@')}`,
  );
  if (DRY_RUN) {
    console.log('DRY RUN — no rows will be written\n');
    process.exit(0);
  }

  console.log('Reading SQL file...');
  let sql = readFileSync(resolve(SQL_FILE), 'utf8');

  // Add ON CONFLICT to skip duplicates on re-runs
  sql = sql.replace(/;\s*$/, ' ON CONFLICT (id) DO NOTHING;');

  const pool = new Pool({ connectionString: getConnectionString() });
  const client = await pool.connect();

  try {
    const countBefore = await client
      .query('SELECT count(*)::int AS cnt FROM crafto_quotes')
      .then((r) => r.rows[0].cnt);

    console.log(`Rows before: ${countBefore}`);
    console.log('Inserting rows (this may take a minute)...');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    const countAfter = await client
      .query('SELECT count(*)::int AS cnt FROM crafto_quotes')
      .then((r) => r.rows[0].cnt);

    console.log(`Rows after:  ${countAfter}`);
    console.log(`Inserted:    ${countAfter - countBefore} new rows`);
    console.log('Done.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
