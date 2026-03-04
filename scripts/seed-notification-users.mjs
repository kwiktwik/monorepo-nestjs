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

function getConnectionString() {
  let url = process.env.DATABASE_URL;

  if (!url) {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const user = process.env.DB_USER || 'postgres';
    const password =
      process.env.RDS_PASSWORD ||
      process.env.AWS_RDS_PASSWORD ||
      'postgres';
    const dbName = process.env.DB_NAME || 'kiranaapps';

    url = `postgresql://${user}:${encodeURIComponent(
      password,
    )}@${host}:${port}/${dbName}`;
  }

  return url;
}

const DEFAULT_APP_ID = process.env.SEED_APP_ID || 'com.sharekaro.kirana';
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';

const USERS = Array.from({ length: 10 }, (_, index) => {
  const suffix = String(index + 1).padStart(2, '0');
  return {
    name: `Notification User ${suffix}`,
    email: `notification.user${suffix}@seed.local`,
    phoneNumber: `+91999999${suffix}00`,
  };
});

async function upsertUser(client, user) {
  const userId = crypto.randomUUID();
  const now = new Date();

  const result = await client.query(
    `INSERT INTO "user" (
      "id",
      "name",
      "email",
      "emailVerified",
      "phoneNumber",
      "phoneNumberVerified",
      "createdAt",
      "updatedAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT ("email") DO UPDATE SET
      "name" = EXCLUDED."name",
      "phoneNumber" = EXCLUDED."phoneNumber",
      "phoneNumberVerified" = EXCLUDED."phoneNumberVerified",
      "updatedAt" = EXCLUDED."updatedAt"
    RETURNING "id";`,
    [
      userId,
      user.name,
      user.email,
      true,
      user.phoneNumber,
      true,
      now,
      now,
    ],
  );

  return result.rows[0].id;
}

async function upsertUserMetadata(client, userId, appId) {
  await client.query(
    `INSERT INTO "user_metadata" ("userId", "app_id", "created_at", "updated_at")
     VALUES ($1, $2, NOW(), NOW())
     ON CONFLICT ("userId", "app_id") DO UPDATE SET "updated_at" = NOW();`,
    [userId, appId],
  );
}

async function resetSessions(client, userId, appId) {
  await client.query(
    `DELETE FROM "session" WHERE "userId" = $1 AND "appId" = $2;`,
    [userId, appId],
  );
}

async function insertSession(client, userId, appId) {
  const sessionId = crypto.randomUUID();
  const token = crypto.randomUUID().replace(/-/g, '');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await client.query(
    `INSERT INTO "session" (
      "id",
      "expiresAt",
      "token",
      "createdAt",
      "updatedAt",
      "ipAddress",
      "userAgent",
      "userId",
      "appId"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
    [
      sessionId,
      expiresAt,
      token,
      now,
      now,
      '127.0.0.1',
      'seed-script',
      userId,
      appId,
    ],
  );
}

async function main() {
  const connectionString = getConnectionString();
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  });

  const jwtService = new JwtService({ secret: JWT_SECRET });

  try {
    const client = await pool.connect();
    const seeded = [];

    for (const user of USERS) {
      const userId = await upsertUser(client, user);
      await upsertUserMetadata(client, userId, DEFAULT_APP_ID);
      await resetSessions(client, userId, DEFAULT_APP_ID);
      await insertSession(client, userId, DEFAULT_APP_ID);

      const token = jwtService.sign({ sub: userId, appId: DEFAULT_APP_ID });
      seeded.push({ ...user, userId, token });
    }

    console.log('Seeded notification users:');
    for (const entry of seeded) {
      console.log(
        `- ${entry.name} | ${entry.email} | ${entry.phoneNumber} | userId=${entry.userId}`,
      );
      console.log(`  JWT: ${entry.token}`);
    }

    console.log(
      `\nApp ID used: ${DEFAULT_APP_ID}\nJWT Secret: ${JWT_SECRET}\n`,
    );
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
