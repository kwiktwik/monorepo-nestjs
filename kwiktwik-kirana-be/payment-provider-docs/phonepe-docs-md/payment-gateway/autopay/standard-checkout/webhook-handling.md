<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/standard-checkout/webhook-handling -->

# Webhook Handling

In a subscription-based system, it’s essential to confirm the outcome of every payment event. Once a payment or recurring debit is initiated, your system should quickly identify whether it was successful, failed, or is still pending. This real-time verification helps you take timely actions like activating services, updating customer access, retrying failed payments, or sending notifications.

To support this, PhonePe sends two types of webhook callbacks that your system should listen to:

- **Subscription Callbacks** – These indicate the result of the first payment made when a subscription is created.
- **Redemption Callbacks** – These provide the status of automated payments for ongoing subscriptions.

## 1. Subscription Callback

To start receiving essential subscription status updates in real-time, you’ll need to set up your Webhook callback. This ensures our system can notify yours about changes. To enable these crucial updates, you’ll configure the following:

- **Callback URL** – Your server endpoint where PhonePe will send subscription updates.
- **Username** – Create and set your own username.
- **Password** – Create and set your own password.

Make sure the same username and password are used in your code to validate the Authorization header received in the callback from PhonePe.

## Callback Validation/Verification

For incoming requests, extract the `Authorization` header, validate it against the username:password you configured with us, and accept the response only if the values match.
`Authorization: SHA256(username:password)`

## Callback Event Types

|  |  |
| --- | --- |
| **Flow** | **Callback Type** |
| Setup | `checkout.order.completed checkout.order.failed` |
| State Change | `subscription.paused subscription.unpaused subscription.revoked subscription.cancelled` |
| Notification | `subscription.notification.completed subscription.notification.failed` |
| Redemption | `subscription.redemption.order.completed subscription.redemption.order.failed subscription.redemption.transaction.completed subscription.redemption.transaction.failed` |
| Refund | `pg.refund.accepted pg.refund.completed pg.refund.failed` |

.custom-block-wrapper {
padding: 20px;
border: 1px solid black;
background-color: #d9edbc;
}

**📘** ****Get It Right: Subscription Webhook Best Practices**!**

---

- Always use the root-level payload.state parameter to confirm the subscription status.
- Avoid strict deserialization of the webhook response.
- Do not depend on the type parameter (this will be deprecated); instead, use the event parameter to identify the webhook event.
- expireAt and timestamp values are provided in epoch time format (in milliseconds).

## Callbacks – Setup

Subscription setup order – COMPLETED

```
{
  "type": "CHECKOUT_ORDER_COMPLETED",
  "event": "checkout.order.completed",
  "payload": {
    "merchantId": "PRODTEST",
    "merchantOrderId": "TEST_ORD76218257999841196127",
    "orderId": "OMO2512091216567658772255V",
    "state": "COMPLETED",
    "currency": "INR",
    "amount": 200,
    "payableCurrency": "INR",
    "payableAmount": 200,
    "feeCurrency": "INR",
    "feeAmount": 0,
    "expireAt": 1765264016765,
    "metaInfo": {
        "udf1": "some meta info of max length 256",
        "udf2": "some meta info of max length 256",
        "udf3": "some meta info of max length 256",
        "udf4": "some meta info of max length 256",
        "udf5": "some meta info of max length 256",
        "udf6": "some meta info of max length 256",
        "udf7": "some meta info of max length 256",
        "udf8": "some meta info of max length 256",
        "udf10": "some meta info of max length 256",
        "udf11": "some meta info of max length 50",
        "udf12": "some meta info of max length 50",
        "udf13": "some meta info of max length 50",
        "udf14": "some meta info of max length 50",
        "udf15": "some meta info of max length 50"
    },
    "paymentFlow": {
      "type": "SUBSCRIPTION_CHECKOUT_SETUP",
      "merchantSubscriptionId": "MSUB_5580745967290798888",
      "authWorkflowType": "PENNY_DROP",
      "amountType": "VARIABLE",
      "maxAmount": 200,
      "frequency": "DAILY",
      "expireAt": 2711947616753,
      "subscriptionId": "OMS2512091216567538772793V"
    },
    "paymentDetails": [
      {
        "transactionId": "OM2512091217085453615241V",
        "paymentMode": "UPI_QR",
        "timestamp": 1765262828576,
        "currency": "INR",
        "amount": 200,
        "payableCurrency": "INR",
        "payableAmount": 200,
        "feeCurrency": "INR",
        "feeAmount": 0,
        "state": "COMPLETED",
        "instrument": {
          "type": "ACCOUNT",
          "ifsc": "KKBK*****24",
          "accountHolderName": "HRISHIKESH",
          "accountType": "SAVINGS",
          "bankId": "KKBK"
        },
        "rail": {
          "type": "UPI",
          "utr": "534312158356",
          "vpa": "12****78@ybl",
          "umn": "75103a529f684f1cb9fac5ae7de4edb8@ybl"
        },
        "splitInstruments": [
          {
            "instrument": {
              "type": "ACCOUNT",
              "ifsc": "KKBK0000724",
              "accountHolderName": "RAVINDRA ",
              "accountType": "SAVINGS",
              "bankId": "KKBK"
            },
            "rail": {
              "type": "UPI",
              "utr": "534312158356",
              "vpa": "12****78@ybl",
              "umn": "75103a529f684f1cb9fac5ae7de4edb8@ybl"
            },
            "currency": "INR",
            "amount": 200
          }
        ]
      }
    ]
  }
}
```

.custom-block-wrapper {
padding: 20px;
border: 1px solid black;
background-color: #d9edbc;
}

Subscription setup order – FAILED

```
{
  "type": "CHECKOUT_ORDER_FAILED",
  "event": "checkout.order.failed",
  "payload": {
    "merchantId": "PRODTEST",
    "merchantOrderId": "TEST_ORD92782488154686223748",
    "orderId": "OMO2512091220426054140059V",
    "state": "FAILED",
    "currency": "INR",
    "amount": 200,
    "expireAt": 1765264242605,
    "errorCode": "OTHERS",
    "detailedErrorCode": "INTENT_EXPIRED",
    "metaInfo": {
        "udf1": "some meta info of max length 256",
        "udf2": "some meta info of max length 256",
        "udf3": "some meta info of max length 256",
        "udf4": "some meta info of max length 256",
        "udf5": "some meta info of max length 256",
        "udf6": "some meta info of max length 256",
        "udf7": "some meta info of max length 256",
        "udf8": "some meta info of max length 256",
        "udf10": "some meta info of max length 256",
        "udf11": "some meta info of max length 50",
        "udf12": "some meta info of max length 50",
        "udf13": "some meta info of max length 50",
        "udf14": "some meta info of max length 50",
        "udf15": "some meta info of max length 50"
    },
    "paymentFlow": {
      "type": "SUBSCRIPTION_CHECKOUT_SETUP",
      "merchantSubscriptionId": "MSUB_5843827890811415656",
      "authWorkflowType": "PENNY_DROP",
      "amountType": "VARIABLE",
      "maxAmount": 200,
      "frequency": "DAILY",
      "expireAt": 2711947842592,
      "subscriptionId": "OMS2512091220425914140379V"
    },
    "paymentDetails": [
      {
        "transactionId": "OM2512091225260208772899V",
        "paymentMode": "UPI_QR",
        "timestamp": 1765263326040,
        "currency": "INR",
        "amount": 200,
        "payableCurrency": "INR",
        "payableAmount": 200,
        "feeCurrency": "INR",
        "feeAmount": 0,
        "state": "FAILED",
        "errorCode": "OTHERS",
        "detailedErrorCode": "INTENT_EXPIRED"
      }
    ]
  }
}
```

Response Parameter

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| `merchantId` | String | A unique ID assigned to the merchant by the PhonePe system during the onboarding process. |
| `merchantOrderId` | String | A unique orderId provided by the merchant when creating the order. This helps in tracking and managing the specific transaction across systems. |
| `orderId` | String | An orderId generated by PhonePe. |
| `state` | String | Possible value: • COMPLETED • FAILED • PENDING |
| `amount` | Long | The amount provided by the merchant in Paise. |
| `expireAt` | DateTime | Represents the time in **epoch** (milliseconds). |
| `errorCode` | String | Indicates the reason for the failure. **[PRESENT ONLY IF STATE = FAILED]** |
| `detailedErrorCode` | String | Provides a detailed explanation for the failure. |
| `MetaInfo` | Array | Contains metadata provided by the merchant. |
| `paymentFlow` | Object | Provides the detailed information of the subscription. |
| `paymentFlow.type` | String | The type should be set to “SUBSCRIPTION\_REDEMPTION” for redemption transactions. |
| `paymentFlow.merchantSubscriptionId` | String | A unique subscriptionId provided by the merchant to identify and manage the subscription request. |
| `paymentFlow.amountType` | String | Nature of redemption amount Possible Values: • FIXED • VARIABLE |
| `paymentFlow.maxAmount` | Long | Specifies the maximum amount that can be debited from the customer’s account for each redemption cycle. |
| `paymentFlow.frequency` | String | Defines how often the payment will be deducted from the customer’s account. |
| `paymentFlow.subscriptionId` | String | A subscriptionId generated by PhonePe to uniquely identify the user’s subscription. |
| `paymentDetails` | Array | Contains the details of the payment. |

## Callbacks – State Change

Subscription Cancelled

```
{
    "event": "subscription.cancelled",
    "payload": {
        "merchantSubscriptionId": "MS1708797962855",
        "subscriptionId": "OMS2402242336054995042603",
        "state": "CANCELLED",
        "authWorkflowType": "TRANSACTION",
        "amountType": "FIXED",
        "maxAmount": 200,
        "frequency": "ON_DEMAND",
        "expireAt": 1737278524000,
        "pauseStartDate": 1708798426196,
        "pauseEndDate": 1708885799000
    }
}
```

Subscription Revoked

```
{
    "event": "subscription.revoked",
    "payload": {
        "merchantSubscriptionId": "MS1708797962855",
        "subscriptionId": "OMS2402242336054995042603",
        "state": "REVOKED",
        "authWorkflowType": "TRANSACTION",
        "amountType": "FIXED",
        "maxAmount": 200,
        "frequency": "ON_DEMAND",
        "expireAt": 1737278524000,
        "pauseStartDate": 1708798426196,
        "pauseEndDate": 1708885799000
    }
}
```

Subscription Paused

```
{
    "event": "subscription.paused",
    "payload": {
        "merchantSubscriptionId": "MS1708797962855",
        "subscriptionId": "OMS2402242336054995042603",
        "state": "PAUSED",
        "authWorkflowType": "TRANSACTION",
        "amountType": "FIXED",
        "maxAmount": 200,
        "frequency": "ON_DEMAND",
        "expireAt": 1737278524000,
        "pauseStartDate": 1708798426196,
        "pauseEndDate": 1708885799000
    }
}
```

Subscription Unpaused

```
{
    "event": "subscription.unpaused",
    "payload": {
        "merchantSubscriptionId": "MS1708797962855",
        "subscriptionId": "OMS2402242336054995042603",
        "state": "ACTIVE",
        "authWorkflowType": "TRANSACTION",
        "amountType": "FIXED",
        "maxAmount": 200,
        "frequency": "ON_DEMAND",
        "expireAt": 1737278524000,
        "pauseStartDate": null,
        "pauseEndDate": null
    }
}
```

Response Parameter

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| `merchantSubscriptionId` | String | Unique merchant subscription Id passed by the merchant while creating the subscription. |
| `subscriptionId` | String | The subscription ID generated by PhonePe. |
| `state` | String | The current status of the subscription. Possible values: **•** ACTIVATION\_IN\_PROGRESS **•** ACTIVE **•** EXPIRED **•** FAILED **•** CANCEL\_IN\_PROGRESS **•** CANCELLED **•** REVOKE\_IN\_PROGRESS **•** REVOKED **•** PAUSE\_IN\_PROGRESS **•** PAUSED **•** UNPAUSE\_IN\_PROGRESS |
| `authWorkflowType` | String | Type of Authorization |
| `amountType` | String | Type of amount: **•** Fixed **•** Variable |
| `maxAmount` | String | Maximum amount that can be charged. |
| `frequency` | String | Frequency type of subscription. |
| `expireAt` | DateTime | Subscription Expiry Time in Epoch (in milliseconds) |
| `pauseStartDate` | DateTime | The start date of the subscription pause, applicable only when the subscription is in the “PAUSED” state. Otherwise, the value will be null. The date is provided in epoch (milliseconds). |
| `pauseEndDate` | DateTime | The end date of the subscription pause, applicable only when the subscription is in the “PAUSED” state. Otherwise, the value will be null. The date is provided in epoch (milliseconds). |

## 2. Redemption Callback

To ensure you receive timely notifications regarding changes in redemption status, you must set up your Webhook callback. This involves configuring the following parameters:

- **Callback URL** – Your server endpoint where PhonePe will send subscription updates.
- **Username** – Create and set your own username.
- **Password** – Create and set your own password.

Make sure the same username and password are used in your code to validate the Authorization header received in the callback from PhonePe.

## Callback Validation/Verification

For incoming requests, extract the `Authorization` header, validate it against the username:password you configured with us, and accept the response only if the values match.
`Authorization: SHA256(username:password)`

## Callback Event Types

|  |  |
| --- | --- |
| **Flow** | **Callback Type** |
| Notification | subscription.notification.completed subscription.notification.failed |
| Redemption | subscription.redemption.order.completed subscription.redemption.order.failed subscription.redemption.transaction.completed subscription.redemption.transaction.failed |

**📘** **Get It Right: Redemption Webhook Best Practices**!

---

- Always use the root-level payload.state parameter to confirm the subscription status.
- Avoid strict deserialization of the webhook response.
- Do not depend on the type parameter (this will be deprecated); instead, use the event parameter to identify the webhook event.
- expireAt and timestamp values are provided in epoch time format (in milliseconds).

## Callbacks – Notification

Subscription Notification – COMPLETED

```
{
  "event": "subscription.notification.completed",
  "payload": {
    "merchantId": "SWIGGY8",
    "merchantOrderId": "MO1708797962855",
    "orderId": "OMO12344",
    "amount": 100,
    "state": "NOTIFIED",
    "expireAt": 1620891733101,
    "paymentFlow": {
      "type": "SUBSCRIPTION_REDEMPTION",
      "merchantSubscriptionId": "MS121312",
      "redemptionRetryStrategy": "CUSTOM",
      "autoDebit": true,
      "validAfter": 1628229131000,
      "validUpto": 1628574731000,
      "notifiedAt": 1622539751586
    }
  }
}
```

## Callbacks – Redemption

Callback for Redeemed State

```
{
  "event": "subscription.redemption.order.completed/subscription.redemption.order.failed",
  "payload": {
   "merchantId": "SWIGGY8",
    "merchantOrderId": "MO1708797962855"
    "orderId": "OMO12344",
    "state": "COMPLETED",
    "amount": 100,
   "expireAt": 1620891733101,
    "paymentFlow": {
      "type": "SUBSCRIPTION_REDEMPTION",
      "merchantSubscriptionId": "MS121312",
      "redemptionRetryStrategy": "CUSTOM",
      "autoDebit": true,
      "validAfter": 1628229131000,
      "validUpto": 1628574731000,
      "notifiedAt": "1622539751586"
    },
    "errorCode": 
    "detailedErrorCode":   
    "paymentDetails": [
        {
            "amount": 100
            "paymentMode": "UPI_AUTO_PAY",
            "timestamp": 1620891733101      
            "transactionId": "OM124",
            "state": "COMPLETED", // FAILED, PENDING
            "rail": {
                "type": "UPI",
                "utr": "2",
                "vpa": "12****78@ybl",
                "umn": "544fcc8819d04cb08e26faa1fb07eee7@ybl"
            },
            "instrument": {
                "type": "ACCOUNT",
                "maskedAccountNumber": "******1234",
                "ifsc": "VISA",
                "accountHolderName": "Harshad",
                "accountType": "SAVINGS"
            },
            "errorCode": 
           "detailedErrorCode": 
        }
    ]
  }
}
```

Callback for Redemption Attempt

```
{
  "event": "subscription.redemption.transaction.completed/subscription.redemption.transaction.failed",
  "payload": {
   "merchantId": "SWIGGY8",
    "merchantOrderId": "MO1708797962855"
    "orderId": "OMO12344",
    "state": "PENDING",
    "amount": 100,
   "expireAt": 1620891733101,
    "paymentFlow": {
      "type": "SUBSCRIPTION_REDEMPTION",
      "merchantSubscriptionId": "MS121312",
      "redemptionRetryStrategy": "CUSTOM",
      "autoDebit": true,
      "validAfter": 1628229131000,
      "validUpto": 1628574731000,
      "notifiedAt": 1622539751586
    },
    "errorCode": 
    "detailedErrorCode":   
    "paymentDetails": [
        {
            "amount": 100
            "paymentMode": "UPI_AUTO_PAY",
            "timestamp": 1620891733101      
            "transactionId": "OM124",
            "state": "COMPLETED", // FAILED, PENDING
            "rail": {
                "type": "UPI",
                "utr": "2",
                "vpa": "12****78@ybl",
                "umn": "544fcc8819d04cb08e26faa1fb07eee7@ybl"
            },
            "instrument": {
                "type": "ACCOUNT",
                "maskedAccountNumber": "******1234",
                "ifsc": "VISA",
                "accountHolderName": "Harshad",
                "accountType": "SAVINGS"
            },
            "errorCode": 
           "detailedErrorCode": 
        }
    ]
  }
}
```
