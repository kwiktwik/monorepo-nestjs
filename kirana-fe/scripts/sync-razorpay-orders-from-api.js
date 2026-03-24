#!/usr/bin/env node
/**
 * Razorpay Order Fetch & Sync Script (Multi-DB)
 * 
 * Fetches orders directly from Razorpay API for a date range,
 * checks both databases, and syncs missing orders to the correct DB.
 * 
 * Usage:
 *   node scripts/sync-razorpay-orders-from-api.js --from 2024-01-01 --to 2024-01-31
 *   node scripts/sync-razorpay-orders-from-api.js --from 2024-01-01 --to 2024-01-31 --dry-run
 *   node scripts/sync-razorpay-orders-from-api.js --from 2024-01-01 --to 2024-01-31 --db auto
 * 
 * Options:
 *   --from        Start date (YYYY-MM-DD) [required]
 *   --to          End date (YYYY-MM-DD) [required]
 *   --db          Target: 'auto', 'primary', 'secondary', or 'both' (default: auto)
 *   --app         App ID filter (optional)
 *   --dry-run     Only show what would be synced, don't actually sync
 *   --batch-size  Number of orders per batch (default: 10)
 *   --help        Show this help message
 * 
 * Environment Variables:
 *   DATABASE_URL           Primary PostgreSQL connection (required)
 *   DATABASE_URL_SECONDARY Secondary PostgreSQL connection (optional)
 *   RAZORPAY_KEY_ID        Razorpay API key (required)
 *   RAZORPAY_KEY_SECRET    Razorpay API secret (required)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Client } = require('pg');
const Razorpay = require('razorpay');

// Configuration
const CONFIG = {
  BATCH_SIZE: 10,
  DELAY_BETWEEN_BATCHES: 2000, // 2 seconds
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 1000,
  RAZORPAY_FETCH_COUNT: 100, // Orders per API call
};

// Database configurations
const DB_CONFIGS = {
  primary: { name: 'Primary', envVar: 'DATABASE_URL' },
  secondary: { name: 'Secondary', envVar: 'DATABASE_URL_SECONDARY' },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    from: null,
    to: null,
    db: 'auto',
    app: null,
    dryRun: false,
    batchSize: CONFIG.BATCH_SIZE,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--from':
        options.from = args[++i];
        break;
      case '--to':
        options.to = args[++i];
        break;
      case '--db':
        options.db = args[++i];
        if (!['auto', 'primary', 'secondary', 'both'].includes(options.db)) {
          console.error('❌ Error: --db must be auto, primary, secondary, or both');
          process.exit(1);
        }
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
      case '--help':
        showHelp();
        process.exit(0);
        break;
    }
  }

  if (!options.from || !options.to) {
    console.error('❌ Error: --from and --to dates are required');
    showHelp();
    process.exit(1);
  }

  // Validate dates
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(options.from) || !dateRegex.test(options.to)) {
    console.error('❌ Error: Dates must be in YYYY-MM-DD format');
    process.exit(1);
  }

  const fromDate = new Date(options.from);
  const toDate = new Date(options.to);
  
  if (fromDate > toDate) {
    console.error('❌ Error: From date must be before to date');
    process.exit(1);
  }

  const diffDays = (toDate - fromDate) / (1000 * 60 * 60 * 24);
  if (diffDays > 31) {
    console.error('❌ Error: Date range must be 31 days or less');
    process.exit(1);
  }

  return options;
}

function showHelp() {
  console.log(`
Razorpay Order Fetch & Sync Script (Multi-DB)
==============================================

Fetches orders directly from Razorpay API and syncs to the correct database.

Usage:
  node scripts/sync-razorpay-orders-from-api.js --from 2024-01-01 --to 2024-01-31
  node scripts/sync-razorpay-orders-from-api.js --from 2024-01-01 --to 2024-01-31 --dry-run
  node scripts/sync-razorpay-orders-from-api.js --from 2024-01-01 --to 2024-01-31 --db auto

Options:
  --from        Start date (YYYY-MM-DD) [required]
  --to          End date (YYYY-MM-DD) [required]
  --db          Target database: auto, primary, secondary, or both (default: auto)
  --app         Filter by App ID (optional)
  --dry-run     Only show what would be synced
  --batch-size  Orders per batch (default: 10)
  --help        Show help

Database Modes (--db):
  auto      - Sync to first DB where user exists (default)
  primary   - Only sync to primary DB
  secondary - Only sync to secondary DB
  both      - Sync to both DBs if user exists in both

Environment Variables:
  DATABASE_URL           Primary DB connection (required)
  DATABASE_URL_SECONDARY Secondary DB connection (optional)
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
      console.log(`  ⚠️  Rate limit hit, retrying ${attempt}/${maxRetries}...`);
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

// Convert date to UTC timestamp (seconds for Razorpay API)
function dateToUTCTimestamp(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const utcDate = new Date(Date.UTC(year, month, day));
  return Math.floor(utcDate.getTime() / 1000);
}

// Initialize database connections
async function initializeConnections(options) {
  const connections = {};
  const rzpId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

  if (!rzpId || !rzpSecret) {
    throw new Error('Missing Razorpay credentials');
  }

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
      console.log(`⚠️  ${dbConfig.name} database not configured`);
      continue;
    }

    try {
      const client = new Client({ connectionString });
      await client.connect();
      connections[dbKey] = { client, name: dbConfig.name };
      console.log(`✅ Connected to ${dbConfig.name} database`);
    } catch (error) {
      console.error(`❌ Failed to connect to ${dbConfig.name}:`, error.message);
      if (dbKey === 'primary') throw error;
    }
  }

  if (Object.keys(connections).length === 0) {
    throw new Error('No database connections available');
  }

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

// Fetch orders from Razorpay API
async function fetchOrdersFromRazorpay(razorpay, fromDate, toDate) {
  console.log(`\n📥 Fetching orders from Razorpay...`);
  console.log(`   Date range: ${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]}`);
  
  const fromTimestamp = dateToUTCTimestamp(fromDate);
  const toTimestamp = dateToUTCTimestamp(toDate) + 86399; // End of day
  
  const allOrders = [];
  let skip = 0;
  const count = CONFIG.RAZORPAY_FETCH_COUNT;

  while (true) {
    try {
      const response = await withRetry(() => 
        razorpay.orders.all({ 
          count, 
          skip,
          from: fromTimestamp,
          to: toTimestamp
        })
      );

      const orders = response.items || [];
      allOrders.push(...orders);
      
      process.stdout.write(`\r   Fetched ${allOrders.length} orders...`);

      if (orders.length < count) {
        break;
      }

      skip += count;
    } catch (error) {
      console.error('\n   ❌ Error fetching orders:', error.message);
      throw error;
    }
  }

  console.log(`\n   ✅ Found ${allOrders.length} orders in date range`);
  return allOrders;
}

// Check existing order IDs across all databases
async function checkExistingOrdersAcrossDbs(connections, orderIds) {
  console.log(`\n🔍 Checking existing orders in all databases...`);
  
  const existingByDb = {};
  const allExisting = new Set();
  
  for (const [dbKey, { client, name }] of Object.entries(connections)) {
    const existing = new Set();
    
    for (let i = 0; i < orderIds.length; i += CONFIG.BATCH_SIZE * 10) {
      const batch = orderIds.slice(i, i + CONFIG.BATCH_SIZE * 10);
      const placeholders = batch.map((_, idx) => `$${idx + 1}`).join(',');
      
      try {
        const result = await client.query(
          `SELECT razorpay_order_id FROM orders WHERE razorpay_order_id IN (${placeholders})`,
          batch
        );
        result.rows.forEach(r => existing.add(r.razorpay_order_id));
      } catch (error) {
        console.error(`   ❌ ${name}: Failed to check orders - ${error.message}`);
      }
    }
    
    existingByDb[dbKey] = existing;
    for (const id of existing) {
      allExisting.add(id);
    }
  }
  
  return { existingByDb, allExisting };
}

// Find user across databases
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

// Sync a single order to specific database
async function syncOrderToDb(client, orderData, appId, usersByEmail, usersByPhone, dbName, dryRun) {
  const { rzpOrder, payments } = orderData;
  const rzpOrderId = rzpOrder.id;
  const firstPayment = payments?.items?.[0];

  try {
    // Extract user info
    let email = firstPayment?.email || rzpOrder.notes?.email || rzpOrder.notes?.customer_email || null;
    let contact = firstPayment?.contact || rzpOrder.notes?.phone || rzpOrder.notes?.contact || rzpOrder.notes?.customer_phone || null;
    let customerId = firstPayment?.customer_id || rzpOrder.customer_id || null;
    
    if (email) email = String(email);
    if (contact) contact = String(contact);

    if (!email && !contact) {
      return { id: rzpOrderId, status: 'skipped', message: 'No user info', db: dbName };
    }

    // Find user in this database
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
      return { id: rzpOrderId, status: 'skipped', message: `User not found in ${dbName}`, db: dbName };
    }

    if (dryRun) {
      return { id: rzpOrderId, status: 'success', message: `Would sync to ${dbName} (dry run)`, db: dbName };
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

    await client.query(
      `INSERT INTO orders (id, razorpay_order_id, user_id, app_id, customer_id, razorpay_customer_id, amount, currency, status, razorpay_payment_id, notes, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [orderId, rzpOrderId, dbUser.id, appId || 'com.kiranaapps.app', dbUser.id, customerId, amount, rzpOrder.currency || 'INR', finalStatus, firstPayment?.id || null, notes, createdAt, new Date()]
    );
    
    return { id: rzpOrderId, status: 'success', message: `Synced to ${dbName}`, db: dbName };
  } catch (error) {
    return { id: rzpOrderId, status: 'error', message: error.message, db: dbName };
  }
}

// Process and sync orders
async function processAndSyncOrders(orders, connections, usersByDb, options) {
  const results = [];
  const razorpay = connections.razorpay;
  
  // Fetch payment details for all orders first
  console.log('\n💳 Fetching payment details for orders...');
  const ordersWithPayments = [];
  
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    process.stdout.write(`\r   Fetching payments ${i + 1}/${orders.length}...`);
    
    try {
      const payments = await withRetry(() => razorpay.orders.fetchPayments(order.id));
      ordersWithPayments.push({ rzpOrder: order, payments });
    } catch (error) {
      console.error(`\n   ⚠️  Failed to fetch payments for ${order.id}:`, error.message);
      ordersWithPayments.push({ rzpOrder: order, payments: { items: [] } });
    }
  }
  console.log('\n   ✅ Payment details fetched');

  // Process in batches
  const totalBatches = Math.ceil(ordersWithPayments.length / options.batchSize);
  
  for (let i = 0; i < ordersWithPayments.length; i += options.batchSize) {
    const batch = ordersWithPayments.slice(i, i + options.batchSize);
    const batchNum = Math.floor(i / options.batchSize) + 1;
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} orders)...`);
    
    for (const orderData of batch) {
      const rzpOrderId = orderData.rzpOrder.id;
      const firstPayment = orderData.payments?.items?.[0];
      
      // Extract user info
      let email = firstPayment?.email || orderData.rzpOrder.notes?.email || null;
      let contact = firstPayment?.contact || orderData.rzpOrder.notes?.phone || null;
      
      if (email) email = String(email);
      if (contact) contact = String(contact);
      
      if (!email && !contact) {
        results.push({ id: rzpOrderId, status: 'skipped', message: 'No user info', db: 'N/A' });
        continue;
      }
      
      // Find user across databases
      const userInDbs = findUserAcrossDbs(email, contact, usersByDb);
      
      if (userInDbs.length === 0) {
        results.push({ id: rzpOrderId, status: 'skipped', message: `User not found in any DB: ${email || contact}`, db: 'N/A' });
        continue;
      }
      
      // Determine target databases
      let targetDbs = [];
      
      if (options.db === 'auto') {
        targetDbs = [userInDbs[0]];
      } else if (options.db === 'both') {
        targetDbs = userInDbs;
      } else if (options.db === 'primary' || options.db === 'secondary') {
        const specificDb = userInDbs.find(u => u.dbKey === options.db);
        if (specificDb) {
          targetDbs = [specificDb];
        } else {
          results.push({ id: rzpOrderId, status: 'skipped', message: `User not found in ${options.db}`, db: options.db });
          continue;
        }
      }
      
      // Sync to target databases
      for (const { dbKey, dbUser } of targetDbs) {
        const { client } = connections[dbKey];
        const { usersByEmail, usersByPhone } = usersByDb[dbKey];
        
        const result = await syncOrderToDb(client, orderData, options.app, usersByEmail, usersByPhone, usersByDb[dbKey].name, options.dryRun);
        results.push(result);
      }
    }

    // Show batch summary
    const batchResults = results.slice(-batch.length * 2); // Approximate
    const success = batchResults.filter(r => r.status === 'success').length;
    const skipped = batchResults.filter(r => r.status === 'skipped').length;
    const errors = batchResults.filter(r => r.status === 'error').length;
    
    console.log(`   ✅ ${success} | ⏭️  ${skipped} | ❌ ${errors}`);

    // Progress bar
    const progress = Math.round((i + batch.length) / ordersWithPayments.length * 100);
    const bar = '█'.repeat(Math.round(progress / 5)) + '░'.repeat(20 - Math.round(progress / 5));
    console.log(`   Progress: [${bar}] ${progress}%`);

    if (i + options.batchSize < ordersWithPayments.length) {
      await sleep(CONFIG.DELAY_BETWEEN_BATCHES);
    }
  }

  return results;
}

// Print summary
function printSummary(results) {
  const byDb = {};
  
  for (const r of results) {
    const db = r.db || 'Unknown';
    if (!byDb[db]) {
      byDb[db] = { success: 0, skipped: 0, errors: 0 };
    }
    byDb[db][r.status]++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SYNC SUMMARY BY DATABASE');
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
    console.log(`\n❌ Errors (showing first 10):`);
    results
      .filter(r => r.status === 'error')
      .slice(0, 10)
      .forEach(r => {
        console.log(`   - [${r.db}] ${r.id}: ${r.message}`);
      });
    if (totalErrors > 10) {
      console.log(`   ... and ${totalErrors - 10} more`);
    }
  }
}

// Main function
async function main() {
  const options = parseArgs();
  
  console.log('\n' + '='.repeat(60));
  console.log('🔄 RAZORPAY ORDER FETCH & SYNC (Multi-DB)');
  console.log('='.repeat(60));
  console.log(`📅 From:     ${options.from}`);
  console.log(`📅 To:       ${options.to}`);
  console.log(`🗄️  DB Mode:  ${options.db}`);
  if (options.app) console.log(`📱 App:      ${options.app}`);
  console.log(`🔧 Mode:     ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('='.repeat(60));

  // Initialize connections
  let connections, razorpay;
  try {
    ({ connections, razorpay } = await initializeConnections(options));
    connections.razorpay = razorpay;
  } catch (error) {
    console.error('\n❌ Failed to initialize:', error.message);
    process.exit(1);
  }

  try {
    // Fetch orders from Razorpay
    const fromDate = new Date(options.from);
    const toDate = new Date(options.to);
    const razorpayOrders = await fetchOrdersFromRazorpay(razorpay, fromDate, toDate);

    if (razorpayOrders.length === 0) {
      console.log('\n✅ No orders found in the specified date range.');
      await Promise.all(Object.values(connections).filter(c => c.client).map(c => c.client.end()));
      process.exit(0);
    }

    // Check existing orders in both databases
    const orderIds = razorpayOrders.map(o => o.id);
    const { existingByDb, allExisting } = await checkExistingOrdersAcrossDbs(connections, orderIds);
    
    const missingOrders = razorpayOrders.filter(o => !allExisting.has(o.id));
    console.log(`   📊 Missing orders: ${missingOrders.length}`);

    if (missingOrders.length === 0) {
      console.log('\n✅ All orders already exist in all databases!');
      await Promise.all(Object.values(connections).filter(c => c.client).map(c => c.client.end()));
      process.exit(0);
    }

    // Preload user data
    const usersByDb = await preloadUserDataFromAll(connections);

    // Confirm before proceeding
    if (!options.dryRun) {
      console.log(`\n⚠️  About to sync ${missingOrders.length} missing orders.`);
      console.log(`   Database mode: ${options.db}`);
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
      await sleep(5000);
    }

    // Process and sync orders
    const results = await processAndSyncOrders(missingOrders, connections, usersByDb, options);

    // Print summary
    printSummary(results);

    console.log('\n✅ Done!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await Promise.all(Object.values(connections).filter(c => c.client).map(c => c.client.end()));
  }
}

// Run main
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
