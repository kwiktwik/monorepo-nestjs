require('dotenv').config({ path: '.env.local' });

const merchantSubscriptionId = 'GW4UAeM3ql';
const amount = 19900;
const merchantOrderId = 'test_not_' + Math.floor(Math.random() * 1000000);

const clientId = process.env.PHONEPE_CLIENT_ID_COM_KIRANAAPPS_APP;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET_COM_KIRANAAPPS_APP;
const merchantId = process.env.PHONEPE_MERCHANT_ID_COM_KIRANAAPPS_APP;
const env = process.env.PHONEPE_ENV_COM_KIRANAAPPS_APP;

if (!clientId || !clientSecret || !merchantId) {
  console.error("Missing ENV configuration");
  process.exit(1);
}

async function run() {
  console.log(`ENV: ${env}, Merchant: ${merchantId}`);

  // 1. Get Token
  const tokenUrl = env === 'PRODUCTION'
    ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_version: '1',
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })
  });

  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  // 2. Base URL
  const baseUrl = env === 'PRODUCTION'
    ? 'https://api.phonepe.com/apis/pg'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  // ✅ CORRECT API (Autopay)
  const notifyUrl = `${baseUrl}/subscriptions/v2/notify`;

  const payload = {
    merchantOrderId,
    amount,
    paymentFlow: {
      type: 'SUBSCRIPTION_REDEMPTION', // ✅ IMPORTANT FIX
      merchantSubscriptionId,
      redemptionRetryStrategy: 'STANDARD',
      autoDebit: true
    }
  };

  console.log('\nCalling:', notifyUrl);
  console.log('Payload:', payload);

  const notifyRes = await fetch(notifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${token}`, // ✅ correct for this API
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log('Status:', notifyRes.status);
  console.log('Body:', await notifyRes.text());
}

run().catch(console.error);