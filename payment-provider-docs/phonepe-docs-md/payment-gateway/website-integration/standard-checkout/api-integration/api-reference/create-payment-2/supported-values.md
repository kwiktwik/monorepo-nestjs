<!-- Source: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment-2/supported-values -->

# Supported Values

---

This page is a complete reference of all accepted values for payment mode configuration fields. Use these values verbatim in your API requests and they are case-sensitive.

## UPI

### UPI Flows (`flows`)

| Value | Description |
| --- | --- |
| `INTENT` | UPI intent flow — customer taps to pay in their UPI app |
| `COLLECT` | UPI collect flow — customer enters their UPI ID to receive a payment request |
| `QR` | UPI QR code flow — customer scans a QR code with their UPI app |

### UPI Apps (`apps`)

**Note:** All `apps` values are lowercase.

| Value | App Name |
| --- | --- |
| `phonepe` | PhonePe |
| `gpay` | Google Pay |
| `paytm` | Paytm |
| `bhim` | BHIM |
| `amazon` | Amazon Pay |
| `cred` | CRED |
| `supermoney` | SuperMoney |
| `others` | All other UPI-compliant apps not listed above |

**Note:** Use `"others"` to represent any UPI app not explicitly listed. Including `"others"` in an allowlist enables all unlisted UPI apps.

### UPI Instruments (`instruments`)

| Value | Description |
| --- | --- |
| `BANK_ACCOUNT` | Standard UPI bank account linked to the customer’s UPI ID |
| `RUPAY_CC` | RuPay credit card linked to UPI |
| `CREDIT_LINE` | UPI credit line instruments (BNPL, pay-later products) |

## Cards

### Card Types (`types`)

| Value | Description |
| --- | --- |
| `CREDIT_CARD` | Credit cards |
| `DEBIT_CARD` | Debit cards |

### Card Networks (`networks`)

| Value | Network Name |
| --- | --- |
| `VISA` | Visa |
| `MASTER_CARD` | Mastercard |
| `RUPAY` | RuPay |
| `AMEX` | American Express |
| `DINERS_CLUB` | Diners Club |

**Note:** `MASTER_CARD` is spelled with an underscore. Using `"MASTERCARD"` (no underscore) will not be recognized.

### Card Variants (`variants`)

| Value | Description |
| --- | --- |
| `CONSUMER` | Standard consumer cards for everyday personal use |
| `PREMIUM` | Premium consumer cards with rewards and lifestyle benefits |
| `SUPER_PREMIUM` | Super-premium cards (Signature, Infinite, World Elite tier) |
| `CORPORATE` | Corporate or business expense cards |

### Geographic Scopes (`geoScopes`)

| Value | Description |
| --- | --- |
| `DOMESTIC` | Cards issued by Indian banks |
| `INTERNATIONAL` | Cards issued by banks outside India |

## Net Banking

### Bank Codes (`banks`)

| Code | Bank Name |
| --- | --- |
| `HDFC` | HDFC Bank |
| `ICIC` | ICICI Bank |
| `SBIN` | State Bank of India |
| `UTIB` | Axis Bank |
| `KKBK` | Kotak Mahindra Bank |
| `PUNB` | Punjab National Bank |
| `BKID` | Bank of India |
| `CNRB` | Canara Bank |
| `FDRL` | Federal Bank |
| `IOBA` | Indian Overseas Bank |
| `ORBC` | Oriental Bank of Commerce |
| `SIBL` | South Indian Bank |
| `UBIN` | Union Bank of India |
| `VIJB` | Vijaya Bank |
| `YESB` | Yes Bank |
| `BARB` | Bank of Baroda |
| `CBIN` | Central Bank of India |
| `INDB` | IndusInd Bank |
| `IDFB` | IDFC First Bank |
| `JAKA` | Jammu & Kashmir Bank |
| `KVBL` | Karur Vysya Bank |
| `NKGS` | NKGSB Co-operative Bank |
| `SRCB` | Saraswat Co-operative Bank |
| `TMBL` | Tamilnad Mercantile Bank |
| `UCOBANK` | UCO Bank |
| `ALLA` | Allahabad Bank |
| `ANDB` | Andhra Bank |
| `CORP` | Corporation Bank |
| `DCBL` | DCB Bank |
| `ESFB` | Equitas Small Finance Bank |
| `IBKL` | IDBI Bank |
| `IDBI` | IDBI Bank (alternate code) |
| `LAVB` | Lakshmi Vilas Bank |
| `MAHB` | Bank of Maharashtra |
| `MSNU` | Mehsana Urban Co-operative Bank |
| `NICB` | New India Co-operative Bank |
| `RATN` | RBL Bank |
| `RNSB` | Rajkot Nagarik Sahakari Bank |
| `SCBL` | Standard Chartered Bank |
| `STBP` | Punjab & Sind Bank |
| `SYNB` | Syndicate Bank |
| `TBSB` | Thane Bharat Sahakari Bank |
| `TJSB` | TJSB Sahakari Bank |
| `TNSC` | Tamil Nadu State Apex Co-operative Bank |
| `UTKS` | Uttarakhand Gramin Bank |
| `WBSC` | West Bengal State Co-operative Bank |
| `PSIB` | Punjab & Sind Bank (alternate code) |

**Note:** The same bank codes apply to both `NET_BANKING` and `CORPORATE_NET_BANKING` constraints.

## EMI

### EMI Instrument Types (`types`)

| Value | Description |
| --- | --- |
| `CREDIT_CARD` | EMI via credit card (currently the only supported instrument type) |

**Note:** Additional EMI instrument types may be added in future releases. Omit the `types` field to automatically match all currently and future supported types.

## Wallet

### Wallet Providers (`wallets`)

| Value | Provider Name |
| --- | --- |
| `PHONEPE` | PhonePe Wallet |

**Note:** Additional wallet providers may be added in future releases. Omit the `wallets` field to automatically match all currently and future supported providers.
