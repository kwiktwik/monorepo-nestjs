/**
 * Direct test script to call PhonePe Notify Redemption API
 * Run this from the server where the ENV vars are loaded.
 */

const crypto = require('crypto');

async function testNotifyRedemption() {
  const appId = 'com.kiranaapps.app'; // Or the app you want to test
  const merchantSubscriptionId = 'GW4UAeM3ql';
  const merchantOrderId = 'test_not_' + Math.floor(Math.random() * 1000000);
  const amount = 19900; // 199 INR in paise

  // NOTE: Assuming this runs where ENV vars are present (like PM2 or test runner)
  // Easiest is to run it using NestJS context so config is loaded automatically,
  // but we'll try a raw node fetch if the env vars are available.

  const clientId = process.env.PHONEPE_CLIENT_ID_COM_KIRANAAPPS_APP;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET_COM_KIRANAAPPS_APP;
  const merchantId = process.env.PHONEPE_MERCHANT_ID_COM_KIRANAAPPS_APP || 'PGTESTPAYUAT';

  if (!clientId || !clientSecret) {
    console.error("Missing ENV vars. Run this via 'dotenv node <script>' or inside the Nest container.");
    console.log("Expected: PHONEPE_CLIENT_ID_COM_KIRANAAPPS_APP, PHONEPE_CLIENT_SECRET_COM_KIRANAAPPS_APP");
    return;
  }

  const env = process.env.PHONEPE_ENV_COM_KIRANAAPPS_APP || 'SANDBOX';
  console.log(`Testing against Env: ${env}, MerchantId: ${merchantId}`);

  // 1. Get Token
  const tokenUrl = env === 'PRODUCTION'
    ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';

  console.log('1. Fetching token...');
  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_version: '1',
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body: tokenParams
  });

  if (!tokenRes.ok) {
    console.error("Token fetch failed:", await tokenRes.text());
    return;
  }

  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  console.log(`Token acquired successfully (expires_at: ${tokenData.expires_at})`);

  // 2. Notify Redemption
  const baseUrl = env === 'PRODUCTION'
    ? 'https://api.phonepe.com/apis/pg'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  const notifyUrl = `${baseUrl}/subscriptions/v2/notify`;

  const payload = {
    merchantOrderId,
    amount,
    paymentFlow: {
      type: 'SUBSCRIPTION_CHECKOUT_REDEMPTION',
      merchantSubscriptionId, // or try subscriptionId
      redemptionRetryStrategy: 'STANDARD',
      autoDebit: false
    }
  };

  const notifyRes = await fetch(notifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log(`\n2. Calling Notify URL: ${notifyUrl}`);
  console.log(`Payload: ${JSON.stringify(payload)}`);


  const responseText = await notifyRes.text();
  console.log(`\nResponse Status: ${notifyRes.status} ${notifyRes.statusText}`);
  console.log(`Response Body: ${responseText}`);

  if (notifyRes.ok) {
    console.log('\n✅ SUCCESS! The payload and headers were accepted.');
  } else {
    console.log('\n❌ FAILED! PhonePe rejected the payload or auth.');
  }
}

testNotifyRedemption().catch(console.error);
