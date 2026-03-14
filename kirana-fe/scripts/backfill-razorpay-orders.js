#!/usr/bin/env node
/**
 * Razorpay Order Backfill Script
 * 
 * Uses raw SQL queries instead of TypeScript schema for compatibility.
 * 
 * Usage:
 *   node scripts/backfill-razorpay-orders.js --from 2024-01-01 --to 2024-01-31
 *   node scripts/backfill-razorpay-orders.js --from 2024-01-01 --to 2024-01-31 --dry-run
 * 
 * Options:
 *   --from       Start date (YYYY-MM-DD)
 *   --to         End date (YYYY-MM-DD)
 *   --app        App ID to sync orders for (default: com.kiranaapps.app)
 *   --dry-run    Only show what would be synced, don't actually sync
 *   --batch-size Number of orders per batch (default: 20)
 *   --help       Show this help message
 * 
 * Environment Variables:
 *   DATABASE_URL         PostgreSQL connection string (required)
 *   RAZORPAY_KEY_ID      Razorpay API key (required)
 *   RAZORPAY_KEY_SECRET  Razorpay API secret (required)
 */

// Load environment variables from .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Client } = require('pg');
const Razorpay = require('razorpay');

// Configuration
const CONFIG = {
  BATCH_SIZE: 20,
  DELAY_BETWEEN_BATCHES: 2000, // 2 seconds
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 1000, // 1 second
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    from: null,
    to: null,
    app: 'com.kiranaapps.app',
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

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(options.from) || !dateRegex.test(options.to)) {
    console.error('❌ Error: Dates must be in YYYY-MM-DD format');
    process.exit(1);
  }

  const fromDate = new Date(options.from);
  const toDate = new Date(options.to);
  const diffDays = (toDate - fromDate) / (1000 * 60 * 60 * 24);
  
  if (diffDays > 31) {
    console.error('❌ Error: Date range must be 31 days or less');
    process.exit(1);
  }

  if (fromDate > toDate) {
    console.error('❌ Error: From date must be before to date');
    process.exit(1);
  }

  return options;
}

function showHelp() {
  console.log(`
Razorpay Order Backfill Script
==============================

Fetch orders from Razorpay by date range and sync to database.
Handles rate limits (429 errors) with exponential backoff.

Usage:
  node scripts/backfill-razorpay-orders.js --from 2024-01-01 --to 2024-01-31
  node scripts/backfill-razorpay-orders.js --from 2024-01-01 --to 2024-01-31 --dry-run

Options:
  --from         Start date (YYYY-MM-DD) [required]
  --to           End date (YYYY-MM-DD) [required]
  --app          App ID to sync orders for (default: com.kiranaapps.app)
  --dry-run      Only show what would be synced, don't actually sync
  --batch-size   Number of orders per batch (default: 20)
  --help         Show this help message

Environment Variables:
  DATABASE_URL         PostgreSQL connection string (required)
  RAZORPAY_KEY_ID      Razorpay API key (required)
  RAZORPAY_KEY_SECRET  Razorpay API secret (required)

Examples:
  # Sync January 2024 orders for Kirana Apps
  node scripts/backfill-razorpay-orders.js --from 2024-01-01 --to 2024-01-31

  # Sync orders for a different app
  node scripts/backfill-razorpay-orders.js --from 2024-01-01 --to 2024-01-31 --app alertpay-default

  # Dry run to see what would be synced
  node scripts/backfill-razorpay-orders.js --from 2024-01-01 --to 2024-01-31 --dry-run
`);
}

// Sleep utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate ID (similar to nanoid)
function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Check if error is rate limit
function isRateLimitError(error) {
  return error?.statusCode === 429 || 
         error?.error?.code === 'BAD_REQUEST_ERROR' ||
         error?.message?.includes('Too many requests');
}

// Retry wrapper with exponential backoff
async function withRetry(operation, maxRetries = CONFIG.MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!isRateLimitError(error)) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = Math.min(CONFIG.BASE_RETRY_DELAY * Math.pow(2, attempt - 1), 10000);
      const jitter = Math.random() * 500;
      const totalDelay = delay + jitter;
      
      console.log(`  ⚠️  Rate limit (429), retrying ${attempt}/${maxRetries} after ${Math.round(totalDelay)}ms...`);
      await sleep(totalDelay);
    }
  }
  
  throw lastError;
}

// Normalize phone number
function normalizePhoneNumber(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, '');
  
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  return null;
}

// Convert date to UTC timestamp (in seconds for Razorpay API)
function dateToUTCTimestamp(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const utcDate = new Date(Date.UTC(year, month, day));
  return Math.floor(utcDate.getTime() / 1000); // Return seconds (Unix timestamp)
}

// Debug: Convert timestamp back to readable date
function timestampToDate(timestamp) {
  return new Date(timestamp * 1000).toISOString();
}

// Fetch all orders from Razorpay for date range
async function fetchOrdersFromRazorpay(razorpay, fromDate, toDate) {
  console.log(`\n📥 Fetching orders from Razorpay...`);
  console.log(`   Date range: ${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]}`);
  
  // Note: Razorpay API expects timestamps in SECONDS (Unix format)
  const fromTimestamp = dateToUTCTimestamp(fromDate);
  const toTimestamp = dateToUTCTimestamp(toDate) + 86399; // End of day in seconds (23:59:59)
  
  console.log(`   Looking for orders between: ${timestampToDate(fromTimestamp)} and ${timestampToDate(toTimestamp)}`);
  
  const allOrders = [];
  let skip = 0;
  const count = 100;

  while (true) {
    try {
      // Use from/to parameters to let Razorpay filter server-side
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

// Compare with existing orders in DB
async function compareWithExistingOrders(pgClient, razorpayOrders) {
  console.log(`\n🔍 Checking existing orders in database...`);
  
  const razorpayOrderIds = razorpayOrders.map(o => o.id);
  
  // Query existing orders
  const placeholders = razorpayOrderIds.map((_, i) => `$${i + 1}`).join(',');
  const existingResult = await pgClient.query(
    `SELECT razorpay_order_id FROM orders WHERE razorpay_order_id IN (${placeholders})`,
    razorpayOrderIds
  );

  const existingOrderIds = new Set(existingResult.rows.map(r => r.razorpay_order_id));
  
  const missingOrders = razorpayOrders.filter(order => !existingOrderIds.has(order.id));
  
  console.log(`   📊 Total: ${razorpayOrders.length} | Existing: ${existingOrderIds.size} | Missing: ${missingOrders.length}`);
  
  return {
    totalCount: razorpayOrders.length,
    existingCount: existingOrderIds.size,
    missingCount: missingOrders.length,
    missingOrders,
  };
}

// Preload all user data for matching
async function preloadUserData(pgClient) {
  console.log('\n👥 Loading user data from database...');
  
  const result = await pgClient.query(
    'SELECT id, email, "phoneNumber" FROM "user"'
  );

  const usersByEmail = new Map();
  const usersByPhone = new Map();

  for (const u of result.rows) {
    if (u.email) {
      usersByEmail.set(u.email.toLowerCase(), u);
    }
    if (u.phoneNumber) {
      usersByPhone.set(u.phoneNumber, u);
      usersByPhone.set(u.phoneNumber.replace(/\+/g, ''), u);
    }
  }

  console.log(`   ✅ Loaded ${result.rows.length} users`);
  
  return { usersByEmail, usersByPhone };
}

// Sync a single order
async function syncSingleOrder(pgClient, razorpay, rzpOrderId, appId, existingOrderIds, usersByEmail, usersByPhone, dryRun = false) {
  // Check if already exists
  if (existingOrderIds.has(rzpOrderId)) {
    return { razorpayOrderId: rzpOrderId, status: 'skipped', message: 'Already exists in DB' };
  }

  try {
    // Fetch order from Razorpay with retry
    const rzpOrder = await withRetry(() => razorpay.orders.fetch(rzpOrderId));
    
    // Fetch payments with retry
    const payments = await withRetry(() => razorpay.orders.fetchPayments(rzpOrderId));
    const firstPayment = payments.items?.[0];

    // Extract user info
    let email = null;
    let contact = null;
    let customerId = null;
    let paymentId = null;
    let paymentStatus = null;

    if (firstPayment) {
      email = firstPayment.email ? String(firstPayment.email) : null;
      contact = firstPayment.contact ? String(firstPayment.contact) : null;
      customerId = firstPayment.customer_id || null;
      paymentId = firstPayment.id;
      paymentStatus = firstPayment.status;
    }

    // Fallback to notes
    if (!email && !contact && rzpOrder.notes) {
      const notes = rzpOrder.notes;
      email = notes.email || notes.customer_email || null;
      contact = notes.phone || notes.contact || notes.customer_phone || null;
      if (email) email = String(email);
      if (contact) contact = String(contact);
    }

    if (!customerId && rzpOrder.customer_id) {
      customerId = rzpOrder.customer_id;
    }

    // No user info - skip
    if (!email && !contact) {
      return { 
        razorpayOrderId: rzpOrderId, 
        status: 'skipped', 
        message: `No user info (order status: ${rzpOrder.status})` 
      };
    }

    // Find user
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
      return { 
        razorpayOrderId: rzpOrderId, 
        status: 'skipped', 
        message: `User not found: ${email || contact}` 
      };
    }

    if (dryRun) {
      return { razorpayOrderId: rzpOrderId, status: 'success', message: 'Would sync (dry run)' };
    }

    // Determine order status
    let finalStatus = 'created';
    if (paymentStatus === 'authorized') finalStatus = 'authorized';
    else if (paymentStatus === 'captured') finalStatus = 'captured';
    else if (paymentStatus === 'failed') finalStatus = 'failed';
    else if (rzpOrder.status === 'paid') finalStatus = 'captured';

    // Insert order using raw SQL
    const orderId = generateId(10);
    const amount = typeof rzpOrder.amount === 'number' ? rzpOrder.amount : parseInt(String(rzpOrder.amount));
    const currency = rzpOrder.currency || 'INR';
    // Handle notes - convert to JSON string only if it has content
    let notes = null;
    if (rzpOrder.notes && Object.keys(rzpOrder.notes).length > 0) {
      notes = JSON.stringify(rzpOrder.notes);
    }
    const createdAt = new Date(rzpOrder.created_at * 1000);

    await pgClient.query(
      `INSERT INTO orders (
        id, razorpay_order_id, user_id, app_id, customer_id, 
        razorpay_customer_id, amount, currency, status, 
        razorpay_payment_id, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        orderId, rzpOrderId, dbUser.id, appId, dbUser.id,
        customerId, amount, currency, finalStatus,
        paymentId, notes, createdAt, new Date()
      ]
    );

    existingOrderIds.add(rzpOrderId);
    
    return { 
      razorpayOrderId: rzpOrderId, 
      status: 'success', 
      message: firstPayment ? 'Synced successfully' : 'Synced (no payment yet)' 
    };

  } catch (error) {
    if (isRateLimitError(error)) {
      return { 
        razorpayOrderId: rzpOrderId, 
        status: 'error', 
        message: 'Rate limit (429) - too many requests. Retries exhausted.' 
      };
    }
    return { 
      razorpayOrderId: rzpOrderId, 
      status: 'error', 
      message: error.message || 'Unknown error' 
    };
  }
}

// Main sync process
async function syncOrders(pgClient, razorpay, orderIds, appId, existingOrderIds, usersByEmail, usersByPhone, batchSize, dryRun = false) {
  console.log(`\n🚀 Starting sync...`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no database changes)' : 'LIVE'}`);
  console.log(`   Batch size: ${batchSize}`);
  console.log(`   Total orders to sync: ${orderIds.length}\n`);

  const results = [];
  const totalBatches = Math.ceil(orderIds.length / batchSize);

  for (let i = 0; i < orderIds.length; i += batchSize) {
    const batch = orderIds.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    console.log(`Batch ${batchNum}/${totalBatches} (${batch.length} orders)...`);
    
    const batchResults = await Promise.all(
      batch.map(orderId => 
        syncSingleOrder(pgClient, razorpay, orderId, appId, existingOrderIds, usersByEmail, usersByPhone, dryRun)
      )
    );
    
    results.push(...batchResults);

    // Show batch summary
    const batchSuccess = batchResults.filter(r => r.status === 'success').length;
    const batchSkipped = batchResults.filter(r => r.status === 'skipped').length;
    const batchError = batchResults.filter(r => r.status === 'error').length;
    
    console.log(`   ✅ ${batchSuccess} success | ⏭️  ${batchSkipped} skipped | ❌ ${batchError} errors`);

    // Progress bar
    const progress = Math.round((results.length / orderIds.length) * 100);
    const bar = '█'.repeat(Math.round(progress / 5)) + '░'.repeat(20 - Math.round(progress / 5));
    console.log(`   Progress: [${bar}] ${progress}%`);

    // Delay between batches (except last)
    if (i + batchSize < orderIds.length) {
      process.stdout.write(`   Waiting ${CONFIG.DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await sleep(CONFIG.DELAY_BETWEEN_BATCHES);
      process.stdout.write('\r                                                 \r');
    }
  }

  return results;
}

// Print summary
function printSummary(results) {
  const success = results.filter(r => r.status === 'success').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const error = results.filter(r => r.status === 'error').length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Success:     ${success.toString().padStart(4)}`);
  console.log(`⏭️  Skipped:     ${skipped.toString().padStart(4)}`);
  console.log(`❌ Errors:      ${error.toString().padStart(4)}`);
  console.log(`──────────────────────────`);
  console.log(`📦 Total:       ${results.length.toString().padStart(4)}`);
  console.log('='.repeat(60));

  if (error > 0) {
    console.log('\n❌ Errors encountered (showing first 10):');
    results
      .filter(r => r.status === 'error')
      .slice(0, 10)
      .forEach(r => {
        console.log(`   - ${r.razorpayOrderId}: ${r.message}`);
      });
    if (error > 10) {
      console.log(`   ... and ${error - 10} more errors`);
    }
  }
}

// Main function
async function main() {
  const options = parseArgs();
  
  // Check environment variables
  const databaseUrl = process.env.DATABASE_URL;
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is required');
    console.error('   Example: DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"');
    process.exit(1);
  }

  if (!razorpayKeyId || !razorpayKeySecret) {
    console.error('❌ Error: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required');
    process.exit(1);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔄 RAZORPAY ORDER BACKFILL');
  console.log('='.repeat(60));
  console.log(`From:       ${options.from}`);
  console.log(`To:         ${options.to}`);
  console.log(`App:        ${options.app}`);
  console.log(`Mode:       ${options.dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log('='.repeat(60));

  // Initialize database connection
  console.log('\n🔗 Connecting to database...');
  const pgClient = new Client({ connectionString: databaseUrl });
  
  try {
    await pgClient.connect();
    console.log('   ✅ Database connected');

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Fetch orders from Razorpay
    const fromDate = new Date(options.from);
    const toDate = new Date(options.to);
    const razorpayOrders = await fetchOrdersFromRazorpay(razorpay, fromDate, toDate);

    if (razorpayOrders.length === 0) {
      console.log('\n✨ No orders found in Razorpay for this date range.');
      await pgClient.end();
      process.exit(0);
    }

    // Compare with existing
    const { missingOrders, existingCount } = await compareWithExistingOrders(pgClient, razorpayOrders);

    if (missingOrders.length === 0) {
      console.log('\n✨ No missing orders to sync! All orders already in database.');
      await pgClient.end();
      process.exit(0);
    }

    // Confirm before proceeding (unless dry run)
    if (!options.dryRun) {
      console.log(`\n⚠️  About to sync ${missingOrders.length} missing orders to database.`);
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
      await sleep(5000);
    }

    // Preload user data
    const { usersByEmail, usersByPhone } = await preloadUserData(pgClient);
    const existingOrderIds = new Set();

    // Sync orders
    const orderIds = missingOrders.map(o => o.id);
    const results = await syncOrders(
      pgClient, razorpay,
      orderIds, 
      options.app, 
      existingOrderIds, 
      usersByEmail, 
      usersByPhone,
      options.batchSize,
      options.dryRun
    );

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
    await pgClient.end();
  }
}

// Run main
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
