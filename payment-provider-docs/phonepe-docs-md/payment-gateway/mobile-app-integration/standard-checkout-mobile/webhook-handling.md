<!-- Source: https://developer.phonepe.com/payment-gateway/mobile-app-integration/standard-checkout-mobile/webhook-handling -->

# Webhook Handling

---

PhonePe Payment Gateway uses Webhook (S2S Callbacks) to notify you about key events like payment completion or refund status. Here’s how it works:

- You need to provide a Webhook URL (a specific endpoint on your server) where these updates will be sent.
- To ensure secure communication, you should set up a **username** and **password** for authentication.

## Webhook Setup

- **Configure Webhook**: Follow these steps to set up a new webhook for receiving event notifications.
  - Log in to your [PhonePe Business Dashboard](https://business.phonepe.com/dashboard).
  - Set the environment mode using the **Test Mode** toggle located on the dashboard.
    - For `Sandbox` (Testing): Ensure the toggle is switched **ON**.
    - For `Production` (Live): Ensure the toggle is switched **OFF**.
  - Navigate to Developer Settings from the side menu.
  - Select the Webhook tab and click the Create Webhook button.
  - In the configuration form, fill in the following details:
    - Webhook URL: Your server’s endpoint URL to receive notifications.
    - Username: Your authentication username.
    - Password: Your authentication password.
    - Description: A brief description for your reference.
  - From the list of active events, choose:
    - **Order Events**:
      - `checkout.order.completed`: Sent when an order is successfully completed
      - `checkout.order.failed`: Sent when an order fails
    - **Refund Events**:
      - `pg.refund.completed`: Sent when a refund is successfully processed
      - `pg.refund.failed`: Sent when a refund processing fails
  - Click Create to save and complete the configuration.
  - Your webhook is now active.

- **Authorization**.
  - Once configured, PhonePe Payment Gateway will send updates to your server using the provided username and password.
  - These credentials will be used to create an **Authorization** header in the webhook response using **SHA256** (username:password) method.

- **Verification**.
  - For the incoming request, extract the header Authorization, verify it with the one which you have shared with us and accept the response if the Username and password match.
  - If the hash matches the one sent by PhonePe Payment Gateway, the update is valid, and the response payload can be consumed.
  - If it doesn’t match, the response should be ignored.

ℹ️ **Authorization Header!**

---

PhonePe Payment Gateway includes the Authorization header in the following format:
Authorization: SHA256(username:password)

## Callback Validation/Verification

- For the incoming request, extract the basic authorization header “Authorization”, verify it with the one which you have shared with us and accept the response if Username and password matches.
  - **Use the “payload.state” Parameter:** For payment status, rely only on the **root-level “payload.state”** field in the response
  - **Avoid Strict Deserialization:** Don’t use overly strict rules for processing the response
  - **Use the “event” Parameter:** Ignore the “type” parameter in the webhook response. Use the “event” parameter instead to identify the event type
  - **Time Format:** The expireAt and timestamp fields will be in **epoch time**

## Webhook Responses

Response for Order Completed

```
{
  "event": "checkout.order.completed",
  "payload": {
    "orderId": "OMO2403282020198641071317",
    "merchantId": "merchantId",
    "merchantOrderId": "merchantOrderId",
    "state": "COMPLETED",
    "amount": 10000,
    "expireAt": 1724866793837,
    "metaInfo": {
      "udf1": "",
      "udf2": "",
      "udf3": "",
      "udf4": ""
    },
    "paymentDetails": [
      {
        "paymentMode": "UPI_QR",
        "transactionId": "OM12334",
        "timestamp": 1724866793837,
        "amount": 10000,
        "state": "COMPLETED",
        "splitInstruments": [
          {
            "amount": 10000,
            "rail": {
              "type": "UPI",
              "upiTransactionId": "upi12313",
              "vpa": "12****78@ybl"
            },
            "instrument": {
              "type": "ACCOUNT",
              "accountType": "SAVINGS",
              "accountNumber": "******1234"
            }
          }
        ]
      }
    ]
  }
}
```

Response for Order Failed

```
{
  "event": "checkout.order.failed",
  "payload": {
    "orderId": "OMO2403282020198641071311",
    "merchantId": "merchantId",
    "merchantOrderId": "merchantOrderId",
    "state": "FAILED",
    "amount": 10000,
    "expireAt": 1724866793837,
    "metaInfo": {
      "udf1": "",
      "udf2": "",
      "udf3": "",
      "udf4": ""
    },
    "paymentDetails": [
      {
        "paymentMode": "UPI_COLLECT",
        "timestamp": 1724866793837,
        "amount": 10000,
        "transactionId": "OM12333",
        "state": "FAILED",
        "errorCode": "AUTHORIZATION_ERROR",
        "detailedErrorCode": "ZM",
        "splitInstruments": [
          {
            "amount": 10000,
            "rail": {
              "type": "UPI",
              "upiTransactionId": "upi12313",
              "vpa": "12****78@ybl"
            },
            "instrument": {
              "type": "ACCOUNT",
              "accountType": "SAVINGS",
              "accountNumber": "******1234"
            }
          }
        ]
      }
    ]
  }
}
```

Response for Refund accepted

```
{
  "event": "pg.refund.accepted",
  "payload": {
    "merchantId": "merchantId",
    "merchantRefundId": "merchantRefundId_2",
    "originalMerchantOrderId": "MO950606fb",
    "amount": 1000,
    "state": "CONFIRMED",
    "paymentDetails": [
      {
        "transactionId": "OMR2408282309538075378400",
        "paymentMode": "UPI_QR",
        "timestamp": 1724866793837,
        "amount": 1000,
        "payableAmount": 1600,
        "feeAmount": 600,
        "state": "CONFIRMED"
      }
    ]
  }
}
```

## Response for Refund Completed

Case 1: Original source of transaction = UPI

```
{
  "event": "pg.refund.completed",
  "payload": {
    "merchantId": "merchantId",
    "merchantRefundId": "merchantRefundId",
    "originalMerchantOrderId": "Refund-12345",
    "amount": 50000,
    "state": "COMPLETED",
    "paymentDetails": [
      {
        "paymentMode": "UPI_INTENT",
        "timestamp": 1706629419799,
        "amount": 50000,
        "transactionId": "OMR7896789",
        "state": "COMPLETED",
        "splitInstruments": [
          {
            "amount": 50000,
            "rail": {
              "type": "UPI",
              "upiTransactionId": "upi12313",
              "vpa": "12****78@ybl"
            },
            "instrument": {
              "type": "ACCOUNT",
              "accountType": "SAVINGS",
              "accountNumber": "******1234"
            }
          }
        ]
      }
    ]
  }
}
```

Case 2: Original source of transaction = CARD

```
{
  "event": "pg.refund.completed",
  "payload": {
    "merchantId": "merchantId",
    "merchantRefundId": "merchantRefundId",
    "originalMerchantOrderId": "Refund-12345",
    "amount": 50000,
    "state": "COMPLETED",
    "paymentDetails": [
      {
        "paymentMode": "UPI_INTENT",
        "timestamp": 1706629419799,
        "amount": 50000,
        "transactionId": "OMR7896789",
        "state": "COMPLETED",
        "splitInstruments": [
          {
            "amount": 50000,
            "rail": {
              "type": "UPI",
              "upiTransactionId": "upi12313",
              "vpa": "12****78@ybl"
            },
            "instrument": {
              "type": "ACCOUNT",
              "accountType": "SAVINGS",
              "accountNumber": "******1234"
            }
          }
        ]
      }
    ]
  }
}
```

Case 3: Original source of transaction = NET\_BANKING

```
{
  "event": "pg.refund.completed",
  "payload": {
    "merchantId": "merchantId",
    "merchantRefundId": "merchantRefundId",
    "originalMerchantOrderId": "Refund-12345",
    "amount": 50000,
    "state": "COMPLETED",
    "paymentDetails": [
      {
        "paymentMode": "UPI_INTENT",
        "timestamp": 1706629419799,
        "amount": 50000,
        "transactionId": "OMR7896789",
        "state": "COMPLETED",
        "splitInstruments": [
          {
            "amount": 50000,
            "rail": {
              "type": "PG",
              "transactionId": "transactionId",
              "authorizationCode": "authorizationCode",
              "serviceTransactionId": "serviceTransactionId"
            },
            "instrument": {
              "type": "NET_BANKING",
              "bankTransactionId": "bankTransactionId",
              "bankId": "bankId",
              "arn": "arn",
              "brn": "brn"
            }
          }
        ]
      }
    ]
  }
}
```

## Response for Refund Failed

Case 1: Original source of transaction = UPI

```
{
  "event": "pg.refund.failed",
  "payload": {
    "originalMerchantOrderId": "",
    "refundId": "OMRxxxxx",
    "amount": 1234,
    "state": "FAILED",
    "errorCode": "AUTHORIZATION_ERROR",
    "detailedErrorCode": "ZM",
    "paymentDetails": [
      {
        "paymentMode": "UPI_INTENT",
        "timestamp": 1706629419799,
        "amount": 50000,
        "transactionId": "OMR7896789",
        "state": "COMPLETED",
        "splitInstruments": [
          {
            "amount": 50000,
            "rail": {
              "type": "UPI",
              "upiTransactionId": "upi12313",
              "vpa": "12****78@ybl"
            },
            "instrument": {
              "type": "ACCOUNT",
              "accountType": "SAVINGS",
              "accountNumber": "******1234"
            }
          }
        ]
      }
    ]
  }
}
```

Case 2: Original source of transaction = CARD

```
{
  "event": "pg.refund.failed",
  "payload": {
    "originalMerchantOrderId": "",
    "refundId": "OMRxxxxx",
    "amount": 1234,
    "state": "FAILED",
    "errorCode": "AUTHORIZATION_ERROR",
    "detailedErrorCode": "ZM",
    "paymentDetails": [
      {
        "paymentMode": "UPI_INTENT",
        "timestamp": 1706629419799,
        "amount": 50000,
        "transactionId": "OMR7896789",
        "state": "COMPLETED",
        "splitInstruments": [
          {
            "amount": 50000,
            "rail": {
              "type": "PG",
              "transactionId": "transactionId",
              "authorizationCode": "authorizationCode",
              "serviceTransactionId": "serviceTransactionId"
            },
            "instrument": {
              "type": "CREDIT_CARD",
              "bankTransactionId": "bankTransactionId",
              "bankId": "bankId",
              "arn": "arn",
              "brn": "brn"
            }
          }
        ]
      }
    ]
  }
}
```

Case 3: Original source of transaction = NET\_BANKING

```
{
  "event": "pg.refund.failed",
  "payload": {
    "originalMerchantOrderId": "",
    "refundId": "OMRxxxxx",
    "amount": 1234,
    "state": "FAILED",
    "errorCode": "AUTHORIZATION_ERROR",
    "detailedErrorCode": "ZM",
    "paymentDetails": [
      {
        "paymentMode": "UPI_INTENT",
        "timestamp": 1706629419799,
        "amount": 50000,
        "transactionId": "OMR7896789",
        "state": "COMPLETED",
        "splitInstruments": [
          {
            "amount": 50000,
            "rail": {
              "type": "PG",
              "transactionId": "transactionId",
              "authorizationCode": "authorizationCode",
              "serviceTransactionId": "serviceTransactionId"
            },
            "instrument": {
              "type": "NET_BANKING",
              "bankTransactionId": "bankTransactionId",
              "bankId": "bankId",
              "arn": "arn",
              "brn": "brn"
            }
          }
        ]
      }
    ]
  }
}
```

## What if Webhook fails?

If you don’t receive the Webhook callback, you can use the [Order Status API](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/api-reference-android/check-order-status.md) to manually check the payment status.

## What’s Next?

Now that you have learned how to verify the payment and what happens when the webhook fails, this concludes your website integration. The next step is to complete UAT testing and understand the process to go live.
