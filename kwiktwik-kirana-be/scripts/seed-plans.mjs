/**
 * Seed script for the plans table (payment-gateway module)
 *
 * Usage:
 *   node scripts/seed-plans.mjs                          # seed default app
 *   APP_ID=com.sharekaro.kirana node scripts/seed-plans.mjs  # seed specific app
 *   DRY_RUN=true node scripts/seed-plans.mjs              # preview without writing
 *
 * Reads DATABASE_URL from .env.local or environment.
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

// ── Load .env.local ─────────────────────────────────────────────
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

// ── Config ──────────────────────────────────────────────────────
const { Pool } = pg;

function getConnectionString() {
  let url = process.env.DATABASE_URL;
  if (!url) {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.RDS_PASSWORD || process.env.AWS_RDS_PASSWORD || 'postgres';
    const dbName = process.env.DB_NAME || 'kiranaapps';
    url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;
  }
  return url;
}

const APP_ID = process.env.APP_ID || 'com.paymentalert.app';
const DRY_RUN = process.env.DRY_RUN === 'true';

// ── Plans ───────────────────────────────────────────────────────
// Amounts are in paise (1 INR = 100 paise)
const PLANS = [
  {
    id: 'premium_monthly',
    app_id: APP_ID,
    name: 'Premium Monthly',
    description: 'Monthly premium subscription with all features',
    initial_amount: 4900,
    recurring_amount: 4900,
    currency: 'INR',
    frequency: 'MONTHLY',
    total_cycles: null,
    provider_plan_ids: {},
    is_active: true,
    metadata: {},
  },
  {
    id: 'premium_yearly',
    app_id: APP_ID,
    name: 'Premium Yearly',
    description: 'Yearly premium subscription — save over monthly',
    initial_amount: 49900,
    recurring_amount: 49900,
    currency: 'INR',
    frequency: 'YEARLY',
    total_cycles: null,
    provider_plan_ids: {},
    is_active: true,
    metadata: {},
  },
  {
    id: 'premium_quarterly',
    app_id: APP_ID,
    name: 'Premium Quarterly',
    description: 'Quarterly premium subscription',
    initial_amount: 14900,
    recurring_amount: 14900,
    currency: 'INR',
    frequency: 'QUARTERLY',
    total_cycles: null,
    provider_plan_ids: {},
    is_active: true,
    metadata: {},
  },
];

// ── Seed ────────────────────────────────────────────────────────
async function seed() {
  console.log(`\nSeeding plans for app: ${APP_ID}`);
  console.log(`Database: ${getConnectionString().replace(/:[^@]+@/, ':***@')}`);
  if (DRY_RUN) console.log('DRY RUN — no rows will be written\n');

  const pool = new Pool({ connectionString: getConnectionString() });
  const client = await pool.connect();

  try {
    for (const plan of PLANS) {
      console.log(`  ${plan.id} — ${plan.name} (${plan.recurring_amount / 100} ${plan.currency}/${plan.frequency})`);

      if (DRY_RUN) continue;

      await client.query(
        `INSERT INTO plans (
          id, app_id, name, description,
          initial_amount, recurring_amount, currency,
          frequency, total_cycles,
          provider_plan_ids, is_active, metadata,
          created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          initial_amount = EXCLUDED.initial_amount,
          recurring_amount = EXCLUDED.recurring_amount,
          currency = EXCLUDED.currency,
          frequency = EXCLUDED.frequency,
          total_cycles = EXCLUDED.total_cycles,
          provider_plan_ids = EXCLUDED.provider_plan_ids,
          is_active = EXCLUDED.is_active,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()`,
        [
          plan.id,
          plan.app_id,
          plan.name,
          plan.description,
          plan.initial_amount,
          plan.recurring_amount,
          plan.currency,
          plan.frequency,
          plan.total_cycles,
          JSON.stringify(plan.provider_plan_ids),
          plan.is_active,
          JSON.stringify(plan.metadata),
        ],
      );
    }

    const { rows } = await client.query(
      'SELECT id, name, recurring_amount, frequency, is_active FROM plans WHERE app_id = $1 ORDER BY recurring_amount',
      [APP_ID],
    );

    console.log(`\nPlans in DB for ${APP_ID}:`);
    console.table(rows.map(r => ({
      id: r.id,
      name: r.name,
      amount: `${r.recurring_amount / 100} INR`,
      frequency: r.frequency,
      active: r.is_active,
    })));

    console.log('Done.');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
