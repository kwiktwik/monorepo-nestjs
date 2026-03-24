require('dotenv').config({ path: '.env.local' });

const merchantSubscriptionId = 'GW4UAeM3ql';
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



  const baseUrl = env === 'PRODUCTION'
    ? 'https://api.phonepe.com/apis/pg'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  const statusUrl = `${baseUrl}/subscriptions/v2/${merchantSubscriptionId}/status?details=true`;

  const statusRes = await fetch(statusUrl, {
    method: 'GET',
    headers: {
      'Authorization': `O-Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });


  // // Check the Status of the subscription
  // const statusUrl = `${baseUrl}/checkout/v2/subscriptions/${merchantSubscriptionId}/status`;
  // console.log(`\nChecking Status of ${merchantSubscriptionId}...`);

  // const statusRes = await fetch(statusUrl, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `O-Bearer ${token}`,
  //     'Accept': 'application/json'
  //   }
  // });

  console.log('Status Response Code:', statusRes.status);
  console.log('Status Response Body:', await statusRes.text());
}

run().catch(console.error);
