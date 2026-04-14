<!-- Source: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/webhook -->

# Webhook Handling

---

PhonePe Payment Gateway uses Webhook (S2S Callbacks) to notify you about key events like payment completion or refund status. Here’s how it works:

- You need to provide a Webhook URL (a specific endpoint on your server) where these updates will be sent.
- To ensure secure communication, you should set up a **username** and **password** for authentication.

👍 **Webhook Integration – Best Practices**

---

- **HTTPS Requirement:** We strictly require that all listener URLs use HTTPS with valid SSL/TLS certificates.
- **Acknowledge Promptly:** Ensure your listener returns a 2xx status code (e.g., 200 OK) within 3-5 seconds to prevent timeouts.
- **IP Whitelisting:** Configure your network to allow traffic from our specific proxy IPs.
- **Idempotency:** Implement logic to handle duplicate events. It is possible for the same transaction webhook to trigger multiple times; your system should be able to handle this.
- **Event Filtering:** Select only to the specific events you need. This reduces unnecessary server load and processing “noise.”
- **Authentication Standards:** Ensure your configured username and password meet the following rules:
  - *Username*: 5-20 characters, letters, digits, and underscores only.
  - *Password:* 8-20 characters, must contain both letters and numbers.

ℹ️ ****IP Whitelisting**!**

---

If there are any server restrictions on receiving the Webhooks, please find below the list of the IP’s to be whitelisted to receive the webhook responses on your server:
103.116.33.8
103.116.33.9
103.116.33.10
103.116.33.11
103.116.33.136
103.116.33.137
103.116.33.138
103.116.33.139
103.116.32.16
103.116.32.17
103.116.32.18
103.116.32.19
103.116.32.20
103.116.32.21
103.116.32.22
103.116.32.23
103.116.32.24
103.116.32.25
103.116.32.26
103.116.32.27
103.116.32.28
103.116.32.29
103.116.34.1
103.116.34.16
103.116.34.17
103.116.34.18
103.116.34.19
103.116.34.20
103.116.34.21
103.116.34.22
103.116.34.23
103.243.35.242

**Outbound IP CIDR**
103.116.34.16/29
103.116.32.16/29
103.116.33.8/30
103.116.33.136/30

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
        "paymentDetails": [
            {
                "paymentMode": "UPI_QR",
                "transactionId": "OM12334",
                "timestamp": 1724866793837,
                "amount": 10000,
                "state": "COMPLETED"
            }
        ],
        "metaInfo": {
            "udf1": "",
            "udf2": "",
            "udf3": "",
            "udf4": "",
            "udf5": "",
            "udf6": "",
            "udf7": "",
            "udf8": "",
            "udf9": "",
            "udf10": "",
            "udf11": "",
            "udf12": "",
            "udf13": "",
            "udf14": "",
            "udf15": ""
        }
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
        "paymentDetails": [
            {
                "paymentMode": "UPI_COLLECT",
                "timestamp": 1724866793837,
                "amount": 10000,
                "transactionId": "OM12333",
                "state": "FAILED",
                "errorCode": "AUTHORIZATION_ERROR",
                "detailedErrorCode": "ZM"
            }
        ],
        "metaInfo": {
            "udf1": "",
            "udf2": "",
            "udf3": "",
            "udf4": ""
        }
    }
}
```

## Response for Refund Completed

Case 1: Original source of transaction = UPI

```
{
    "originalMerchantOrderId": "Order123",
    "amount": 100,
    "state": "COMPLETED",
    "timestamp": 1730869961754,
    "refundId": "OMR7878098045517540996",
    "errorCode": "", // Only present in case of ERROR
    "detailedErrorCode": "",   // Only present in case of ERROR
    "splitInstruments": [
        {
            "amount": 100,
            "rail": {
                "type": "UPI",
                "utr": "586756785",
                "upiTransactionId": "YBL5bc011fa9f8644763b52b96a29a9655",
                "vpa": "12****78@ybl"
            },
            "instrument": {
                "type": "ACCOUNT",
                "maskedAccountNumber": "******1234",
                "accountType": "SAVINGS"
            }
        }
    ]
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
        "timestamp": 1730869961754,
        "refundId": "OMR7878098045517540996",
        "paymentDetails": [
            {
                "paymentMode": "UPI_INTENT",
                "timestamp": 1706629419799,
                "amount": 50000,
                "transactionId": "OMR7896789",
                "state": "COMPLETED"
            }
        ]
    }
}
```

Case 3: Original source of transaction = NET\_BANKING

```
{
    "originalMerchantOrderId": "TX1752742884088",
    "amount": 50,
    "state": "COMPLETED",
    "refundId": "OMR2507211657281836129569",
    "timestamp": 1753097248198,
    "splitInstruments": [
        {
            "instrument": {
                "type": "NET_BANKING",
                "bankId": "SBIN",
                "brn": "brn123"
            },
            "rail": {
                "type": "PG"
            },
            "amount": 50
        }
    ],
    "paymentDetails": [
        {
            "transactionId": "OMR2507211657281836129569",
            "paymentMode": "NET_BANKING",
            "timestamp": 1753097248198,
            "amount": 50,
            "state": "COMPLETED",
            "instrument": {
                "type": "NET_BANKING",
                "bankId": "SBIN"
            },
            "rail": {
                "type": "PG"
            },
            "splitInstruments": [
                {
                    "instrument": {
                        "type": "NET_BANKING",
                        "bankId": "SBIN"
                    },
                    "rail": {
                        "type": "PG"
                    },
                    "amount": 50
                }
            ]
        }
    ]
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
        "timestamp": 1730869961754,
        "refundId": "OMR7878098045517540996",
        "errorCode": "AUTHORIZATION_ERROR",
        "detailedErrorCode": "ZM",
        "paymentDetails": [
            {
                "paymentMode": "UPI_INTENT",
                "timestamp": 1706629419799,
                "amount": 50000,
                "transactionId": "OMR7896789",
                "state": "FAILED",
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
        "timestamp": 1730869961754,
        "refundId": "OMR7878098045517540996",
        "errorCode": "AUTHORIZATION_ERROR",
        "detailedErrorCode": "ZM",
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
        "timestamp": 1730869961754,
        "refundId": "OMR7878098045517540996",
        "errorCode": "AUTHORIZATION_ERROR",
        "detailedErrorCode": "ZM"
    }
}
```

## What if Webhook fails?

If you don’t receive the Webhook callback, you can use the [Order Status](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/order-status.md) to manually check the payment status.

## What’s Next?

Now that you have learned how to verify the payment and what happens when the webhook fails, this concludes your website integration. The next step is to complete UAT testing and understand the process to go live.
