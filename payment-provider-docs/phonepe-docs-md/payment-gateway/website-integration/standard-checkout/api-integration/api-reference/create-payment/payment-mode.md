<!-- Source: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment/payment-mode -->

# Payment Mode Reference

---

Use this complete reference to configure individual payment modes. Allow or block specific options by adding a constraint object to `enabledPaymentModes` or `disabledPaymentModes` inside `paymentModeConfig`.

## UPI

Control which UPI flows, apps, and instruments are available. A single `"type": "UPI"` object covers all UPI payment methods, you do not need separate entries for Intent, QR, and Collect.

### Parameters

Add an object with `"type": "UPI"` to `enabledPaymentModes` or `disabledPaymentModes`. All dimension fields are optional, omitting a field matches all values for that dimension.

| **Parameter** | **Type** | **Mandatory** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| `type` | string | Required | â | Must be `"UPI"`. |
| `flows` | array | Optional | All flows | Accepted values: `"INTENT"`, `"COLLECT"`, `"QR"`. |
| `apps` | array | Optional | All apps | Allowed apps (lowercase). See Supported Values. |
| `instruments` | array | Optional | All instruments | Accepted values: `"BANK_ACCOUNT"`, `"RUPAY_CC"`, `"CREDIT_LINE"`. |

Note:

- `apps` values are case-sensitive and must be lowercase (for example, âphonepeâ, âgpayâ). Uppercase values will not match.
- Only the first `"type": "UPI"` constraint in the list is processed. If you include multiple UPI objects, only the first takes effect.

### How Dimensions Interact

All fields within the UPI constraint are evaluated with AND logic. A UPI payment option is shown only when it matches every specified dimension.

| **flows** | **apps** | **instruments** | **Resulting Behavior** |
| --- | --- | --- | --- |
| `["INTENT"]` | `["gpay"]` | `["BANK_ACCOUNT"]` | GPay intent payments from a bank account *only*. |
| `["INTENT"]` | `["gpay"]` | *(omitted)* | GPay intent payments using *any* instrument. |
| `["INTENT"]` | *(omitted)* | *(omitted)* | All apps and instruments via intent flow |
| *(omitted)* | `["phonepe"]` | *(omitted)* | PhonePe via *any* flow (intent, collect, QR). |
| *(omitted)* | *(omitted)* | [âBANK\_ACCOUNTâ] | All apps and flows, but bank account instrument only. |

### Configuration Examples

#### 1. Allow PhonePe intent only

Show only the PhonePe UPI intent option. All other UPI apps, QR, and Collect are hidden.

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
      "version": "V2",
      "enabledPaymentModes": [
        {
          "type": "UPI",
          "flows": ["INTENT"],
          "apps": ["PhonePe"]
        }
      ]
    }
  }
}
```

#### 2. Allow QR only

Show only the UPI QR code option. Intent and Collect flows are hidden.

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
      "version": "V2",
      "enabledPaymentModes": [
        {
          "type": "UPI",
          "flows": ["QR"]
        }
      ]
    }
  }
}
```

#### 3. Block Credit Line instruments

Allow all UPI flows and apps, but exclude UPI Credit Line (BNPL/credit-based UPI instruments).

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
      "version": "V2",
      "disabledPaymentModes": [
        {
          "type": "UPI",
          "instruments": ["CREDIT_LINE"]
        }
      ]
    }
  }
}
```

#### 5. Allow PhonePe and GPay, all flows

Show only PhonePe and GPay across all UPI flows (intent, collect, QR). All other UPI apps are hidden.

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
      "version": "V2",
      "disabledPaymentModes": [
        {
          "type": "UPI"
        }
      ]
    }
  }
}
```

#### 4. Disable UPI entirely

Block all UPI payment options. All other enabled payment methods remain available.

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
      "version": "V2",
      "enabledPaymentModes": [
        {
          "type": "UPI",
          "apps": ["phonepe", "gpay"]
        }
      ]
    }
  }
}
```

Note: Omitting all dimension fields (`flows`, `apps`, `instruments`) in `disabledPaymentModes` disables all UPI options entirely.

## Card

Use theÂ `CARD`Â constraint to control which card types, networks, variants, and geographies are available to your customers. You can allow or block combinations across all four dimensions.

**Important:**Â Disabling theÂ `CARD`Â payment mode also disables EMI options, since EMI is processed through the card payment flow. If you want to disable only EMI while keeping cards active, use theÂ `EMI`Â constraint instead.

### Parameters

Add an object withÂ `"type": "CARD"`Â toÂ `enabledPaymentModes`Â orÂ `disabledPaymentModes`. All dimension fields are optional, omitting a field matches all values for that dimension.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | â | Must beÂ `"CARD"`. |
| `types` | array of strings | Optional | All types | Card types to allow or block. Accepted values:Â `"CREDIT_CARD"`,Â `"DEBIT_CARD"`. |
| `networks` | array of strings | Optional | All networks | Card networks to allow or block. Accepted values:Â `"VISA"`,Â `"MASTER_CARD"`,Â `"RUPAY"`,Â `"AMEX"`,Â `"DINERS_CLUB"`. |
| `variants` | array of strings | Optional | All variants | Card tier to allow or block. Accepted values:Â `"CONSUMER"`,Â `"PREMIUM"`,Â `"SUPER_PREMIUM"`,Â `"CORPORATE"`. |
| `geoScopes` | array of strings | Optional | All geographies | Card issuing geography to allow or block. Accepted values:Â `"DOMESTIC"`,Â `"INTERNATIONAL"`. |

### How Dimensions Interact

All fields within the card constraint are evaluated with AND logic. A card is shown only when it matches every specified dimension.

| `types` | `networks` | `variants` | `geoScopes` | Result |
| --- | --- | --- | --- | --- |
| `["CREDIT_CARD"]` | `["VISA"]` | *(omitted)* | `["DOMESTIC"]` | Domestic Visa credit cards (all variants) |
| `["DEBIT_CARD"]` | `["RUPAY"]` | *(omitted)* | *(omitted)* | All RuPay debit cards |
| *(omitted)* | *(omitted)* | `["CORPORATE"]` | *(omitted)* | All corporate cards (credit and debit, any network) |
| `["CREDIT_CARD"]` | `["VISA", "MASTER_CARD"]` | `["CONSUMER", "PREMIUM"]` | `["DOMESTIC"]` | Domestic Visa/Mastercard consumer and premium credit cards |
| *(omitted)* | *(omitted)* | *(omitted)* | `["INTERNATIONAL"]` | All international cards |

### Card Variant Tiers

| Variant | Description |
| --- | --- |
| `CONSUMER` | Standard consumer cards for everyday personal use |
| `PREMIUM` | Premium consumer cards with rewards and lifestyle benefits |
| `SUPER_PREMIUM` | Super-premium cards (Signature, Infinite, World Elite tier) |
| `CORPORATE` | Corporate or business expense cards |

### Examples

#### 1. Allow domestic Visa and Mastercard credit cards only

Show only domestic Visa and Mastercard credit cards. Debit cards, international cards, RuPay, Amex, and Diners Club are hidden.

#### 2. Block international cards

Allow all domestic cards; block all international cards.

#### 3. Allow domestic debit cards only

Show only domestic debit cards across all networks.

#### 4. Allow corporate cards only

Show only corporate cards (useful for B2B invoicing flows where only corporate expense cards are expected).

#### 5. Disable cards entirely

Block all card payments. Note that this also disables all EMI options.

**Important:**Â DisablingÂ `CARD`Â with an empty constraint (no dimension fields) blocks all card payments and all EMI options.

## NetBanking

Use theÂ `NET_BANKING`Â constraint to control which banks are available for retail net banking payments. You can allowlist(`enabledPaymentModes`) a specific set of banks or blocklist(`disabledPaymentModes`) certain banks while keeping all others available.

### Parameters

Add an object withÂ `"type": "NET_BANKING"`Â toÂ `enabledPaymentModes`Â orÂ `disabledPaymentModes`.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | â | Must beÂ `"NET_BANKING"`. |
| `banks` | array of strings | Optional | All banks | Bank codes to allow or block. Omit to match all supported banks. SeeÂ Supported Values and Bank CodesÂ for the full list. |

**Note:**Â

- Bank codes are uppercase identifiers (for example,Â `"HDFC"`,Â `"ICIC"`,Â `"SBIN"`). See the Supported Values page for the complete list.
- Only the firstÂ `"type": "NET_BANKING"`Â constraint in the list is processed. If you include multiple net banking objects, only the first takes effect.

### Examples

#### 1. Allow specific banks only

Show only HDFC, ICICI, and SBI for net banking. All other banks are hidden.

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
      "version": "V2",
      "enabledPaymentModes": [
        {
          "type": "NET_BANKING",
          "banks": ["HDFC", "ICIC", "SBIN"]
        }
      ]
    }
  }
}
```

#### 2. Block specific banks

Allow all banks except Axis Bank and Yes Bank.

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
      "version": "V2",
      "disabledPaymentModes": [
        {
          "type": "NET_BANKING",
          "banks": ["UTIB", "YESB"]
        }
      ]
    }
  }
}
```

#### 3. Disable net banking entirely

Block all net banking options. All other enabled payment methods remain available.

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
      "version": "V2",
      "disabledPaymentModes": [
        {
          "type": "NET_BANKING"
        }
      ]
    }
  }
}
```

**Note:**Â OmittingÂ `banks`Â entirely inÂ `disabledPaymentModes`Â disables all net banking options.

## Corporate Net Banking

Use theÂ `CORPORATE_NET_BANKING`Â constraint to control which banks are available for corporate net banking payments. This is separate from retail NetBanking and use this mode for B2B or corporate payment flows.

**Note:**Â Corporate net banking uses the same bank codes as retail net banking. The only difference is theÂ `type`Â value:Â `"CORPORATE_NET_BANKING"`Â instead ofÂ `"NET_BANKING"`.

### Parameters

Add an object withÂ `"type": "CORPORATE_NET_BANKING"`Â toÂ `enabledPaymentModes`Â orÂ `disabledPaymentModes`.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | â | Must beÂ `"CORPORATE_NET_BANKING"`. |
| `banks` | array of strings | Optional | All banks | Corporate bank codes to allow or block. Omit to match all supported banks. SeeÂ Supported Values â Bank CodesÂ for the full list. |

**Note:**Â Only the firstÂ `"type": "CORPORATE_NET_BANKING"`Â constraint in the list is processed. If you include multiple corporate net banking objects, only the first takes effect.

### Examples

#### 1. Allow specific corporate banks only

Show only HDFC and ICICI for corporate net banking. All other corporate banking options are hidden.

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
      "version": "V2",
      "enabledPaymentModes": [
        {
          "type": "CORPORATE_NET_BANKING",
          "banks": ["HDFC", "ICIC"]
        }
      ]
    }
  }
}
```

#### 2. Disable corporate net banking entirely

Block all corporate net banking options. Retail net banking is not affected.

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
      "version": "V2",
      "disabledPaymentModes": [
        {
          "type": "CORPORATE_NET_BANKING"
        }
      ]
    }
  }
}
```

## EMI

Use theÂ `EMI`Â constraint to control which EMI instrument types are available. You can disable EMI entirely or restrict it to specific instrument types.

**Important:**Â EMI is automatically disabled when you disable theÂ `CARD`Â payment mode. If you want to disable only EMI while keeping card payments active, use thisÂ `EMI`Â constraint explicitly.

### Parameters

Add an object withÂ `"type": "EMI"`Â toÂ `enabledPaymentModes`Â orÂ `disabledPaymentModes`.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | â | Must beÂ `"EMI"`. |
| `types` | array of strings | Optional | All types | EMI instrument types to allow or block. Omit to match all types. Currently supported value:Â `"CREDIT_CARD"`. |

**Note:**Â Only the firstÂ `"type": "EMI"`Â constraint in the list is processed. If you include multiple EMI objects, only the first takes effect.

### Examples

#### 1. Disable EMI entirely

Block all EMI payment options while keeping card payments available.

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
      "version": "V2",
      "enabledPaymentModes": [
        {
          "type": "UPI",
          "flows": ["QR"]
        }
      ]
    }
  }
}
```0

#### 2. Allow credit card EMI only

Restrict EMI to credit card instruments only.

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
      "version": "V2",
      "enabledPaymentModes": [
        {
          "type": "UPI",
          "flows": ["QR"]
        }
      ]
    }
  }
}
```1

## Wallet

Use theÂ `WALLET`Â constraint to control which wallet providers are available to your customers. You can disable wallets entirely or restrict to specific providers.

### Parameters

Add an object withÂ `"type": "WALLET"`Â toÂ `enabledPaymentModes`Â orÂ `disabledPaymentModes`.

| Parameter | Type | Mandatory | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Required | â | Must beÂ `"WALLET"`. |
| `wallets` | array of strings | Optional | All wallets | Wallet providers to allow or block. Omit to match all supported providers. Currently supported value:Â `"PHONEPE"`. |

**Note:**Â Only the firstÂ `"type": "WALLET"`Â constraint in the list is processed. If you include multiple wallet objects, only the first takes effect.

### Examples

#### 1. Disable wallet entirely

Block all wallet payment options. All other enabled payment methods remain available.

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
      "version": "V2",
      "enabledPaymentModes": [
        {
          "type": "UPI",
          "flows": ["QR"]
        }
      ]
    }
  }
}
```2

#### 2. Allow PhonePe wallet only

Restrict wallet payments to PhonePe only.

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
      "version": "V2",
      "enabledPaymentModes": [
        {
          "type": "UPI",
          "flows": ["QR"]
        }
      ]
    }
  }
}
```3

## Whatâs Next?

Head over to the next section to understand the V1 schema forÂ `paymentModeConfig`.
