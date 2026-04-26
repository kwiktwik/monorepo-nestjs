<!-- Source: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment/configure-payment-modes -->

# Configure Payment Modes

---

Payment mode configuration allows you to control which payment methods, instruments, and flows are available to customers during checkout. These preferences are passed directly within the Create Payment API request body, with no need for any dashboard-level configuration. Since the configuration is applied at a transaction level, it provides granular, per-order control over the checkout experience.

***Note:** This page documents the V2 schema. If your integration was built prior to the introduction of V2 and your requests either omit the version field or specify it as V1, please refer to the [V1 documentation](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment-2/initiate-payment.md). V2 offers enhanced flexibility and finer control, and is recommended for all new integrations.*

## Request

`paymentModeConfig` is nested inside `paymentFlow`.

```
{
  "merchantOrderId": "ORDER_123",
  "amount": 1000,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://www.yoursite.com/callback"
    },
    "paymentModeConfig": {
      "version": "V2",
      "enabledPaymentModes": [
        { "type": "UPI", "flows": ["INTENT"], "apps": ["phonepe", "gpay"] },
        { "type": "CARD", "types": ["CREDIT_CARD"], "networks": ["VISA", "MASTER_CARD"] },
        { "type": "NET_BANKING", "banks": ["HDFC", "ICIC", "SBIN"] }
      ]
    }
  }
}
```

| **Parameter** | **Data Type** | **Mandatory** | **Description** |
| --- | --- | --- | --- |
| `version` | string | Required | Must be `"V2"` to use the V2 schema. Omitting this field falls back to V1 behavior. |
| `enabledPaymentModes` | Array | Conditional | List of payment mode constraints that define the **allowlist**. Mutually exclusive with `disabledPaymentModes`. |
| `disabledPaymentModes` | Array | Conditional | List of payment mode constraints that define the **blocklist**. Mutually exclusive with `enabledPaymentModes`. |

### Payment Mode Constraint Object

Each element in `enabledPaymentModes` or `disabledPaymentModes` is a constraint object. The `type` field identifies the payment mode; additional fields are dimension filters specific to that type.

| **Parameter** | **Type** | ****Mandatory**** | **Description** |
| --- | --- | --- | --- |
| `type` | String | Required | Accepted values: “UPI”, “CARD”, “NET\_BANKING”, “CORPORATE\_NET\_BANKING”, “EMI”, “WALLET”. |

#### UPI

| **Parameter** | **Type** | ****Mandatory**** | Default | **Description** |
| --- | --- | --- | --- | --- |
| `flows` | array of strings | Optional | All flows | Flows to allow or block: “INTENT”, “COLLECT”, “QR”. |
| `apps` | array of strings | Optional | All apps | UPI apps to allow or block (lowercase). For example: `"phonepe"`, `"gpay"`, `"paytm"`. |
| `instruments` | array of strings | Optional | All instruments | Instrument types: `"BANK_ACCOUNT"`, `"RUPAY_CC"`, `"CREDIT_LINE"`. |

#### CARD

| **Parameter** | **Type** | ****Mandatory**** | Default | **Description** |
| --- | --- | --- | --- | --- |
| `types` | array of strings | Optional | All types | Card types: “CREDIT\_CARD”, “DEBIT\_CARD”. |
| `networks` | array of strings | Optional | All networks | Card networks: “VISA”, “MASTER\_CARD”, “RUPAY”, “AMEX”, “DINERS\_CLUB”. |
| `variants` | array of strings | Optional | All variants | Card tiers: “CONSUMER”, “PREMIUM”, “SUPER\_PREMIUM”, “CORPORATE”. |
| `geoScopes` | array of strings | Optional | All geographies | Issuing geography: “DOMESTIC”, “INTERNATIONAL”. |

#### NetBanking

| **Parameter** | **Type** | ****Mandatory**** | Default | **Description** |
| --- | --- | --- | --- | --- |
| `banks` | array of strings | Optional | All banks | Bank codes (uppercase). For example: `”HDFC”`, `”ICIC”`, `”SBIN”`. See [Supported Banks](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment/supported-values.md#nav-net-banking) for the full list. |

#### Corporate NetBanking

| **Parameter** | **Type** | ****Mandatory**** | Default | **Description** |
| --- | --- | --- | --- | --- |
| `banks` | array of strings | Optional | All banks | Bank codes (uppercase). Uses the same values as NET\_BANKING. See [Supported Banks](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment/supported-values.md#nav-net-banking) for the full list. |

#### EMI

| **Parameter** | **Type** | ****Mandatory**** | Default | **Description** |
| --- | --- | --- | --- | --- |
| `types` | array of strings | Optional | All types | EMI instrument types: “CREDIT\_CARD”. |

#### Wallet

| **Parameter** | **Type** | ****Mandatory**** | Default | **Description** |
| --- | --- | --- | --- | --- |
| `wallets` | array of strings | Optional | All wallets | Wallet providers: “PHONEPE”. |

See the [Payment Mode Reference](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment/payment-mode.md) for per-mode behavioral details and examples.

## When to use this Configuration

| **Use Case** | **Example Goal** | **Recommended Approach** |
| --- | --- | --- |
| **App-Specific UPI** | Show only PhonePe and GPay | `enabledPaymentModes` with `type: "UPI"`, `apps: ["phonepe", "gpay"]` |
| **Domestic Only** | Block international cards | `enabledPaymentModes` with `type: "CARD"`, `geoScopes: ["DOMESTIC"]` |
| **Debit-Only Flow** | Allow only domestic debit Visa | `enabledPaymentModes` with `type: "CARD"`, `types: ["DEBIT_CARD"]`, `networks: ["VISA"]`, `geoScopes: ["DOMESTIC"]` |
| **Enterprise Payroll** | Restrict net banking to specific banks | `enabledPaymentModes` with `type: "NET_BANKING"`, `banks: ["HDFC", "ICIC"]` |
| **Total Suppression** | Hide net banking entirely | `disabledPaymentModes` with `type: "NET_BANKING"` |

## V1 vs V2 Schema Comparison

V1 and V2 schemas are mutually exclusive. Once you set `"version": "V2"`, all constraints must follow the V2 schema. V1 type values (like `UPI_INTENT` or `UPI_QR`) are completely ignored in V2.

| **Feature** | **V1 Schema** | **V2 Schema** |
| --- | --- | --- |
| **Trigger** | Omit `version` field | Set `"version": "V2"` in `paymentModeConfig` |
| **Granularity** | Coarse-grained (method-level) | Fine-grained (instrument, network, app, variant, geography) |
| **UPI Setup** | Separate types: `UPI_INTENT`, `UPI_QR`, `UPI_COLLECT` | Single `type: "UPI"` filtered by `flows`, `apps`, `instruments` |
| **Card Setup** | `type: "CARD"` with `cardTypes` (basic) | `type: "CARD"` filtered by `types`, `networks`, `variants`, `geoScopes` |
| **NetBanking** | `type: "NET_BANKING"` (no bank-level control) | `type: "NET_BANKING"` filtered via `banks` list |

## How it works

`enabledPaymentModes` vs `disabledPaymentModes`

`enabledPaymentModes`: Only the methods and instruments matching your constraints will be shown to customers. All other payment options are suppressed.

`disabledPaymentModes`: The specified methods and instruments are hidden, and everything else remains available.

***Important: You cannot use both `enabledPaymentModes` and `disabledPaymentModes` in the same request. Choose one approach per transaction.***

### Wildcard Behavior

Omitting a field from a constraint means “match all values for that dimension.” You only need to specify the dimensions you want to restrict.

```
{
  "type": "CARD",
  "types": ["CREDIT_CARD"]
}
```

This allows all credit cards regardless of network, variant, or geography, because `networks`, `variants`, and `geoScopes` are all omitted (wildcard).

### Per-Transaction Scope

Payment mode configuration applies only to the specific Create Payment call in which it is passed. There is no persistent merchant-level configuration. Each order can have a different configuration.

Note: Only the first constraint for each `type` value is processed. If you include two objects with “`type`“: “`UPI`“, only the first one takes effect.

## Example Payload

This example enables only GPay UPI intent payments and domestic Visa or Mastercard credit cards:

```
curl -X POST https://api.phonepe.com/apis/pg/checkout/v2/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: O-Bearer <token>" \
  -d '{
    "merchantOrderId": "ORDER_123",
    "amount": 50000,
    "paymentFlow": {
      "type": "PG_CHECKOUT",
      "merchantUrls": {
        "redirectUrl": "https://www.yoursite.com/callback"
      },
      "paymentModeConfig": {
        "version": "V2",
        "enabledPaymentModes": [
          {
            "type": "UPI",
            "flows": ["INTENT"],
            "apps": ["phonepe"]
          },
          {
            "type": "CARD",
            "types": ["CREDIT_CARD"],
            "networks": ["VISA", "MASTER_CARD"],
            "geoScopes": ["DOMESTIC"]
          }
        ]
      }
    }
  }'
```

**Payload Breakdown:**

- **UPI:** Shows only the PhonePe intent flow. Collect, QR, other apps, and UPI instruments like RuPay CC or Credit Line are hidden.
- **Card:** Shows only domestic Visa and Mastercard credit cards. Debit cards, international cards, other networks, and EMI are hidden.
- **NetBanking:** Not included in `enabledPaymentModes`, so it is hidden entirely.

## What’s Next?

Head over to the next section to understand how to configure individual payment modes. Allow or block specific options by adding a constraint object inside `paymentModeConfig`.
