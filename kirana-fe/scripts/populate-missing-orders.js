#!/usr/bin/env node
/**
 * Populate Missing Razorpay Orders Script
 * 
 * Reads missing order IDs from a JSON file (e.g., missing-order-ids.json),
 * fetches the full order and payment details from Razorpay, and inserts
 * them into the database if they are missing.
 * 
 * Usage:
 *   node scripts/populate-missing-orders.js --input scripts/missing-order-ids.json
 *   node scripts/populate-missing-orders.js --input scripts/missing-order-ids.json --dry-run
 * 
 * Options:
 *   --input       Path to JSON file with missing orders (from check-missing-order-ids.js)
 *   --app         App ID to sync orders for (default: com.kiranaapps.app)
 *   --dry-run     Only show what would be synced, don't actually sync
 *   --batch-size  Number of orders per batch (default: 10)
 *   --help        Show this help message
 * 
 * Environment Variables:
 *   DATABASE_URL         PostgreSQL connection string (required)
 *   RAZORPAY_KEY_ID      Razorpay API key (required)
 *   RAZORPAY_KEY_SECRET  Razorpay API secret (required)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Client } = require('pg');
const Razorpay = require('razorpay');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  BATCH_SIZE: 10,
  DELAY_BETWEEN_BATCHES: 2000, // 2 seconds
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 1000, // 1 second
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: path.resolve(__dirname, 'missing-order-ids.json'),
    app: 'com.kiranaapps.app',
    dryRun: false,
    batchSize: CONFIG.BATCH_SIZE,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = path.resolve(process.cwd(), args[++i] || 'missing-order-ids.json');
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

  return options;
}

function showHelp() {
  console.log(`
Populate Missing Razorpay Orders Script
=======================================

Reads missing order IDs from a JSON file, fetches details from Razorpay, and syncs to DB.

Usage:
  node scripts/populate-missing-orders.js --input scripts/missing-order-ids.json
  node scripts/populate-missing-orders.js --input scripts/missing-order-ids.json --dry-run

Options:
  --input       Path to JSON file (output from check-missing-order-ids.js) [default: scripts/missing-order-ids.json]
  --app         App ID to sync orders for (default: com.kiranaapps.app)
  --dry-run     Only show what would be synced, don't actually sync
  --batch-size  Number of orders per batch (default: 10)
  --help        Show this help message

Environment Variables:
  DATABASE_URL         PostgreSQL connection string (required)
  RAZORPAY_KEY_ID      Razorpay API key (required)
  RAZORPAY_KEY_SECRET  Razorpay API secret (required)
`);
}

// Sleep utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate ID (similar to nanoid or what is used in backfill script)
function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to check if error is rate limit
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
      
      console.log(`  ⚠️  Rate limit (429) hit, retrying ${attempt}/${maxRetries} after ${Math.round(totalDelay)}ms...`);
      await sleep(totalDelay);
    }
  }
  
  throw lastError;
}

// Normalize phone number (from backfill script)
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

// Preload user data for matching (from backfill script)
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

// Sync a single order (based on syncSingleOrder in backfill script)
async function syncSingleOrder(pgClient, razorpay, rzpOrderId, appId, usersByEmail, usersByPhone, dryRun = false) {
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
        message: `User not found in DB: ${email || contact}` 
      };
    }

    if (dryRun) {
      return { razorpayOrderId: rzpOrderId, status: 'success', message: `Would sync (User: ${dbUser.id})` };
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
    
    let notesStr = null;
    if (rzpOrder.notes && Object.keys(rzpOrder.notes).length > 0) {
      notesStr = JSON.stringify(rzpOrder.notes);
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
        paymentId, notesStr, createdAt, new Date()
      ]
    );
    
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
        message: 'Rate limit (429) hit and retries exhausted.' 
      };
    }
    return { 
      razorpayOrderId: rzpOrderId, 
      status: 'error', 
      message: error.message || 'Unknown error during order sync' 
    };
  }
}

async function main() {
  const options = parseArgs();

  // Validate environment variables
  const databaseUrl = process.env.DATABASE_URL;
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!databaseUrl || !razorpayKeyId || !razorpayKeySecret) {
    console.error('❌ Error: DATABASE_URL, RAZORPAY_KEY_ID, and RAZORPAY_KEY_SECRET are required.');
    process.exit(1);
  }

  if (!fs.existsSync(options.input)) {
    console.error(`❌ Error: Input file not found: ${options.input}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔄 POPULATING MISSING ORDERS FROM RAZORPAY');
  console.log('='.repeat(60));
  console.log(`   Input file: ${options.input}`);
  console.log(`   App ID:     ${options.app}`);
  console.log(`   Mode:       ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Batch Size: ${options.batchSize}`);
  console.log('='.repeat(60));

  const pgClient = new Client({ connectionString: databaseUrl });
  
  try {
    // Load missing orders from file
    const rawData = fs.readFileSync(options.input, 'utf8');
    const data = JSON.parse(rawData);
    const missingEntries = data.stillMissing || [];
    
    if (missingEntries.length === 0) {
      console.log('\n✨ No missing orders found in the input file.');
      process.exit(0);
    }

    console.log(`\n📂 Found ${missingEntries.length} missing orders to process.`);

    await pgClient.connect();
    console.log('🔗 Database connected');

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const { usersByEmail, usersByPhone } = await preloadUserData(pgClient);
    
    const results = [];
    const totalBatches = Math.ceil(missingEntries.length / options.batchSize);

    for (let i = 0; i < missingEntries.length; i += options.batchSize) {
      const batch = missingEntries.slice(i, i + options.batchSize);
      const batchNum = Math.floor(i / options.batchSize) + 1;
      
      console.log(`\nProcessing Batch ${batchNum}/${totalBatches} (${batch.length} orders)...`);
      
      const batchResults = await Promise.all(
        batch.map(entry => {
          const rzpOrderId = entry.order_id || entry.razorpay_order_id;
          if (!rzpOrderId) return Promise.resolve({ status: 'skipped', message: 'No order ID in entry' });
          return syncSingleOrder(pgClient, razorpay, rzpOrderId, options.app, usersByEmail, usersByPhone, options.dryRun);
        })
      );
      
      results.push(...batchResults);

      // Summary for this batch
      const successCount = batchResults.filter(r => r.status === 'success').length;
      const skippedCount = batchResults.filter(r => r.status === 'skipped').length;
      const errorCount = batchResults.filter(r => r.status === 'error').length;
      console.log(`   ✅ ${successCount} success | ⏭️  ${skippedCount} skipped | ❌ ${errorCount} errors`);

      // Progress indication
      const progress = Math.round((results.length / missingEntries.length) * 100);
      const bar = '█'.repeat(Math.round(progress / 5)) + '░'.repeat(20 - Math.round(progress / 5));
      console.log(`   Progress: [${bar}] ${progress}%`);

      if (i + options.batchSize < missingEntries.length) {
        process.stdout.write(`   Waiting ${CONFIG.DELAY_BETWEEN_BATCHES}ms for rate limiting...`);
        await sleep(CONFIG.DELAY_BETWEEN_BATCHES);
        process.stdout.write('\r                                                     \r');
      }
    }

    // Final summary
    const totalSuccess = results.filter(r => r.status === 'success').length;
    const totalSkipped = results.filter(r => r.status === 'skipped').length;
    const totalError = results.filter(r => r.status === 'error').length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 OVERALL SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`   ✅ Success:  ${totalSuccess}`);
    console.log(`   ⏭️  Skipped:  ${totalSkipped}`);
    console.log(`   ❌ Errors:   ${totalError}`);
    console.log(`   📦 Total:    ${results.length}`);
    console.log('='.repeat(60));

    if (totalError > 0) {
      console.log('\n❌ Top 10 Errors:');
      results.filter(r => r.status === 'error').slice(0, 10).forEach(r => {
        console.log(`   - ${r.razorpayOrderId}: ${r.message}`);
      });
    }

    console.log('\n✅ Task completed.');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
