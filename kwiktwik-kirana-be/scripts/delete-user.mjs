import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

// Load .env.local from backend package root
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
  let userIdInput = process.argv[2];
  const connectionString = getConnectionString();
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment or .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }, // RDS via SSH tunnel
  });

  try {
    const client = await pool.connect();
    console.log('Connected to database.');

    if (!userIdInput) {
      console.log('\n--- User Data Thorough Deletion Tool ---');
      userIdInput = await askQuestion('Enter User ID to delete: ');
    }

    if (!userIdInput) {
      console.log('No User ID provided. Exiting.');
    } else {
      // 1. Fetch user details primarily for email/phone cleanup
      const userRes = await client.query('SELECT name, email, "phoneNumber" FROM "user" WHERE id = $1', [userIdInput]);
      const userExists = userRes.rowCount > 0;
      const userDetails = userExists ? userRes.rows[0] : null;

      if (userExists) {
        console.log(`\nFound User Record: ${userDetails.name} (${userDetails.email})`);
      } else {
        console.log(`\nUser record not found for ID: ${userIdInput}. Checking for orphaned data in other tables...`);
      }
      
      const confirm = await askQuestion(`\nPROCEED WITH CLEANUP FOR ID: ${userIdInput}? \nType "YES" to proceed: `);
      
      if (confirm !== 'YES') {
        console.log('Operation aborted.');
        return;
      }

      console.log('\nStarting thorough deletion...');

      // 2. Delete from tables without cascading Foreign Keys
      
      // Migration logs (Linked by user_id string, not FK)
      process.stdout.write('Checking migration_logs...');
      const migRes = await client.query('DELETE FROM migration_logs WHERE user_id = $1', [userIdInput]);
      console.log(`\rDeleted ${migRes.rowCount} record(s) from migration_logs.`);

      // OTP Codes (linked by phoneNumber - only if user record exists or we have another way to get it)
      if (userDetails?.phoneNumber) {
        process.stdout.write('Checking otp_codes...');
        const otpRes = await client.query('DELETE FROM otp_codes WHERE phone_number = $1', [userDetails.phoneNumber]);
        console.log(`\rDeleted ${otpRes.rowCount} record(s) from otp_codes.`);
      }

      // Verification records (linked by identifier = email or phoneNumber)
      if (userDetails) {
        process.stdout.write('Checking verification identifiers...');
        const identifiers = [userDetails.email];
        if (userDetails.phoneNumber) identifiers.push(userDetails.phoneNumber);
        const verRes = await client.query('DELETE FROM verification WHERE identifier = ANY($1)', [identifiers]);
        console.log(`\rDeleted ${verRes.rowCount} record(s) from verification.`);
      }

      // Conversations created by this user
      process.stdout.write('Checking conversations created by user...');
      const convRes = await client.query('DELETE FROM conversations WHERE created_by = $1', [userIdInput]);
      console.log(`\rDeleted ${convRes.rowCount} conversation(s) created by this user.`);

      // 3. Finally, delete the user (triggers cascade for all remaining tables)
      if (userExists) {
        process.stdout.write(`Deleting user record for ${userIdInput}...`);
        const result = await client.query('DELETE FROM "user" WHERE id = $1', [userIdInput]);
        console.log(`\rSuccessfully deleted user record and all cascaded data.`);
      } else {
        console.log('No user record to delete (already removed). Cleanup complete.');
      }
    }

    client.release();
  } catch (err) {
    console.error('\nError executing deletion:', err.message);
  } finally {
    await pool.end();
    rl.close();
  }
}

main();
