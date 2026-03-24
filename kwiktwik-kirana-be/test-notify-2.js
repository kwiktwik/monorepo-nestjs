require('dotenv').config({ path: '.env.local' });

const merchantSubscriptionId = 'GW4UAeM3ql';
const amount = 19900;
const merchantOrderId = 'test_not_' + Math.floor(Math.random() * 1000000);

const clientId = process.env.PHONEPE_CLIENT_ID_COM_KIRANAAPPS_APP;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET_COM_KIRANAAPPS_APP;
const merchantId = process.env.PHONEPE_MERCHANT_ID_COM_KIRANAAPPS_APP;
const env = process.env.PHONEPE_ENV_COM_KIRANAAPPS_APP; // EXPECTED: PRODUCTION

if (!clientId || !clientSecret || !merchantId) {
  console.error("Missing ENV configuration for COM_KIRANAAPPS_APP in .env file");
  process.exit(1);
}

async function run() {
  console.log(`ENV: ${env}, Merchant: ${merchantId}`);
  
  const tokenUrl = env === 'PRODUCTION'
    ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';

  console.log('1. Fetching token for', clientId);
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
  
  if (!tokenRes.ok) {
    console.error('Token fetch failed:', await tokenRes.text());
    return;
  }
  
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  console.log('Token success, expires_at:', tokenData.expires_at);

  const baseUrl = env === 'PRODUCTION'
    ? 'https://api.phonepe.com/apis/pg'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    
  const notifyUrl = `${baseUrl}/checkout/v2/subscriptions/notify`;
  
  const payload = {
    merchantOrderId,
    amount,
    paymentFlow: {
      type: 'SUBSCRIPTION_CHECKOUT_REDEMPTION',
      merchantSubscriptionId,
      redemptionRetryStrategy: 'STANDARD',
      autoDebit: false
    }
  };
  
  console.log('\n2. Calling Notify URL:', notifyUrl);
  console.log('Headers:', { 'Authorization': 'O-Bearer [HIDDEN]', 'X-MERCHANT-ID': merchantId });
  console.log('Payload:', JSON.stringify(payload, null, 2));

  const notifyRes = await fetch(notifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${token}`,
      'X-MERCHANT-ID': merchantId,
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  console.log('\nResponse Status:', notifyRes.status, notifyRes.statusText);
  console.log('Response Body:', await notifyRes.text());
}

run().catch(console.error);
