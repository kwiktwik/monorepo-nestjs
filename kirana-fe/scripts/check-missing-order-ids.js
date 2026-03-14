#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Check Missing order_id (razorpay_order_id) Script
 *
 * Reads order_ids from a JSON file (e.g. missing_orders.json), checks each
 * against the database, and saves which ones are still missing to another JSON file.
 *
 * Usage:
 *   node scripts/check-missing-order-ids.js --input scripts/missing_orders.json
 *   node scripts/check-missing-order-ids.js --input scripts/missing_orders.json --output still-missing.json
 *
 * Options:
 *   --input    Path to JSON file with orders (array of { order_id, ... }) [required]
 *   --output   Path to output JSON file (default: missing-order-ids.json in scripts dir)
 *   --help     Show this help message
 *
 * Environment Variables:
 *   DATABASE_URL  PostgreSQL connection string (required)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const BATCH_SIZE = 500;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: path.resolve(__dirname, 'missing_orders.json'),
    output: path.resolve(__dirname, 'missing-order-ids.json'),
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = path.resolve(process.cwd(), args[++i] || 'missing_orders.json');
        break;
      case '--output':
        options.output = path.resolve(process.cwd(), args[++i] || 'missing-order-ids.json');
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
Check Missing order_id (razorpay_order_id) Script
=================================================

Reads orders from a JSON file, checks each order_id against the DB, saves still-missing to JSON.

Usage:
  node scripts/check-missing-order-ids.js --input scripts/missing_orders.json
  node scripts/check-missing-order-ids.js --input scripts/missing_orders.json --output still-missing.json

Options:
  --input    Path to JSON file (array of { order_id, ... }) [default: scripts/missing_orders.json]
  --output   Path to output JSON file (default: scripts/missing-order-ids.json)
  --help     Show this help message

Environment Variables:
  DATABASE_URL  PostgreSQL connection string (required)
`);
}

async function main() {
  const options = parseArgs();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is required');
    process.exit(1);
  }

  if (!fs.existsSync(options.input)) {
    console.error(`❌ Error: Input file not found: ${options.input}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🔍 CHECK MISSING order_id (from file → DB)');
  console.log('='.repeat(50));
  console.log(`   Input:  ${options.input}`);
  console.log(`   Output: ${options.output}`);
  console.log('='.repeat(50));

  const pgClient = new Client({ connectionString: databaseUrl });

  try {
    console.log('\n   📂 Reading input file...');
    const raw = fs.readFileSync(options.input, 'utf8');
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) {
      console.error('❌ Error: Input JSON must be an array of order objects');
      process.exit(1);
    }

    const orderIdToEntry = new Map();
    for (const item of list) {
      const oid = item.order_id || item.razorpay_order_id;
      if (oid && !orderIdToEntry.has(oid)) {
        orderIdToEntry.set(oid, item);
      }
    }
    const uniqueOrderIds = [...orderIdToEntry.keys()];
    console.log(`   ✅ Loaded ${list.length} entries, ${uniqueOrderIds.length} unique order_ids\n`);

    await pgClient.connect();
    console.log('   ✅ Database connected\n');
    console.log('   🔍 Checking each batch against DB...');

    const existingInDb = new Set();
    const totalBatches = Math.ceil(uniqueOrderIds.length / BATCH_SIZE);

    for (let i = 0; i < uniqueOrderIds.length; i += BATCH_SIZE) {
      const batch = uniqueOrderIds.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const placeholders = batch.map((_, idx) => `$${idx + 1}`).join(',');
      const result = await pgClient.query(
        `SELECT razorpay_order_id FROM orders WHERE razorpay_order_id IN (${placeholders})`,
        batch
      );
      result.rows.forEach((r) => existingInDb.add(r.razorpay_order_id));
      process.stdout.write(`\r   Batch ${batchNum}/${totalBatches} (${existingInDb.size} found in DB so far)`);
    }
    console.log('\n');

    const stillMissingIds = uniqueOrderIds.filter((id) => !existingInDb.has(id));
    const stillMissingEntries = stillMissingIds.map((id) => orderIdToEntry.get(id));

    const output = {
      generatedAt: new Date().toISOString(),
      inputFile: options.input,
      totalInFile: list.length,
      uniqueOrderIds: uniqueOrderIds.length,
      foundInDb: existingInDb.size,
      stillMissingCount: stillMissingIds.length,
      stillMissing: stillMissingEntries,
    };

    const outDir = path.dirname(options.output);
    if (outDir !== '.' && !fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(options.output, JSON.stringify(output, null, 2), 'utf8');

    console.log('   📊 Summary:');
    console.log(`      In file (unique): ${uniqueOrderIds.length}`);
    console.log(`      Found in DB:      ${existingInDb.size}`);
    console.log(`      Still missing:    ${stillMissingIds.length}`);
    console.log(`   📁 Saved to: ${options.output}`);
    console.log('='.repeat(50) + '\n');

    if (stillMissingEntries.length > 0 && stillMissingEntries.length <= 10) {
      console.log('Still missing order_ids:');
      stillMissingEntries.forEach((e, i) => console.log(`   ${i + 1}. ${e.order_id || e.razorpay_order_id}`));
    } else if (stillMissingEntries.length > 10) {
      console.log('Sample still missing (first 5):');
      stillMissingEntries.slice(0, 5).forEach((e, i) => console.log(`   ${i + 1}. ${e.order_id || e.razorpay_order_id}`));
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

main();
