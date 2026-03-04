import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

// Load .env.local from backend package root (so it works when run from repo root)
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  const connectionString = getConnectionString();
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }, // RDS via SSH tunnel
  });

  try {
    const client = await pool.connect();
    console.log('Connected to database.');

    while (true) {
      console.log('\n--- User Management CLI ---');
      console.log('1. Delete user subscription');
      console.log('0. Exit');

      const choice = await askQuestion('Select an option: ');

      if (choice === '1') {
        const userId = await askQuestion('Enter User ID to delete subscription: ');
        if (!userId) {
          console.log('User ID cannot be empty.');
          continue;
        }

        try {
          const result = await client.query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);
          console.log(`Deleted ${result.rowCount} subscription(s) for user ID: ${userId}`);
        } catch (err) {
          console.error('Error deleting subscription:', err.message);
        }
      } else if (choice === '0') {
        console.log('Exiting...');
        break;
      } else {
        console.log('Invalid option. Please try again.');
      }
    }

    client.release();
  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    await pool.end();
    rl.close();
  }
}

main();
