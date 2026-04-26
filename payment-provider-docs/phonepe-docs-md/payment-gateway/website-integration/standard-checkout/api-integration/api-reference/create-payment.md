<!-- Source: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment -->

# Create Payment

---

This API is used to initiate a **Payment Gateway Checkout** session by providing transaction details such as the amount, order ID, and redirect URLs.

Once the request is successfully created, a checkout session is generated where the customer is redirected to complete the payment.

## Environment

|  |  |  |
| --- | --- | --- |
| **Environment** | **HTTP Method** | **API** |
| Sandbox | `POST` | https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay |
| Production | `POST` | https://api.phonepe.com/apis/pg/checkout/v2/pay |

## Request

Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| Content-Type | application/json |
| Authorization | O-Bearer <merchant-auth-token> |

Sample Request

```
{
    "merchantOrderId": "TX123653456743456",
    "amount": 1000,
    "expireAfter": 1200,
    "paymentFlow": {
        "type": "PG_CHECKOUT",
        "message": "Payment message used for collect requests",
        "merchantUrls": {
            "redirectUrl": ""
        }
    },
    "disablePaymentRetry": true,
    "metaInfo": {
        "udf1": "additional-information-1",
        "udf2": "additional-information-2",
        "udf3": "additional-information-3",
        "udf4": "additional-information-4",
        "udf5": "additional-information-5",
        "udf6": "additional-information-6",
        "udf7": "additional-information-7",
        "udf8": "additional-information-8",
        "udf9": "additional-information-9",
        "udf10": "additional-information-10",
        "udf11": "additional-information-11",
        "udf12": "additional-information-12",
        "udf13": "additional-information-13",
        "udf14": "additional-information-14",
        "udf15": "additional-information-15"
    }
}
```

Sample Request in curl

```
curl --location 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay' \
--header 'Content-Type: application/json' \
--header 'Authorization: O-Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVzT24iOjE3MTIyNTM2MjU2NDQsIm1lcmNoYW50SWQiOiJWMlNVQlVBVCJ9.7aVzYI_f_77-bBicEcRNuYx093b2wCsgl_WFNkKqAPY' \
--data '{
  "merchantOrderId": "TX123rrty34432456",
  "amount": 1000,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "message": "Payment message used for collect requests",
    "merchantUrls": {
      "redirectUrl": "https://www.xyz.com/PGIntegration/"
    }
  }
}'
```

Sample Request with Selected Instrument for enabledPaymentModes

```
{
    "merchantOrderId": "TX123456",
    "amount": 1000,
    "expireAfter": 1200,
    "paymentFlow": {
        "type": "PG_CHECKOUT",
        "message": "Payment message used for collect requests",
        "merchantUrls": {
            "redirectUrl": ""
        },
        "disablePaymentRetry": true,
        "paymentModeConfig": {
            "enabledPaymentModes": [
                {
                    "type": "UPI_INTENT"
                },
                {
                    "type": "UPI_QR"
                },
                {
                    "type": "NET_BANKING"
                },
                {
                    "type": "CARD",
                    "cardTypes": [
                        "DEBIT_CARD",
                        "CREDIT_CARD"
                    ]
                }
            ]
        }
    },
    "metaInfo": {
        "udf1": "additional-information-1",
        "udf2": "additional-information-2",
        "udf3": "additional-information-3",
        "udf4": "additional-information-4",
        "udf5": "additional-information-5",
        "udf6": "additional-information-6",
        "udf7": "additional-information-7",
        "udf8": "additional-information-8",
        "udf9": "additional-information-9",
        "udf10": "additional-information-10",
        "udf11": "additional-information-11",
        "udf12": "additional-information-12",
        "udf13": "additional-information-13",
        "udf14": "additional-information-14",
        "udf15": "additional-information-15"    
    }
}
```

Sample Request with Selected Instrument for disabledPaymentModes

```
{
    "merchantOrderId": "TX123456",
    "amount": 1000,
    "expireAfter": 1200,
    "paymentFlow": {
        "type": "PG_CHECKOUT",
        "message": "Payment message used for collect requests",
        "merchantUrls": {
            "redirectUrl": ""
        },
        "disablePaymentRetry": true,
        "paymentModeConfig": {
            "disabledPaymentModes": [
                {
                    "type": "UPI_INTENT"
                },
                {
                    "type": "UPI_QR"
                },
                {
                    "type": "NET_BANKING"
                },
                {
                    "type": "CARD",
                    "cardTypes": [
                        "DEBIT_CARD",
                        "CREDIT_CARD"
                    ]
                }
            ]
        }
    },
    "metaInfo": {
        "udf1": "additional-information-1",
        "udf2": "additional-information-2",
        "udf3": "additional-information-3",
        "udf4": "additional-information-4",
        "udf5": "additional-information-5",
        "udf6": "additional-information-6",
        "udf7": "additional-information-7",
        "udf8": "additional-information-8",
        "udf9": "additional-information-9",
        "udf10": "additional-information-10",
        "udf11": "additional-information-11",
        "udf12": "additional-information-12",
        "udf13": "additional-information-13",
        "udf14": "additional-information-14",
        "udf15": "additional-information-15"    
    }
}
```

Request Parameters

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** | **Mandatory (Yes/No)** | **Constraints** |
| `merchantOrderId` | String | Unique merchant order ID generated by you | Yes | Max Length = 63 characters No Special characters are allowed except underscore “\_” and hyphen “-“ |
| `amount` | Long | The total amount for the order, in paisa (e.g., ₹10 = 1000 paisa) | Yes | Minimum value = 100 |
| expireAfter | Long | The time (in seconds) after which the order will expire. If not provided, the default value will be used | No | Minimum value = 300, maximum value = 3600 (in seconds) |
| `metaInfo` | Object | Merchant defined meta info to store additional information. same data will be returned in status and callback response. | No | **•** For udf1 to udf10, there is no constraintand Maximum length for Udf1-10 = 256 characters **•** For udf11 to udf15, alphanumeric values with \_-+@. are allowed and Maximum length for Udf11-15 = 50 characters **•** It is mandatory to keep the parameter names `udf1`, `udf2`, etc., exactly as they are in the `metainfo` block. Renaming these key values **will result in a production error.** |
| `paymentFlow` | Object | Additional details required by this flow | Yes |  |

The `paymentFlow` object contains additional parameters, which are explained in the table below.

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** | **Mandatory (Yes/No)** | **Constraints** |
| `paymentFlow.type` | String | Type of payment flow | Yes | Valued allowed = [PG\_CHECKOUT] |
| `paymentFlow.message` | String | Payment message used for collect requests | No |  |
| `paymentFlow.merchantUrls` | Object | The object for storing different merchant URLs | Yes |  |
| `paymentFlow.merchantUrls.redirectUrl` | String | URL where the user will be redirected after a successful/failed payment | Yes |  |
| `paymentFlow.paymentModeConfig` | Object | The object for specifying which payment methods are shown to customers during checkout | No |  |

### Important:

- Include the `paymentModeConfig` block only if you want to control the payment instruments displayed at checkout
- If this block is not passed, PhonePe will show the default enabled instruments
- Either `enabledPaymentModes` or `disabledPaymentModes` must be provided but, **not both**. If both are included, the API will return an error.

#### Managing Payment Modes

- `enabledPaymentModes`: Displays only the specified payment instruments. Any other instruments enabled by PhonePe will **not** be shown.
- `disabledPaymentModes`: Hides only the specified payment instruments. All other instruments enabled by PhonePe will still be displayed.

#### Special Case: Card Payments

When configuring card payments, ensure `cardTypes` is included along with `type`.

- If `enabledPaymentModes.type = "CARD"` but `cardTypes` is not provided, the checkout will display cards based on PhonePe’s default settings (Credit and/or Debit Cards)
- If `enabledPaymentModes.type = "CARD"` and `cardTypes = ["DEBIT_CARD"]`, only **Debit Cards** will be available

#### For **disabling** card options:

- If `disabledPaymentModes.type = "CARD"` but `cardTypes` is not provided, cards will **not** be disabled and will follow PhonePe’s default settings
- If `disabledPaymentModes.type = "CARD"` and `cardTypes = ["DEBIT_CARD"]`, only **Debit Cards** will be disabled
- If `disabledPaymentModes.type = "CARD"` and `cardTypes = ["DEBIT_CARD", "CREDIT_CARD"]`, **both Debit and Credit Cards** will be disabled.

## Response

Case 1: Order created successfully

```
{
    "orderId": "OMO123456789",
    "state": "PENDING",
    "expireAt": 1703756259307,    
    "redirectUrl": "https://mercury-uat.phonepe.com/transact/uat_v2?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVzT24iOjE3MjgyNTk1MzE0NzgsIm1lcmNoYW50SWQiOiJWUlVBVCIsIm1lcmNoYW50T3JkZXJJZCI6Ik1PLTlkMC1hNmMyYmY1ZWM4MmUifQ.Trj5fub__kJpQhzOlJttXl2UPruHE7fsbH5QWj-iy6E"
}
```

Case 2: Order with same merchant order id is already present and not in CREATED state

```
{
    "code": "BAD_REQUEST",
    "message": "Please check the inputs you have provided."
}
```

Case 3: Internal Server Error

```
{
    "code": "INTERNAL_SERVER_ERROR",
    "message": "There is an error trying to process your transaction at the moment. Please try again in a while."
}
```

Response Parameters

|  |  |  |
| --- | --- | --- |
| **Field Name** | **Data Type** | **Description** |
| `orderId` | String | Payment Gateway generated internal order ID. |
| `state` | String | State of the order created, expected value is PENDING. |
| `expiryAt` | Long | Order expiry date in epoch. |
| `redirectUrl` | String | URL where you are supposed to redirect the user to complete payment. |

## Try a Sample Create Payment Request!

headers

body params

You can also test this API request directly in Postman for a quick and easy integration check.

[Run in Postman ->](https://www.postman.com/pg-api-collections-579549/pg-api-collections-s-workspace/)

## What’s Next?

After successfully creating a payment request, the next step is to initiate the payment process on your checkout page.

Head over to the next section to learn how to launch the PayPage and complete the payment flow.
