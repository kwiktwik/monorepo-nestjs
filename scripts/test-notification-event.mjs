import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

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

const BASE_URL = process.env.SEED_BASE_URL || 'http://localhost:4010';
const APP_ID = process.env.SEED_APP_ID || 'com.paymentalert.app';
const JWT_TOKEN = process.env.SEED_JWT_TOKEN || '';

if (!JWT_TOKEN) {
  console.error('Missing SEED_JWT_TOKEN env var (paste a seeded JWT).');
  process.exit(1);
}

const payload = {
  eventType: 'payment.received',
  payload: {
    amount: 1500,
    currency: 'INR',
    senderName: 'Amit Sharma',
    referenceId: 'UPI-12345',
  },
  channels: ['sms', 'push', 'in_app'],
  metadata: { source: 'test-script', priority: 'high' },
};

async function main() {
  console.log('🔔 Notification Event Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`App ID: ${APP_ID}`);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  console.log('\n➡️  Sending POST /api/event ...');
  const response = await fetch(`${BASE_URL}/api/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': APP_ID,
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  console.log(`⬅️  Response status: ${response.status}`);
  const data = await response.json().catch(() => ({}));
  console.log('Response JSON:', JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error('Test script failed:', err.message);
  process.exit(1);
});
