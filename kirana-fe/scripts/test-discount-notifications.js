#!/usr/bin/env node

/**
 * Test script to trigger discount notifications for specific user IDs.
 * Useful for testing the notification system.
 *
 * Usage:
 *   node scripts/test-discount-notifications.js
 *
 * Loads .env from the project root (kirana-fe). Override with env vars if needed.
 */

const path = require("path");
const fs = require("fs");

// Load .env from project root (parent of scripts/)
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1).replace(/\\(.)/g, "$1");
    } else {
      // Strip inline comment for unquoted values
      const hash = value.indexOf("#");
      if (hash !== -1) value = value.slice(0, hash).trim();
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "test-secret";

// Default test user IDs - replace with actual test user IDs
const DEFAULT_TEST_USER_IDS = ["djKaeUSChGHjYs0HSI8I5"];

const TEST_USER_IDS = process.env.TEST_USER_IDS
  ? process.env.TEST_USER_IDS.split(",").map((id) => id.trim())
  : DEFAULT_TEST_USER_IDS;

const DRY_RUN = process.env.DRY_RUN === "true";

console.log("=".repeat(60));
console.log("🧪 TEST: Discount Notifications");
console.log("=".repeat(60));
console.log(`Users: ${TEST_USER_IDS.join(", ")}`);
console.log(`Dry Run: ${DRY_RUN}`);
console.log(`Base URL: ${BASE_URL}`);
console.log(`CRON_SECRET: ${CRON_SECRET ? "[set]" : "[not set - using default]"}`);
console.log("=".repeat(60));

if (TEST_USER_IDS.length === 0) {
  console.log("\n❌ No test user IDs specified!");
  console.log(
    "Set TEST_USER_IDS environment variable or update DEFAULT_TEST_USER_IDS in this script",
  );
  console.log("\nUsage:");
  console.log(
    '  TEST_USER_IDS="user1,user2" node scripts/test-discount-notifications.js',
  );
  process.exit(1);
}

if (!CRON_SECRET) {
  console.error("\n❌ CRON_SECRET environment variable is not set");
  process.exit(1);
}

async function createTestAbandonedCheckout(userId, appId = "alertpay-android") {
  const endpoint = `${BASE_URL}/api/cron/test-create-checkout`;

  console.log(`\n📝 Creating test abandoned checkout for user: ${userId}`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        appId,
        // Set checkout started 31 minutes ago to make them immediately eligible
        minutesAgo: 31,
      }),
    });

    const data = await response.json();
    console.log(`   Response:`, JSON.stringify(data));

    if (response.ok) {
      console.log(`   ✅ Test abandoned checkout created for ${userId}`);
      return true;
    } else {
      console.log(`   ⚠️  Failed: ${data.error || "Unknown error"}`);
      if (response.status === 401) {
        console.log(`   💡 Tip: Set CRON_SECRET in .env (or pass it). Example: CRON_SECRET=your-secret node scripts/test-discount-notifications.js`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function triggerDiscountNotifications() {
  const endpoint = `${BASE_URL}/api/cron/discount-notifications`;

  console.log(`\n📤 Triggering discount notifications...`);

  try {
    const url = DRY_RUN ? `${endpoint}?dryRun=true` : endpoint;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log(`\n📊 Results:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Total eligible: ${data.total || 0}`);
    console.log(`   Processed: ${data.processed || 0}`);
    console.log(`   Sent: ${data.sent || 0}`);
    console.log(`   Failed: ${data.failed || 0}`);

    if (data.message) {
      console.log(`   Message: ${data.message}`);
    }

    console.log("\n" + "=".repeat(60));

    if (response.ok) {
      console.log("✅ Test completed successfully!");
      process.exit(0);
    } else {
      console.log("❌ Test failed!");
      if (response.status === 401) {
        console.log("💡 Tip: Set CRON_SECRET in .env.");
      }
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  // First, create test abandoned checkouts for each user
  console.log("\n🔧 Setting up test data...");

  for (const userId of TEST_USER_IDS) {
    await createTestAbandonedCheckout(userId);
  }

  // Wait a moment for DB to update
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Then trigger the notifications
  await triggerDiscountNotifications();
}

main();
