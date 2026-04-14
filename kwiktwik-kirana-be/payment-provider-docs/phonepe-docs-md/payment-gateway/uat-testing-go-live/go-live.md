<!-- Source: https://developer.phonepe.com/payment-gateway/uat-testing-go-live/go-live -->

# Go Live Process

After completing your integration, share the **testing URL/App** with the PhonePe Integration Team for a final **sanity check**.
Once the integration is verified in UAT, **UAT Sign-off** will be provided, and **Production credentials** will be shared with you by PhonePe.

Follow the steps below to migrate from UAT to Production and go live:

#### 1. Replace Host URLs

Update the API host endpoints from **UAT** to **Production** as follows:

|  |  |
| --- | --- |
| **APIs** | **Production Host URLs** |
| Auth Token API | https://api.phonepe.com/apis/identity-manager |
| Other APIs (Payment, Status, Refund) | https://api.phonepe.com/apis/pg |

#### 2. Replace Client ID and Secret Key

Use your **Production** credentials:
Replace the **UAT Client ID and Client Secret** with your **Production Client ID and Client Secret** to generate the Production Auth Token.

#### 3: Generate Production Auth Token

Call the **Auth Token API** using your production credentials and use the generated token in all production API calls:

- Payment Initiation
- Order Status
- Refund

## SDK Configuration for Production

#### Android SDK

- Initialize the PhonePe SDK using `PhonePeEnvironment.RELEASE`
- Set `enableLogging` to `false`
- `appId` is optional and can be passed as `null` or `""`

Code Reference

```
val result = PhonePeKt.init(
  context = this,
  merchantId = "MID",
  flowId = "FLOW_ID",
  phonePeEnvironment= PhonePeEnvironment.RELEASE,
  enableLogging = false,
  appId = null 
)
```

#### iOS SDK

- Initialize the PhonePe SDK with environment as `.production`
- Set `enableLogging` to `false`

Code Reference

```
let ppPayment = PPPayment(environment: .production,
                          merchantId: "MERCHANT_ID",
                          enableLogging: false)
```

You are now ready to go live with your PhonePe integration in the Production environment.
With UAT successfully completed and the Production credentials in place, all necessary steps have been covered to ensure a smooth transition.

#### Hybrid SDK

- Initialize the PhonePe SDK init method as below
  - environment as PRODUCTION
  - merchantId with Production MID
- Make sure the enableLogging flag is set to False in Production.

We wish you a successful go-live and continued operational excellence.
**— PhonePe Integration Team**
