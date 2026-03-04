import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

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
  let url = process.env.DATABASE_URL || '';
  if (
    url &&
    !url.startsWith('postgresql://') &&
    !url.startsWith('postgres://')
  ) {
    const host = url;
    const port = process.env.DB_PORT || '5432';
    const user = process.env.AWS_RDS_USER || 'postgres';
    const password = process.env.RDS_PASSWORD || process.env.AWS_RDS_PASSWORD;
    const dbName = process.env.DB_NAME || 'kiranaapps';
    if (!password) {
      throw new Error('RDS_PASSWORD or AWS_RDS_PASSWORD required');
    }
    url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;
  }
  return url;
}

const SEED_USER_ID = '2V6MHrAxl4b4nUCWqpzQ2';

const SEED_SQL = `
WITH user_const AS (
  SELECT $1::text AS user_id
),
deleted AS (
  DELETE FROM temp_test_notifications WHERE user_id = $1
)
INSERT INTO temp_test_notifications (user_id, payload, is_processed)
SELECT
  user_const.user_id,
  payload,
  FALSE
FROM user_const
CROSS JOIN (
  VALUES
  ('{"packageName": "com.phonepe.app", "title": "Ved Prakash Yadav has sent ₹1,500 to your bank account", "content": "Money received via UPI", "bigText": "Ved Prakash Yadav has sent ₹1,500 to your bank account Federal Bank-8751", "timestamp": "2026-02-06T10:00:00.000Z"}'::jsonb),
  ('{"packageName": "com.phonepe.app", "title": "Money received", "content": "₹750 credited to your account from Rohan Sharma", "bigText": "Rohan Sharma ne aapko ₹750 bheje", "timestamp": "2026-02-06T10:05:00.000Z"}'::jsonb),
  ('{"packageName": "com.google.android.apps.nbu.paisa.user", "title": "Ankit Verma paid you ₹999.00", "content": "Paid via UPI", "bigText": "Ankit Verma paid you ₹999.00 via UPI", "timestamp": "2026-02-06T10:10:00.000Z"}'::jsonb),
  ('{"packageName": "com.google.android.apps.nbu.paisa.user", "title": "You received ₹250 from Flipkart", "content": "Cashback credited to your bank account", "bigText": "You received ₹250 from Flipkart. Cashback credited to your bank account.", "timestamp": "2026-02-06T10:15:00.000Z"}'::jsonb),
  ('{"packageName": "net.one97.paytm", "title": "Received ₹1,234 from Amazon", "content": "Deposited in your Paytm Payments Bank account", "bigText": "Received ₹1,234 from Amazon\\nDeposited in your Paytm Payments Bank account", "timestamp": "2026-02-06T10:20:00.000Z"}'::jsonb),
  ('{"packageName": "net.one97.paytm", "title": "Rs 500 credited to your Paytm Wallet", "content": "Payment received from Zomato", "bigText": "Rs 500 credited to your Paytm Wallet. Payment received from Zomato.", "timestamp": "2026-02-06T10:25:00.000Z"}'::jsonb),
  ('{"packageName": "in.org.npci.upiapp", "title": "₹800 received from sender@upi", "content": "BHIM UPI payment received", "bigText": "₹800 received from Rajesh Kumar (sender@upi) via BHIM UPI", "timestamp": "2026-02-06T10:30:00.000Z"}'::jsonb),
  ('{"packageName": "in.amazon.mShop.android.shopping", "title": "You received ₹349 from Swiggy", "content": "Payment received via Amazon Pay UPI", "bigText": "You received ₹349 from Swiggy via Amazon Pay UPI", "timestamp": "2026-02-06T10:35:00.000Z"}'::jsonb),
  ('{"packageName": "com.mobikwik_new", "title": "Money Received via UPI", "content": "You have received ₹50.00 from 9654404595@slc", "bigText": "You have received ₹50.00 from 9654404595@slc in your MobiKwik wallet", "timestamp": "2026-02-06T10:40:00.000Z"}'::jsonb),
  ('{"packageName": "com.freecharge.android", "title": "You received ₹120 from PhonePe User", "content": "Freecharge UPI payment received", "bigText": "You received ₹120 from PhonePe User via Freecharge UPI", "timestamp": "2026-02-06T10:45:00.000Z"}'::jsonb),
  ('{"packageName": "com.hdfc.bank.payzapp", "title": "You received ₹999.99 from Ajay Singh", "content": "Payment received via PayZapp UPI", "bigText": "You received ₹999.99 from Ajay Singh via PayZapp", "timestamp": "2026-02-06T10:50:00.000Z"}'::jsonb),
  ('{"packageName": "com.sbi.upi", "title": "₹2,000 credited to your SBI account", "content": "Payment received from Reliance Retail", "bigText": "₹2,000 credited to your SBI account from Reliance Retail via UPI", "timestamp": "2026-02-06T10:55:00.000Z"}'::jsonb),
  ('{"packageName": "com.icicibank.imobile2", "title": "Rs. 1,050 received from Manoj Kumar", "content": "UPI payment received", "bigText": "Rs. 1,050 received from Manoj Kumar via ICICI UPI", "timestamp": "2026-02-06T11:00:00.000Z"}'::jsonb),
  ('{"packageName": "com.axis.mobile", "title": "Payment received", "content": "INR 600 received from BigBasket", "bigText": "Payment received: INR 600 from BigBasket via Axis UPI", "timestamp": "2026-02-06T11:05:00.000Z"}'::jsonb),
  ('{"packageName": "com.snapwork.hdfc", "title": "₹1,999 received from Myntra", "content": "UPI refund credited to your HDFC account", "bigText": "₹1,999 received from Myntra as refund via HDFC UPI", "timestamp": "2026-02-06T11:10:00.000Z"}'::jsonb),
  ('{"packageName": "com.bharatpe.app", "title": "₹300 received from Karan Gupta", "content": "Settlement will be credited shortly", "bigText": "₹300 received from Karan Gupta for UPI payment", "timestamp": "2026-02-06T11:15:00.000Z"}'::jsonb),
  ('{"packageName": "com.myairtelapp", "title": "SADEKUL NADAP: SADEKUL NADAP", "content": "sent ₹30 to you.", "bigText": "SADEKUL NADAP: SADEKUL NADAP sent ₹30 to you via Airtel UPI", "timestamp": "2026-02-06T11:20:00.000Z"}'::jsonb),
  ('{"packageName": "com.phonepe.app", "title": "₹550 aapko mile", "content": "Ravi Kumar ne aapko ₹550 bheje", "bigText": "Ravi Kumar ne aapko ₹550 bheje PhonePe se", "timestamp": "2026-02-06T11:25:00.000Z"}'::jsonb),
  ('{"packageName": "com.google.android.apps.nbu.paisa.user", "title": "Cashback received: ₹15", "content": "You received ₹15 from Google Pay Rewards", "bigText": "You received ₹15 from Google Pay Rewards as cashback", "timestamp": "2026-02-06T11:30:00.000Z"}'::jsonb),
  ('{"packageName": "com.phonepe.app", "title": "Payment received", "content": "₹10,000 received from ACME Corp", "bigText": "₹10,000 received from ACME Corp via PhonePe UPI", "timestamp": "2026-02-06T11:35:00.000Z"}'::jsonb)
) AS v(payload);
`;

const SEED_PARAMS = [SEED_USER_ID];

async function main() {
  const connectionString = getConnectionString();
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query(SEED_SQL, SEED_PARAMS);
    console.log(`Seeded ${result.rowCount ?? 20} row(s) into temp_test_notifications for user ${SEED_USER_ID}.`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
