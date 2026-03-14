#!/usr/bin/env node
/**
 * Consolidated Razorpay Order Sync Script
 * 
 * Takes a list of order IDs from a JSON file, checks which ones are 
 * missing from the database, fetches their details from Razorpay, 
 * and populates the database.
 * 
 * Usage:
 *   node scripts/sync-razorpay-orders.js --input scripts/missing_orders.json
 *   node scripts/sync-razorpay-orders.js --input scripts/missing_orders.json --dry-run
 * 
 * Options:
 *   --input       Path to JSON file (array of { order_id, ... } or { razorpay_order_id, ... })
 *   --app         App ID to sync orders for (default: com.kiranaapps.app)
 *   --dry-run     Only show what would be synced, don't actually sync
 *   --batch-size  Number of orders per batch for Razorpay (default: 10)
 *   --db-batch    Number of IDs to check in DB at once (default: 500)
 *   --help        Show this help message
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Client } = require('pg');
const Razorpay = require('razorpay');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  BATCH_SIZE: 10,
  DB_BATCH_SIZE: 500,
  DELAY_BETWEEN_BATCHES: 2000, // 2 seconds
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 1000, // 1 second
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: path.resolve(__dirname, 'missing_orders.json'),
    app: 'com.kiranaapps.app',
    dryRun: false,
    batchSize: CONFIG.BATCH_SIZE,
    dbBatch: CONFIG.DB_BATCH_SIZE,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = path.resolve(process.cwd(), args[++i] || 'missing_orders.json');
        break;
      case '--app':
        options.app = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i], 10);
        break;
      case '--db-batch':
        options.dbBatch = parseInt(args[++i], 10);
        break;
      case '--help':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Consolidated Razorpay Order Sync Script
=======================================

Usage:
  node scripts/sync-razorpay-orders.js --input scripts/missing_orders.json
  node scripts/sync-razorpay-orders.js --input scripts/missing_orders.json --dry-run

Options:
  --input       Path to JSON file [default: scripts/missing_orders.json]
  --app         App ID to sync orders for (default: com.kiranaapps.app)
  --dry-run     Only show what would be synced, don't actually sync
  --batch-size  Number of orders per batch for Razorpay (default: 10)
  --db-batch    Number of IDs to check in DB at once (default: 500)
`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function isRateLimitError(error) {
  return error?.statusCode === 429 || 
         error?.error?.code === 'BAD_REQUEST_ERROR' ||
         error?.message?.includes('Too many requests');
}

async function withRetry(operation, maxRetries = CONFIG.MAX_RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === maxRetries) throw error;
      const delay = Math.min(CONFIG.BASE_RETRY_DELAY * Math.pow(2, attempt - 1), 10000);
      await sleep(delay + Math.random() * 500);
    }
  }
  throw lastError;
}

async function preloadUserData(pgClient) {
  console.log('👥 Loading user data...');
  const result = await pgClient.query('SELECT id, email, "phoneNumber" FROM "user"');
  const usersByEmail = new Map();
  const usersByPhone = new Map();
  for (const u of result.rows) {
    if (u.email) usersByEmail.set(u.email.toLowerCase(), u);
    if (u.phoneNumber) {
      usersByPhone.set(u.phoneNumber, u);
      usersByPhone.set(u.phoneNumber.replace(/\+/g, ''), u);
    }
  }
  console.log(`   ✅ Loaded ${result.rows.length} users`);
  return { usersByEmail, usersByPhone };
}

function normalizePhoneNumber(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return null;
}

async function syncSingleOrder(pgClient, razorpay, rzpOrderId, appId, usersByEmail, usersByPhone, dryRun) {
  try {
    const rzpOrder = await withRetry(() => razorpay.orders.fetch(rzpOrderId));
    const payments = await withRetry(() => razorpay.orders.fetchPayments(rzpOrderId));
    const firstPayment = payments.items?.[0];

    let email = firstPayment?.email || rzpOrder.notes?.email || rzpOrder.notes?.customer_email || null;
    let contact = firstPayment?.contact || rzpOrder.notes?.phone || rzpOrder.notes?.contact || rzpOrder.notes?.customer_phone || null;
    let customerId = firstPayment?.customer_id || rzpOrder.customer_id || null;
    
    if (email) email = String(email);
    if (contact) contact = String(contact);

    if (!email && !contact) return { status: 'skipped', message: 'No user info' };

    let dbUser = (email ? usersByEmail.get(email.toLowerCase()) : null) || (contact ? usersByPhone.get(contact) : null);
    if (!dbUser) {
      const norm = normalizePhoneNumber(email) || normalizePhoneNumber(contact);
      if (norm) dbUser = usersByPhone.get(norm) || usersByPhone.get(norm.replace(/\+/g, '')) || null;
    }

    if (!dbUser) return { status: 'skipped', message: 'User not found' };
    if (dryRun) return { status: 'success', message: `Would sync (${dbUser.id})` };

    let finalStatus = 'created';
    if (firstPayment?.status === 'authorized') finalStatus = 'authorized';
    else if (firstPayment?.status === 'captured') finalStatus = 'captured';
    else if (firstPayment?.status === 'failed') finalStatus = 'failed';
    else if (rzpOrder.status === 'paid') finalStatus = 'captured';

    const orderId = generateId(10);
    const amount = Number(rzpOrder.amount);
    const notes = rzpOrder.notes && Object.keys(rzpOrder.notes).length > 0 ? JSON.stringify(rzpOrder.notes) : null;
    const createdAt = new Date(rzpOrder.created_at * 1000);

    await pgClient.query(
      `INSERT INTO orders (id, razorpay_order_id, user_id, app_id, customer_id, razorpay_customer_id, amount, currency, status, razorpay_payment_id, notes, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [orderId, rzpOrderId, dbUser.id, appId, dbUser.id, customerId, amount, rzpOrder.currency || 'INR', finalStatus, firstPayment?.id || null, notes, createdAt, new Date()]
    );
    
    return { status: 'success', message: 'Synced' };
  } catch (e) {
    return { status: 'error', message: e.message };
  }
}

async function main() {
  const options = parseArgs();
  const dbUrl = process.env.DATABASE_URL;
  const rzpId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

  if (!dbUrl || !rzpId || !rzpSecret) {
    console.error('❌ Error: Missing credentials (DATABASE_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)');
    process.exit(1);
  }

  if (!fs.existsSync(options.input)) {
    console.error(`❌ Error: Input file not found: ${options.input}`);
    process.exit(1);
  }

  console.log('\n🔄 CONSOLIDATED RAZORPAY ORDER SYNC');
  console.log(`📂 Input: ${options.input} | Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  const pgClient = new Client({ connectionString: dbUrl });
  try {
    const raw = fs.readFileSync(options.input, 'utf8');
    const list = JSON.parse(raw);
    const entries = Array.isArray(list) ? list : (list.stillMissing || []);
    
    const uniqueIds = [...new Set(entries.map(e => e.order_id || e.razorpay_order_id).filter(id => !!id))];
    console.log(`📋 Found ${uniqueIds.length} unique order IDs in file.`);

    await pgClient.connect();
    console.log('🔗 Database connected.');

    // Step 1: Check existing in DB
    console.log(`🔍 Checking which orders are missing from DB (batches of ${options.dbBatch})...`);
    const existingInDb = new Set();
    for (let i = 0; i < uniqueIds.length; i += options.dbBatch) {
      const batch = uniqueIds.slice(i, i + options.dbBatch);
      const placeholders = batch.map((_, idx) => `$${idx + 1}`).join(',');
      const res = await pgClient.query(`SELECT razorpay_order_id FROM orders WHERE razorpay_order_id IN (${placeholders})`, batch);
      res.rows.forEach(r => existingInDb.add(r.razorpay_order_id));
      process.stdout.write(`\r   Checked ${Math.min(i + options.dbBatch, uniqueIds.length)}/${uniqueIds.length}...`);
    }
    
    const missingIds = uniqueIds.filter(id => !existingInDb.has(id));
    console.log(`\n✨ Total: ${uniqueIds.length} | Existing: ${existingInDb.size} | Missing: ${missingIds.length}`);

    if (missingIds.length === 0) {
      console.log('✅ Nothing to sync.');
      process.exit(0);
    }

    // Step 2: Process missing
    const { usersByEmail, usersByPhone } = await preloadUserData(pgClient);
    const razorpay = new Razorpay({ key_id: rzpId, key_secret: rzpSecret });
    const results = [];

    for (let i = 0; i < missingIds.length; i += options.batchSize) {
      const batch = missingIds.slice(i, i + options.batchSize);
      console.log(`\n📦 Batch ${Math.floor(i/options.batchSize)+1}/${Math.ceil(missingIds.length/options.batchSize)}...`);
      
      const batchRes = await Promise.all(batch.map(id => syncSingleOrder(pgClient, razorpay, id, options.app, usersByEmail, usersByPhone, options.dryRun)));
      results.push(...batchRes);

      const s = batchRes.filter(r => r.status === 'success').length;
      const k = batchRes.filter(r => r.status === 'skipped').length;
      const e = batchRes.filter(r => r.status === 'error').length;
      console.log(`   ✅ ${s} | ⏭️  ${k} | ❌ ${e}`);

      if (i + options.batchSize < missingIds.length) await sleep(CONFIG.DELAY_BETWEEN_BATCHES);
    }

    console.log('\n📊 FINAL SUMMARY:');
    console.log(`   Success: ${results.filter(r => r.status === 'success').length}`);
    console.log(`   Skipped: ${results.filter(r => r.status === 'skipped').length}`);
    console.log(`   Errors:  ${results.filter(r => r.status === 'error').length}`);

  } catch (e) {
    console.error('\n❌ Fatal:', e.message);
  } finally {
    await pgClient.end();
  }
}

main().catch(console.error);
