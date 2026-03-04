# PhonePe Integration Guide (Flutter + Backend)

This guide details the end-to-end flow for integrating PhonePe Standard Checkout in your Flutter app using the `kirana-fe` backend.

## Prerequisites

Ensure the following environment variables are set in your backend `.env` (or `.env.local`):

- `PHONEPE_ENV`: `SANDBOX` or `PRODUCTION`
- `PHONEPE_MERCHANT_ID_DEV` / `_PROD`
- `PHONEPE_SALT_KEY_DEV` / `_PROD`
- `PHONEPE_SALT_INDEX_DEV` / `_PROD` (default: 1)

## 1. SDK Initialization

Before starting a transaction, initialize the PhonePe SDK with configuration from the backend.

### Backend Request
**Endpoint:** `POST /api/phonepe`
**Body:**
```json
{
  "action": "get-sdk-config"
}
```

**Response:**
```json
{
  "environment": "SANDBOX", // or "PRODUCTION"
  "merchantId": "PGTESTPAYUAT",
  "flowId": "user_12345",
  "enableLogging": true
}
```

### Flutter Implementation
```dart
// 1. Fetch config from backend
final config = await api.getPhonePeConfig();

// 2. Initialize SDK
bool isInitialized = await PhonePePaymentSdk.init(
  config['environment'],
  config['merchantId'],
  config['flowId'],
  config['enableLogging']
);
```

## 2. Start Transaction

To start a payment flow, create an order on the backend to get a secure token, then pass it to the SDK.

### Backend Request
**Endpoint:** `POST /api/phonepe`
**Body:**
```json
{
  "action": "create-order-token",
  "amount": 100, // Amount in Rupees
  "redirectUrl": "alertpay://payment-callback", // Your app's scheme
  "disablePaymentRetry": false
}
```

**Response:**
```json
{
  "token": "ewo...", // The base64 encoded token required by SDK
  "orderId": "ORD123...", // PhonePe Order ID
  "localOrderId": "order_local_...", // Backend Order ID
  "state": "CREATED"
}
```

### Flutter Implementation
```dart
// 1. Create order on backend
final orderResponse = await api.createPhonePeOrder(amount: 100);
String token = orderResponse['token'];
String appSchema = "alertpay"; // Your iOS URL Scheme (optional for Android)

// 2. Start Transaction
PhonePePaymentSdk.startTransaction(token, appSchema)
  .then((response) => {
    setState(() {
      if (response != null) {
        String status = response['status'].toString();
        String error = response['error'].toString();
        if (status == 'SUCCESS') {
          // Payment Successful on SDK side
          // Proceed to verify on backend
          verifyPayment(orderResponse['localOrderId']); 
        } else {
           // Handle specific error codes
           // "Flow Completed - Status: $status and Error: $error"
        }
      } else {
          // "Flow Incomplete"
      }
    })
  })
  .catchError((error) {
    handleError(error);
  });
```

## 3. Verify Payment Status

Always verify the payment status on the backend server-to-server after the SDK flow completes. Do not rely solely on the app response.

### Backend Request
**Endpoint:** `POST /api/phonepe`
**Body:**
```json
{
  "action": "check-status",
  "merchantOrderId": "order_local_...", // The ID returned in create-order-token
  "type": "mobile" // Important: specify 'mobile' type
}
```

**Response:**
```json
{
  "status": "COMPLETED", // or FAILED, PENDING
  "transactionId": "T123...",
  "amount": 10000 // In paise
}
```

### flutter Implementation
```dart
// ... existing flutter implementation
```

## 4. Advanced Configuration (Optional)

You can customize the payment flow by restricting payment modes (e.g., only UPI, or specific card types) when creating the order.

### Customizing Payment Modes
**Endpoint:** `POST /api/phonepe`
**Action:** `create-order-token`

Add the `paymentFlow` object to your request body:

```json
{
  "action": "create-order-token",
  "amount": 100,
  "redirectUrl": "alertpay://payment-callback",
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "paymentModeConfig": {
      "enabledPaymentModes": [
        { "type": "UPI_INTENT" },
        { "type": "UPI_QR" },
        { "type": "CARD", "cardTypes": ["CREDIT_CARD"] }
      ],
      "disabledPaymentModes": [
        { "type": "NET_BANKING" }
      ]
    }
  }
}
```

**Supported Payment Mode Types:**
- `UPI_INTENT`
- `UPI_COLLECT`
- `UPI_QR`
- `NET_BANKING`
- `CARD` (Supports `cardTypes`: `DEBIT_CARD`, `CREDIT_CARD`)
- `WALLET`
- `PHONEPE_WALLET`

