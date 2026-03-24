#!/usr/bin/env node
/**
 * Razorpay Missing Orders & Subscriptions Sync Script (Multi-DB Support)
 * 
 * Syncs missing orders and subscriptions from Razorpay to the correct database.
 * Automatically determines which database to sync to based on user existence.
 * 
 * Usage:
 *   node scripts/sync-razorpay-missing.js --input scripts/missing_data.json
 *   node scripts/sync-razorpay-missing.js --input scripts/missing_data.json --dry-run
 *   node scripts/sync-razorpay-missing.js --input scripts/missing_data.json --db primary
 * 
 * Input JSON format:
 * {
 *   "orders": ["order_id_1", "order_id_2", ...],
 *   "subscriptions": ["sub_id_1", "sub_id_2", ...]
 * }
 * 
 * Options:
 *   --input       Path to JSON file with order/subscription IDs [required]
 *   --type        Type to sync: 'orders', 'subscriptions', or 'both' (default: both)
 *   --app         App ID to sync for (default: com.kiranaapps.app)
 *   --db          Target database: 'auto', 'primary', 'secondary', or 'both' (default: auto)
 *                 - auto: Check both DBs, sync to where user exists
 *                 - primary: Only sync to primary DB (DATABASE_URL)
 *                 - secondary: Only sync to secondary DB (DATABASE_URL_SECONDARY)
 *                 - both: Sync to both DBs (if user exists in each)
 *   --dry-run     Only show what would be synced, don't actually sync
 *   --batch-size  Number of items per batch (default: 10)
 *   --db-batch    Number of IDs to check in DB at once (default: 500)
 *   --help        Show this help message
 * 
 * Environment Variables:
 *   DATABASE_URL          Primary PostgreSQL connection string (required)
 *   DATABASE_URL_SECONDARY Secondary PostgreSQL connection string (optional)
 *   RAZORPAY_KEY_ID       Razorpay API key (required)
 *   RAZORPAY_KEY_SECRET   Razorpay API secret (required)
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

// Database configurations
const DB_CONFIGS = {
  primary: {
    name: 'Primary',
    envVar: 'DATABASE_URL',
  },
  secondary: {
    name: 'Secondary',
    envVar: 'DATABASE_URL_SECONDARY',
  },
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    type: 'both', // 'orders', 'subscriptions', or 'both'
    app: 'com.kiranaapps.app',
    db: 'auto', // 'auto', 'primary', 'secondary', or 'both'
    dryRun: false,
    batchSize: CONFIG.BATCH_SIZE,
    dbBatch: CONFIG.DB_BATCH_SIZE,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = path.resolve(process.cwd(), args[++i]);
        break;
      case '--type':
        options.type = args[++i];
        if (!['orders', 'subscriptions', 'both'].includes(options.type)) {
          console.error('❌ Error: --type must be orders, subscriptions, or both');
          process.exit(1);
        }
        break;
      case '--app':
        options.app = args[++i];
        break;
      case '--db':
        options.db = args[++i];
        if (!['auto', 'primary', 'secondary', 'both'].includes(options.db)) {
          console.error('❌ Error: --db must be auto, primary, secondary, or both');
          process.exit(1);
        }
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

  if (!options.input) {
    console.error('❌ Error: --input is required');
    showHelp();
    process.exit(1);
  }

  return options;
}

function showHelp() {
  console.log(`
Razorpay Missing Orders & Subscriptions Sync Script (Multi-DB)
===============================================================

Syncs missing orders and subscriptions from Razorpay to the correct database.
Automatically determines which database to sync to based on user existence.

Usage:
  node scripts/sync-razorpay-missing.js --input scripts/missing_data.json
  node scripts/sync-razorpay-missing.js --input scripts/missing_data.json --dry-run
  node scripts/sync-razorpay-missing.js --input scripts/missing_data.json --db primary

Input JSON format:
  {
    "orders": ["order_id_1", "order_id_2", ...],
    "subscriptions": ["sub_id_1", "sub_id_2", ...]
  }

Database Target Options (--db):
  auto      - Check both DBs, sync to where user exists (default)
  primary   - Only sync to primary DB (DATABASE_URL)
  secondary - Only sync to secondary DB (DATABASE_URL_SECONDARY)
  both      - Sync to both DBs (if user exists in each)

Options:
  --input       Path to JSON file with order/subscription IDs [required]
  --type        Type to sync: orders, subscriptions, or both (default: both)
  --app         App ID to sync for (default: com.kiranaapps.app)
  --db          Target database: auto, primary, secondary, or both (default: auto)
  --dry-run     Only show what would be synced, don't actually sync
  --batch-size  Number of items per batch (default: 10)
  --db-batch    Number of IDs to check in DB at once (default: 500)
  --help        Show this help message

Environment Variables:
  DATABASE_URL           Primary PostgreSQL connection string (required)
  DATABASE_URL_SECONDARY Secondary PostgreSQL connection string (optional)
  RAZORPAY_KEY_ID        Razorpay API key (required)
  RAZORPAY_KEY_SECRET    Razorpay API secret (required)
`);
}

// Utility functions
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
      console.log(`  ⚠️  Rate limit hit, retrying ${attempt}/${maxRetries} after ${Math.round(delay)}ms...`);
      await sleep(delay + Math.random() * 500);
    }
  }
  throw lastError;
}

function normalizePhoneNumber(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return null;
}

// Initialize database connections
async function initializeConnections(options) {
  const connections = {};
  const rzpId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

  if (!rzpId || !rzpSecret) {
    throw new Error('Missing Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)');
  }

  // Determine which databases to connect to
  const dbsToConnect = [];
  if (options.db === 'auto' || options.db === 'both' || options.db === 'primary') {
    dbsToConnect.push('primary');
  }
  if ((options.db === 'auto' || options.db === 'both' || options.db === 'secondary') && process.env.DATABASE_URL_SECONDARY) {
    dbsToConnect.push('secondary');
  }

  for (const dbKey of dbsToConnect) {
    const dbConfig = DB_CONFIGS[dbKey];
    const connectionString = process.env[dbConfig.envVar];
    
    if (!connectionString) {
      if (dbKey === 'primary') {
        throw new Error(`Missing ${dbConfig.envVar} environment variable`);
      }
      console.log(`⚠️  ${dbConfig.name} database not configured (missing ${dbConfig.envVar})`);
      continue;
    }

    try {
      const client = new Client({ connectionString });
      await client.connect();
      connections[dbKey] = {
        client,
        name: dbConfig.name,
      };
      console.log(`✅ Connected to ${dbConfig.name} database`);
    } catch (error) {
      console.error(`❌ Failed to connect to ${dbConfig.name} database:`, error.message);
      if (dbKey === 'primary') {
        throw error;
      }
    }
  }

  if (Object.keys(connections).length === 0) {
    throw new Error('No database connections available');
  }

  // Initialize Razorpay
  const razorpay = new Razorpay({ key_id: rzpId, key_secret: rzpSecret });

  return { connections, razorpay };
}

// Load user data from all databases
async function preloadUserDataFromAll(connections) {
  console.log('\n👥 Loading user data from all databases...');
  
  const usersByDb = {};
  
  for (const [dbKey, { client, name }] of Object.entries(connections)) {
    try {
      const result = await client.query('SELECT id, email, "phoneNumber" FROM "user"');
      const usersByEmail = new Map();
      const usersByPhone = new Map();
      
      for (const u of result.rows) {
        if (u.email) usersByEmail.set(u.email.toLowerCase(), u);
        if (u.phoneNumber) {
          usersByPhone.set(u.phoneNumber, u);
          usersByPhone.set(u.phoneNumber.replace(/\+/g, ''), u);
        }
      }
      
      usersByDb[dbKey] = { usersByEmail, usersByPhone, count: result.rows.length, name };
      console.log(`   ✅ ${name}: Loaded ${result.rows.length} users`);
    } catch (error) {
      console.error(`   ❌ ${name}: Failed to load users - ${error.message}`);
      usersByDb[dbKey] = { usersByEmail: new Map(), usersByPhone: new Map(), count: 0, name };
    }
  }
  
  return usersByDb;
}

// Find user across all databases
function findUserAcrossDbs(email, contact, usersByDb) {
  const results = [];
  
  for (const [dbKey, { usersByEmail, usersByPhone, name }] of Object.entries(usersByDb)) {
    let dbUser = null;
    
    if (email) {
      dbUser = usersByEmail.get(email.toLowerCase()) || null;
    }
    
    if (!dbUser && contact) {
      dbUser = usersByPhone.get(contact) || null;
    }
    
    if (!dbUser) {
      const normalizedPhone = normalizePhoneNumber(email) || normalizePhoneNumber(contact);
      if (normalizedPhone) {
        dbUser = usersByPhone.get(normalizedPhone) || usersByPhone.get(normalizedPhone.replace(/\+/g, '')) || null;
      }
    }
    
    if (dbUser) {
      results.push({ dbKey, dbUser, dbName: name });
    }
  }
  
  return results;
}

// Check existing IDs across all databases
async function checkExistingIdsAcrossDbs(connections, ids, table, column) {
  const existingByDb = {};
  
  for (const [dbKey, { client, name }] of Object.entries(connections)) {
    const existing = new Set();
    
    for (let i = 0; i < ids.length; i += CONFIG.DB_BATCH_SIZE) {
      const batch = ids.slice(i, i + CONFIG.DB_BATCH_SIZE);
      const placeholders = batch.map((_, idx) => `$${idx + 1}`).join(',');
      
      try {
        const result = await client.query(
          `SELECT ${column} FROM ${table} WHERE ${column} IN (${placeholders})`,
          batch
        );
        result.rows.forEach(r => existing.add(r[column]));
      } catch (error) {
        console.error(`   ❌ ${name}: Failed to check ${table} - ${error.message}`);
      }
    }
    
    existingByDb[dbKey] = existing;
  }
  
  return existingByDb;
}

// Get all missing IDs across databases
function getMissingIds(ids, existingByDb) {
  const missingByDb = {};
  const allExisting = new Set();
  
  // Collect all existing IDs from all databases
  for (const existing of Object.values(existingByDb)) {
    for (const id of existing) {
      allExisting.add(id);
    }
  }
  
  // Find IDs that don't exist in any database
  const missingIds = ids.filter(id => !allExisting.has(id));
  
  return { missingIds, allExisting };
}

// Sync a single order to a specific database
async function syncSingleOrderToDb(pgClient, razorpay, rzpOrderId, appId, usersByEmail, usersByPhone, dbName, dryRun) {
  try {
    // Fetch order from Razorpay
    const rzpOrder = await withRetry(() => razorpay.orders.fetch(rzpOrderId));
    
    // Fetch payments
    const payments = await withRetry(() => razorpay.orders.fetchPayments(rzpOrderId));
    const firstPayment = payments.items?.[0];

    // Extract user info
    let email = firstPayment?.email || rzpOrder.notes?.email || rzpOrder.notes?.customer_email || null;
    let contact = firstPayment?.contact || rzpOrder.notes?.phone || rzpOrder.notes?.contact || rzpOrder.notes?.customer_phone || null;
    let customerId = firstPayment?.customer_id || rzpOrder.customer_id || null;
    
    if (email) email = String(email);
    if (contact) contact = String(contact);

    if (!email && !contact) {
      return { id: rzpOrderId, type: 'order', status: 'skipped', message: 'No user info', db: dbName };
    }

    // Find user in this specific database
    let dbUser = null;
    
    if (email) {
      dbUser = usersByEmail.get(email.toLowerCase()) || null;
    }
    
    if (!dbUser && contact) {
      dbUser = usersByPhone.get(contact) || null;
    }
    
    if (!dbUser) {
      const normalizedPhone = normalizePhoneNumber(email) || normalizePhoneNumber(contact);
      if (normalizedPhone) {
        dbUser = usersByPhone.get(normalizedPhone) || usersByPhone.get(normalizedPhone.replace(/\+/g, '')) || null;
      }
    }

    if (!dbUser) {
      return { id: rzpOrderId, type: 'order', status: 'skipped', message: `User not found in ${dbName}: ${email || contact}`, db: dbName };
    }

    if (dryRun) {
      return { id: rzpOrderId, type: 'order', status: 'success', message: `Would sync to ${dbName} (dry run)`, db: dbName };
    }

    // Determine order status
    let finalStatus = 'created';
    if (firstPayment?.status === 'authorized') finalStatus = 'authorized';
    else if (firstPayment?.status === 'captured') finalStatus = 'captured';
    else if (firstPayment?.status === 'failed') finalStatus = 'failed';
    else if (rzpOrder.status === 'paid') finalStatus = 'captured';

    // Insert order
    const orderId = generateId(10);
    const amount = Number(rzpOrder.amount);
    const notes = rzpOrder.notes && Object.keys(rzpOrder.notes).length > 0 ? JSON.stringify(rzpOrder.notes) : null;
    const createdAt = new Date(rzpOrder.created_at * 1000);

    await pgClient.query(
      `INSERT INTO orders (id, razorpay_order_id, user_id, app_id, customer_id, razorpay_customer_id, amount, currency, status, razorpay_payment_id, notes, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [orderId, rzpOrderId, dbUser.id, appId, dbUser.id, customerId, amount, rzpOrder.currency || 'INR', finalStatus, firstPayment?.id || null, notes, createdAt, new Date()]
    );
    
    return { id: rzpOrderId, type: 'order', status: 'success', message: `Synced to ${dbName}`, db: dbName };
  } catch (error) {
    return { id: rzpOrderId, type: 'order', status: 'error', message: error.message || 'Unknown error', db: dbName };
  }
}

// Sync a single subscription to a specific database
async function syncSingleSubscriptionToDb(pgClient, razorpay, rzpSubId, appId, usersByEmail, usersByPhone, dbName, dryRun) {
  try {
    // Fetch subscription from Razorpay
    const rzpSub = await withRetry(() => razorpay.subscriptions.fetch(rzpSubId));
    
    // Fetch customer details if available
    let customer = null;
    if (rzpSub.customer_id) {
      try {
        customer = await withRetry(() => razorpay.customers.fetch(rzpSub.customer_id));
      } catch (e) {
        // Customer might be deleted, continue without it
      }
    }

    // Extract user info from customer or notes
    let email = customer?.email || rzpSub.notes?.email || rzpSub.notes?.customer_email || null;
    let contact = customer?.contact || rzpSub.notes?.phone || rzpSub.notes?.contact || rzpSub.notes?.customer_phone || null;
    
    if (email) email = String(email);
    if (contact) contact = String(contact);

    if (!email && !contact) {
      return { id: rzpSubId, type: 'subscription', status: 'skipped', message: 'No user info', db: dbName };
    }

    // Find user in this specific database
    let dbUser = null;
    
    if (email) {
      dbUser = usersByEmail.get(email.toLowerCase()) || null;
    }
    
    if (!dbUser && contact) {
      dbUser = usersByPhone.get(contact) || null;
    }
    
    if (!dbUser) {
      const normalizedPhone = normalizePhoneNumber(email) || normalizePhoneNumber(contact);
      if (normalizedPhone) {
        dbUser = usersByPhone.get(normalizedPhone) || usersByPhone.get(normalizedPhone.replace(/\+/g, '')) || null;
      }
    }

    if (!dbUser) {
      return { id: rzpSubId, type: 'subscription', status: 'skipped', message: `User not found in ${dbName}: ${email || contact}`, db: dbName };
    }

    if (dryRun) {
      return { id: rzpSubId, type: 'subscription', status: 'success', message: `Would sync to ${dbName} (dry run)`, db: dbName };
    }

    // Map Razorpay status to DB status
    const status = rzpSub.status || 'created';
    
    // Insert subscription
    const subId = generateId(10);
    const notes = rzpSub.notes && Object.keys(rzpSub.notes).length > 0 ? JSON.stringify(rzpSub.notes) : null;
    const metadata = {
      razorpay_response: rzpSub,
      synced_at: new Date().toISOString(),
    };

    await pgClient.query(
      `INSERT INTO subscriptions (
        id, razorpay_subscription_id, razorpay_plan_id, user_id, app_id, customer_id, 
        razorpay_customer_id, status, quantity, total_count, paid_count, remaining_count,
        start_at, end_at, charge_at, current_start, current_end, notes, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (razorpay_subscription_id) DO UPDATE SET
        status = EXCLUDED.status,
        paid_count = EXCLUDED.paid_count,
        remaining_count = EXCLUDED.remaining_count,
        start_at = EXCLUDED.start_at,
        end_at = EXCLUDED.end_at,
        charge_at = EXCLUDED.charge_at,
        current_start = EXCLUDED.current_start,
        current_end = EXCLUDED.current_end,
        updated_at = CURRENT_TIMESTAMP`,
      [
        subId, rzpSubId, rzpSub.plan_id, dbUser.id, appId, dbUser.id,
        rzpSub.customer_id, status, rzpSub.quantity || 1, rzpSub.total_count, 
        rzpSub.paid_count || 0, rzpSub.remaining_count,
        rzpSub.start_at ? new Date(rzpSub.start_at * 1000) : null,
        rzpSub.end_at ? new Date(rzpSub.end_at * 1000) : null,
        rzpSub.charge_at ? new Date(rzpSub.charge_at * 1000) : null,
        rzpSub.current_start ? new Date(rzpSub.current_start * 1000) : null,
        rzpSub.current_end ? new Date(rzpSub.current_end * 1000) : null,
        notes, JSON.stringify(metadata), new Date(), new Date()
      ]
    );
    
    return { id: rzpSubId, type: 'subscription', status: 'success', message: `Synced to ${dbName}`, db: dbName };
  } catch (error) {
    return { id: rzpSubId, type: 'subscription', status: 'error', message: error.message || 'Unknown error', db: dbName };
  }
}

// Process a single item (order or subscription)
async function processSingleItem(id, type, connections, usersByDb, razorpay, options) {
  const results = [];
  
  // Fetch from Razorpay first to get user info
  let email = null;
  let contact = null;
  
  try {
    if (type === 'orders') {
      const rzpOrder = await withRetry(() => razorpay.orders.fetch(id));
      const payments = await withRetry(() => razorpay.orders.fetchPayments(id));
      const firstPayment = payments.items?.[0];
      
      email = firstPayment?.email || rzpOrder.notes?.email || rzpOrder.notes?.customer_email || null;
      contact = firstPayment?.contact || rzpOrder.notes?.phone || rzpOrder.notes?.contact || rzpOrder.notes?.customer_phone || null;
    } else {
      const rzpSub = await withRetry(() => razorpay.subscriptions.fetch(id));
      let customer = null;
      if (rzpSub.customer_id) {
        try {
          customer = await withRetry(() => razorpay.customers.fetch(rzpSub.customer_id));
        } catch (e) {}
      }
      
      email = customer?.email || rzpSub.notes?.email || rzpSub.notes?.customer_email || null;
      contact = customer?.contact || rzpSub.notes?.phone || rzpSub.notes?.contact || rzpSub.notes?.customer_phone || null;
    }
    
    if (email) email = String(email);
    if (contact) contact = String(contact);
  } catch (error) {
    return [{ id, type, status: 'error', message: `Failed to fetch from Razorpay: ${error.message}`, db: 'N/A' }];
  }
  
  if (!email && !contact) {
    return [{ id, type, status: 'skipped', message: 'No user info in Razorpay', db: 'N/A' }];
  }
  
  // Find which databases have this user
  const userInDbs = findUserAcrossDbs(email, contact, usersByDb);
  
  if (userInDbs.length === 0) {
    return [{ id, type, status: 'skipped', message: `User not found in any database: ${email || contact}`, db: 'N/A' }];
  }
  
  // Determine which databases to sync to based on --db option
  let targetDbs = [];
  
  if (options.db === 'auto') {
    // Sync to first database where user exists
    targetDbs = [userInDbs[0]];
  } else if (options.db === 'both') {
    // Sync to all databases where user exists
    targetDbs = userInDbs;
  } else if (options.db === 'primary' || options.db === 'secondary') {
    // Sync only to specified database if user exists there
    const specificDb = userInDbs.find(u => u.dbKey === options.db);
    if (specificDb) {
      targetDbs = [specificDb];
    } else {
      return [{ id, type, status: 'skipped', message: `User not found in ${options.db} database`, db: options.db }];
    }
  }
  
  // Sync to target databases
  for (const { dbKey, dbUser, dbName } of targetDbs) {
    const { client } = connections[dbKey];
    const { usersByEmail, usersByPhone } = usersByDb[dbKey];
    
    if (type === 'orders') {
      const result = await syncSingleOrderToDb(client, razorpay, id, options.app, usersByEmail, usersByPhone, dbName, options.dryRun);
      results.push(result);
    } else {
      const result = await syncSingleSubscriptionToDb(client, razorpay, id, options.app, usersByEmail, usersByPhone, dbName, options.dryRun);
      results.push(result);
    }
  }
  
  return results;
}

// Process batches with multi-db support
async function processBatchesMultiDb(ids, type, connections, usersByDb, razorpay, options) {
  const results = [];
  const totalBatches = Math.ceil(ids.length / options.batchSize);

  for (let i = 0; i < ids.length; i += options.batchSize) {
    const batch = ids.slice(i, i + options.batchSize);
    const batchNum = Math.floor(i / options.batchSize) + 1;
    
    console.log(`\n📦 ${type} Batch ${batchNum}/${totalBatches} (${batch.length} items)...`);
    
    // Process each item in the batch
    const batchResults = [];
    for (const id of batch) {
      const itemResults = await processSingleItem(id, type, connections, usersByDb, razorpay, options);
      batchResults.push(...itemResults);
    }
    
    results.push(...batchResults);

    // Show batch summary
    const success = batchResults.filter(r => r.status === 'success').length;
    const skipped = batchResults.filter(r => r.status === 'skipped').length;
    const errors = batchResults.filter(r => r.status === 'error').length;
    
    console.log(`   ✅ ${success} | ⏭️  ${skipped} | ❌ ${errors}`);

    // Progress bar
    const progress = Math.round((i + batch.length) / ids.length * 100);
    const bar = '█'.repeat(Math.round(progress / 5)) + '░'.repeat(20 - Math.round(progress / 5));
    console.log(`   Progress: [${bar}] ${progress}%`);

    // Delay between batches
    if (i + options.batchSize < ids.length) {
      process.stdout.write(`   Waiting ${CONFIG.DELAY_BETWEEN_BATCHES}ms...`);
      await sleep(CONFIG.DELAY_BETWEEN_BATCHES);
      process.stdout.write('\r                                          \r');
    }
  }

  return results;
}

// Print summary by database
function printSummaryByDb(results, type) {
  const byDb = {};
  
  for (const r of results) {
    const db = r.db || 'Unknown';
    if (!byDb[db]) {
      byDb[db] = { success: 0, skipped: 0, errors: 0 };
    }
    byDb[db][r.status]++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 ${type.toUpperCase()} SYNC SUMMARY BY DATABASE`);
  console.log('='.repeat(60));
  
  for (const [db, counts] of Object.entries(byDb)) {
    console.log(`\n${db}:`);
    console.log(`  ✅ Success:  ${counts.success.toString().padStart(4)}`);
    console.log(`  ⏭️  Skipped:  ${counts.skipped.toString().padStart(4)}`);
    console.log(`  ❌ Errors:   ${counts.errors.toString().padStart(4)}`);
  }
  
  const totalSuccess = results.filter(r => r.status === 'success').length;
  const totalSkipped = results.filter(r => r.status === 'skipped').length;
  const totalErrors = results.filter(r => r.status === 'error').length;
  
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📦 Total:      ${results.length.toString().padStart(4)}`);
  console.log(`  ✅ Success:  ${totalSuccess.toString().padStart(4)}`);
  console.log(`  ⏭️  Skipped:  ${totalSkipped.toString().padStart(4)}`);
  console.log(`  ❌ Errors:   ${totalErrors.toString().padStart(4)}`);
  console.log('='.repeat(60));

  if (totalErrors > 0) {
    console.log(`\n❌ Errors encountered (showing first 10):`);
    results
      .filter(r => r.status === 'error')
      .slice(0, 10)
      .forEach(r => {
        console.log(`   - [${r.db}] ${r.id}: ${r.message}`);
      });
    if (totalErrors > 10) {
      console.log(`   ... and ${totalErrors - 10} more errors`);
    }
  }
}

// Main function
async function main() {
  const options = parseArgs();
  
  // Check input file
  if (!fs.existsSync(options.input)) {
    console.error(`❌ Error: Input file not found: ${options.input}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔄 RAZORPAY MISSING ORDERS & SUBSCRIPTIONS SYNC (Multi-DB)');
  console.log('='.repeat(60));
  console.log(`📂 Input:    ${options.input}`);
  console.log(`📋 Type:     ${options.type}`);
  console.log(`📱 App:      ${options.app}`);
  console.log(`🗄️  Database: ${options.db}`);
  console.log(`🔧 Mode:     ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('='.repeat(60));

  // Parse input file
  let orderIds = [];
  let subscriptionIds = [];
  
  try {
    const raw = fs.readFileSync(options.input, 'utf8');
    const data = JSON.parse(raw);
    
    if (Array.isArray(data)) {
      orderIds = data.filter(id => typeof id === 'string');
    } else if (typeof data === 'object') {
      orderIds = (data.orders || []).filter(id => typeof id === 'string');
      subscriptionIds = (data.subscriptions || []).filter(id => typeof id === 'string');
    }
  } catch (error) {
    console.error('❌ Error parsing input file:', error.message);
    process.exit(1);
  }

  // Filter based on type option
  if (options.type === 'orders') {
    subscriptionIds = [];
  } else if (options.type === 'subscriptions') {
    orderIds = [];
  }

  console.log(`\n📊 Found in input file:`);
  console.log(`   Orders: ${orderIds.length}`);
  console.log(`   Subscriptions: ${subscriptionIds.length}`);

  if (orderIds.length === 0 && subscriptionIds.length === 0) {
    console.log('\n✅ Nothing to sync.');
    process.exit(0);
  }

  // Initialize connections
  let connections, razorpay;
  try {
    ({ connections, razorpay } = await initializeConnections(options));
  } catch (error) {
    console.error('\n❌ Failed to initialize:', error.message);
    process.exit(1);
  }

  try {
    // Preload user data from all databases
    const usersByDb = await preloadUserDataFromAll(connections);

    // Check existing orders across all databases
    let existingOrdersByDb = {};
    if (orderIds.length > 0 && options.type !== 'subscriptions') {
      console.log(`\n🔍 Checking existing orders in all databases...`);
      existingOrdersByDb = await checkExistingIdsAcrossDbs(connections, orderIds, 'orders', 'razorpay_order_id');
      const { missingIds, allExisting } = getMissingIds(orderIds, existingOrdersByDb);
      console.log(`   Total: ${orderIds.length} | Existing: ${allExisting.size} | Missing: ${missingIds.length}`);
      orderIds = missingIds;
    }

    // Check existing subscriptions across all databases
    let existingSubsByDb = {};
    if (subscriptionIds.length > 0 && options.type !== 'orders') {
      console.log(`\n🔍 Checking existing subscriptions in all databases...`);
      existingSubsByDb = await checkExistingIdsAcrossDbs(connections, subscriptionIds, 'subscriptions', 'razorpay_subscription_id');
      const { missingIds, allExisting } = getMissingIds(subscriptionIds, existingSubsByDb);
      console.log(`   Total: ${subscriptionIds.length} | Existing: ${allExisting.size} | Missing: ${missingIds.length}`);
      subscriptionIds = missingIds;
    }

    const totalToSync = orderIds.length + subscriptionIds.length;
    if (totalToSync === 0) {
      console.log('\n✅ All items already exist in all databases!');
      await Promise.all(Object.values(connections).map(c => c.client.end()));
      process.exit(0);
    }

    // Confirm before proceeding
    if (!options.dryRun) {
      console.log(`\n⚠️  About to sync ${totalToSync} missing items.`);
      console.log(`   Database mode: ${options.db}`);
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
      await sleep(5000);
    }

    // Sync orders
    let orderResults = [];
    if (orderIds.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('📦 SYNCING ORDERS');
      console.log('='.repeat(60));
      orderResults = await processBatchesMultiDb(orderIds, 'orders', connections, usersByDb, razorpay, options);
    }

    // Sync subscriptions
    let subResults = [];
    if (subscriptionIds.length > 0) {
      if (orderIds.length > 0) console.log('\n');
      console.log('='.repeat(60));
      console.log('🔄 SYNCING SUBSCRIPTIONS');
      console.log('='.repeat(60));
      subResults = await processBatchesMultiDb(subscriptionIds, 'subscriptions', connections, usersByDb, razorpay, options);
    }

    // Print final summaries
    console.log('\n');
    if (orderResults.length > 0) {
      printSummaryByDb(orderResults, 'orders');
    }
    if (subResults.length > 0) {
      if (orderResults.length > 0) console.log('');
      printSummaryByDb(subResults, 'subscriptions');
    }

    console.log('\n✅ Done!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await Promise.all(Object.values(connections).map(c => c.client.end()));
  }
}

// Run main
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
