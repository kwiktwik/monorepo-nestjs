import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import pg from 'pg';
import { JwtService } from '@nestjs/jwt';

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
const BASE_URL = process.env.SEED_BASE_URL || 'http://localhost:3000';
const APP_ID = 'com.sharekaro.kirana';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';

function getConnectionString() {
  let url = process.env.DATABASE_URL || '';
  if (url && !url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    const host = url;
    const port = process.env.DB_PORT || '5432';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.RDS_PASSWORD || process.env.AWS_RDS_PASSWORD;
    const dbName = process.env.DB_NAME || 'kiranaapps';
    url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;
  }
  return url;
}

const TEST_USERS = [
  { name: 'Alice Orderer', email: 'alice@test.local', phone: '+919900000001' },
  { name: 'Bob Buyer', email: 'bob@test.local', phone: '+919900000002' },
  { name: 'Charlie Customer', email: 'charlie@test.local', phone: '+919900000003' },
];

const EVENT_TYPES = ['order.created', 'purchase.completed', 'payment.failed'];

async function setupUser(client, user, jwtService) {
  const userId = crypto.randomUUID();
  await client.query(
    `INSERT INTO "user" (id, name, email, "emailVerified", "phoneNumber", "phoneNumberVerified", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    [userId, user.name, user.email, true, user.phone, true]
  );
  
  const finalUserId = (await client.query('SELECT id FROM "user" WHERE email = $1', [user.email])).rows[0].id;
  
  await client.query(
    `INSERT INTO user_metadata ("userId", app_id, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT ("userId", app_id) DO NOTHING`,
    [finalUserId, APP_ID]
  );

  return {
    ...user,
    id: finalUserId,
    token: jwtService.sign({ sub: finalUserId, appId: APP_ID })
  };
}

async function main() {
  console.log('🚀 Starting E2E Notification Event Flow Test\n');
  
  const pool = new Pool({ connectionString: getConnectionString(), ssl: { rejectUnauthorized: false } });
  const jwtService = new JwtService({ secret: JWT_SECRET });
  const client = await pool.connect();

  try {
    console.log('👥 Setting up test users...');
    const users = [];
    for (const u of TEST_USERS) {
      const fullUser = await setupUser(client, u, jwtService);
      users.push(fullUser);
      console.log(`   ✅ Created/Verified: ${fullUser.name} (${fullUser.id})`);
    }

    console.log('\n📡 Triggering events via /api/event...');
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const eventType = EVENT_TYPES[i % EVENT_TYPES.length];
      
      const payload = {
        eventType,
        payload: {
          testId: crypto.randomUUID(),
          amount: Math.floor(Math.random() * 5000),
          timestamp: new Date().toISOString()
        },
        channels: ['in_app', 'push'],
        metadata: { source: 'e2e-script' }
      };

      console.log(`\n[User: ${user.name}]`);
      console.log(`➡️  POST /api/event | Type: ${eventType}`);
      
      const res = await fetch(`${BASE_URL}/api/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': APP_ID,
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      console.log(`⬅️  Status: ${res.status} | EventID: ${result.eventId}`);

      // Wait a bit for consumer to process
      await new Promise(r => setTimeout(r, 1000));

      // Verify DB status
      const dbEvent = await client.query(
        'SELECT status, retry_count, processed_at FROM notification_events WHERE id = $1',
        [result.eventId]
      );
      
      if (dbEvent.rows.length > 0) {
        const row = dbEvent.rows[0];
        console.log(`📊 DB Status: ${row.status} | Retries: ${row.retry_count} | ProcessedAt: ${row.processed_at}`);
      } else {
        console.log('❌ Event not found in DB!');
      }
    }

    console.log('\n✨ E2E Test Sequence Completed.');

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
