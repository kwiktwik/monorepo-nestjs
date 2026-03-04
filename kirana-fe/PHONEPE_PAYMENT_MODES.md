# PhonePe Dynamic Payment Modes

The PhonePe integration now supports **dynamic payment mode configuration** from the backend API. You can specify which payment method to use when creating orders.

## Supported Payment Modes

| Payment Mode | Type | Description | Additional Config |
|-------------|------|-------------|-------------------|
| **UPI Intent** | `UPI_INTENT` | Direct UPI app launch (instant flow) | None |
| **PAY PAGE** | `PAY_PAGE` | Standard PhonePe checkout page chooser | None |
| **UPI Collect** | `UPI_COLLECT` | Request money via UPI | `vpa` or `phoneNumber` |
| **UPI QR** | `UPI_QR` | Generate UPI QR code | None |
| **Card** | `CARD` | Credit/Debit card payments | None |
| **Net Banking** | `NET_BANKING` | Bank transfer | None |

## API Usage

### CREATE_ORDER Action

```json
POST /api/phonepe
{
  "action": "CREATE_ORDER",
  "amount": 100,
  "redirectUrl": "https://yourapp.com/payment/callback",
  "paymentMode": {
    "type": "UPI_INTENT"
  }
}
```

### CREATE_ORDER_WITH_AUTH Action

```json
POST /api/phonepe
{
  "action": "CREATE_ORDER_WITH_AUTH",
  "redirectUrl": "https://yourapp.com/payment/callback",
  "paymentMode": {
    "type": "CARD"
  }
}
```

## Payment Mode Examples

### 1. UPI Intent (Default - Instant Flow)
```json
{
  "paymentMode": {
    "type": "UPI_INTENT"
  }
}
```
- Opens UPI apps directly (Google Pay, PhonePe, Paytm, etc.)
- Fastest checkout experience
- **This is the default if no paymentMode is specified**

### 2. UPI Collect (with VPA)
```json
{
  "paymentMode": {
    "type": "UPI_COLLECT",
    "vpa": "user@paytm"
  }
}
```
- Sends payment request to specified UPI ID
- User approves from their UPI app

### 3. UPI Collect (with Phone Number)
```json
{
  "paymentMode": {
    "type": "UPI_COLLECT",
    "phoneNumber": "9876543210"
  }
}
```
- Sends payment request to phone number linked to UPI

### 4. UPI QR Code
```json
{
  "paymentMode": {
    "type": "UPI_QR"
  }
}
```
- Generates a QR code for payment
- User scans with any UPI app

### 5. Card Payment
```json
{
  "paymentMode": {
    "type": "CARD"
  }
}
```
- Credit/Debit card payment flow
- Supports both card types

### 6. Net Banking
```json
{
  "paymentMode": {
    "type": "NET_BANKING"
  }
}
```
- Bank transfer via net banking

## Response Format

All order creation responses now include the payment mode used:

```json
{
  "orderId": "order_123",
  "phonepeOrderId": "PHONEPE_ORDER_456",
  "token": "eyJhbGc...",
  "paymentMode": {
    "type": "UPI_INTENT"
  }
}
```

## Mobile SDK Integration

When using the PhonePe mobile SDK, pass the token and payment mode to your app:

```typescript
// Backend response
const response = {
  token: "eyJhbGc...",
  merchantId: "M12345",
  paymentMode: { type: "UPI_INTENT" }
};

// Use this token in your mobile app with PhonePe SDK
```

## Default Behavior

If you don't specify a `paymentMode`, the system defaults to **UPI_INTENT** (instant flow), which provides the best user experience for mobile payments.

## Notes

- Payment mode configuration is **optional** - omit it to use the default UPI_INTENT
- For UPI_COLLECT, you must provide either `vpa` or `phoneNumber`
- The actual payment mode used is returned in the response for verification
