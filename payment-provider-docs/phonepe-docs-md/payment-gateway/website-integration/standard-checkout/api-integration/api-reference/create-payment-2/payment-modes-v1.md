<!-- Source: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment-2/payment-modes-v1 -->

# Payment Modes V1

---

This page documents the V1 schema for `paymentModeConfig`. V1 is the original payment mode configuration schema and remains supported for merchants who integrated before V2 was introduced.

If you are starting a new integration, use V2. V2 provides finer control over card networks, variants, geography, UPI apps, instruments, and bank-level filtering. See [Configure Payment Modes](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment-2/configure-payment-modes.md) for the V2 reference.

## Use V1 config

You can use version v1 in one of two ways.

- **Omit the `version` field** from `paymentModeConfig` entirely, or
- **Set `"version": "V1"`** explicitly

Both produce identical behaviour. V1 and V2 schemas are mutually exclusive and once you set `"version": "V2"`, all constraint objects must follow the V2 schema.

## Request Body Structure

`paymentModeConfig` is nested inside `paymentFlow`. It is not a top-level field.

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
      "enabledPaymentModes": [
        { "type": "UPI_INTENT" },
        { "type": "UPI_QR" },
        { "type": "CARD", "cardTypes": ["CREDIT_CARD", "DEBIT_CARD"] }
      ]
    }
  }
}
```

**Note:** The `version` field is omitted above. You may also set `"version": "V1"` explicitly, both are equivalent.

##

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `version` | string | Optional | V1 | Omit this field or set `"V1"` to use the V1 schema. Set `"V2"` to switch to the V2 schema. |
| `enabledPaymentModes` | array of objects | Conditional | — | List of payment mode constraints that define the allowlist. Mutually exclusive with `disabledPaymentModes`. |
| `disabledPaymentModes` | array of objects | Conditional | — | List of payment mode constraints that define the blocklist. Mutually exclusive with `enabledPaymentModes`. |

## Payment Mode Constraint Object (V1)

Each element in `enabledPaymentModes` or `disabledPaymentModes` is a constraint object identified by its `type` field.

**Important:** V1 type values are different from V2. UPI is split into three separate types (`UPI_INTENT`, `UPI_QR`, `UPI_COLLECT`) rather than a single `UPI` type with a `flows` field. Using V2 type values (such as `"UPI"`) in a V1 request will not work.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | — | The payment mode to configure. Accepted values: `"UPI_INTENT"`, `"UPI_QR"`, `"UPI_COLLECT"`, `"CARD"`, `"NET_BANKING"`. |

### UPI\_INTENT

Controls UPI intent flow, the flow where the customer is redirected to a UPI app on their device.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | — | Must be `"UPI_INTENT"`. |

**Note:** V1 does not support filtering by UPI app or instrument. To restrict by app or instrument, migrate to V2 and use `type: "UPI"` with `apps` and `instruments` fields.

#### Example

```
{
  "merchantOrderId": "ORDER_123",
  "amount": 50000,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://www.yoursite.com/callback"
    },
    "paymentModeConfig": {
      "enabledPaymentModes": [
        { "type": "UPI_INTENT" }
      ]
    }
  }
}
```

---

### UPI\_QR

Controls UPI QR code flow, the flow where a QR code is shown on screen for the customer to scan with any UPI app.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | — | Must be `"UPI_QR"`. |

#### Example

```
{
  "merchantOrderId": "ORDER_123",
  "amount": 50000,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://www.yoursite.com/callback"
    },
    "paymentModeConfig": {
      "enabledPaymentModes": [
        { "type": "UPI_QR" }
      ]
    }
  }
}
```

### UPI\_COLLECT

Controls UPI collect flow, the flow where the customer enters their UPI ID (VPA) and receives a collect request in their UPI app.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | — | Must be `"UPI_COLLECT"`. |

#### Example

```
{
  "merchantOrderId": "ORDER_123",
  "amount": 50000,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://www.yoursite.com/callback"
    },
    "paymentModeConfig": {
      "enabledPaymentModes": [
        { "type": "UPI_COLLECT" }
      ]
    }
  }
}
```

### CARD

Controls card payments. V1 supports filtering by card type (credit or debit) using the `cardTypes` field.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | — | Must be `"CARD"`. |
| `cardTypes` | array of strings | Optional | All types | Card types to allow or block. Accepted values: `"CREDIT_CARD"`, `"DEBIT_CARD"`. Omit to match all card types. |

**Note:** V1 does not support filtering by card network, variant, or geography. To filter by network (Visa, Mastercard, RuPay…), variant (consumer, corporate…), or geography (domestic, international), migrate to V2 and use `type: "CARD"` with `networks`, `variants`, and `geoScopes` fields.

#### Example: Allow credit cards only

```
{
  "merchantOrderId": "ORDER_123",
  "amount": 50000,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://www.yoursite.com/callback"
    },
    "paymentModeConfig": {
      "enabledPaymentModes": [
        {
          "type": "CARD",
          "cardTypes": ["CREDIT_CARD"]
        }
      ]
    }
  }
}
```

#### Example: Allow all card types

```
{
  "merchantOrderId": "ORDER_123",
  "amount": 50000,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://www.yoursite.com/callback"
    },
    "paymentModeConfig": {
      "enabledPaymentModes": [
        {
          "type": "CARD"
        }
      ]
    }
  }
}
```

### NET\_BANKING

Controls retail net banking payments. V1 does not support bank-level filtering, you can only enable or disable net banking as a whole.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | — | Must be `"NET_BANKING"`. |

**Note:** V1 does not support filtering by specific banks. To restrict net banking to a list of banks (for example, HDFC and ICICI only), migrate to V2 and use `type: "NET_BANKING"` with the `banks` field.

#### Example: Enable net banking

```
{
  "merchantOrderId": "ORDER_123",
  "amount": 50000,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://www.yoursite.com/callback"
    },
    "paymentModeConfig": {
      "enabledPaymentModes": [
        { "type": "NET_BANKING" }
      ]
    }
  }
}
```

#### Example: Disable net banking

```
{
  "merchantOrderId": "ORDER_123",
  "amount": 50000,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://www.yoursite.com/callback"
    },
    "paymentModeConfig": {
      "disabledPaymentModes": [
        { "type": "NET_BANKING" }
      ]
    }
  }
}
```

## V1 Limitations

V1 provides coarse-grained, method-level control only. The following capabilities are not available in V1:

| Capability | V1 | Workaround |
| --- | --- | --- |
| Filter UPI by app (GPay, PhonePe…) | Not supported | Migrate to V2 — use `type: "UPI"` with `apps` |
| Filter UPI by instrument (RuPay CC, Credit Line…) | Not supported | Migrate to V2 — use `type: "UPI"` with `instruments` |
| Filter cards by network (Visa, Mastercard, RuPay…) | Not supported | Migrate to V2 — use `type: "CARD"` with `networks` |
| Filter cards by variant (consumer, corporate, premium…) | Not supported | Migrate to V2 — use `type: "CARD"` with `variants` |
| Filter cards by geography (domestic vs. international) | Not supported | Migrate to V2 — use `type: "CARD"` with `geoScopes` |
| Filter net banking by specific banks | Not supported | Migrate to V2 — use `type: "NET_BANKING"` with `banks` |
| Corporate net banking control | Not supported | Migrate to V2 — use `type: "CORPORATE_NET_BANKING"` |
| EMI control (independent of cards) | Not supported | Migrate to V2 — use `type: "EMI"` |
| Wallet control | Not supported | Migrate to V2 — use `type: "WALLET"` |

## Migrating to V2

To migrate from V1 to V2:

1. Add `"version": "V2"` inside your `paymentModeConfig` object.
2. Replace V1 type values with their V2 equivalents:

| V1 Type | V2 Equivalent |
| --- | --- |
| `UPI_INTENT` | `"type": "UPI", "flows": ["INTENT"]` |
| `UPI_QR` | `"type": "UPI", "flows": ["QR"]` |
| `UPI_COLLECT` | `"type": "UPI", "flows": ["COLLECT"]` |
| `CARD` with `cardTypes` | `"type": "CARD"` with `types` field |
| `NET_BANKING` | `"type": "NET_BANKING"` (same, now supports `banks` filter) |

3. Remove the `cardTypes` field and replace with `types` for the `CARD` constraint.
4. Test your integration to confirm behavior is as expected.

**Important:** Do not mix V1 and V2 type values in the same request. Once `"version": "V2"` is set, type values such as `UPI_INTENT`, `UPI_QR`, and `UPI_COLLECT` are not recognized.
