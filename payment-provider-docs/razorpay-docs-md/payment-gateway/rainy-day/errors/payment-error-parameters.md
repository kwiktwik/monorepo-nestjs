<!-- Source: https://razorpay.com/docs/payments/payment-gateway/rainy-day/errors/payment-error-parameters -->

There are certain error codes specific for each payment method supported by Razorpay. To understand the errors and their `reasons`, it is recommended to know the `source` (stakeholders) and the `steps` involved in the payment flows:

- [Cards](/razorpay-docs-md/payment-gateway/rainy-day/errors/payment-error-parameters.md#cards)
- [UPI](/razorpay-docs-md/payment-gateway/rainy-day/errors/payment-error-parameters.md#upi)
- [Netbanking](/razorpay-docs-md/payment-gateway/rainy-day/errors/payment-error-parameters.md#netbanking)
- [Wallet](/razorpay-docs-md/payment-gateway/rainy-day/errors/payment-error-parameters.md#wallet)
- [Cardless EMI](/razorpay-docs-md/payment-gateway/rainy-day/errors/payment-error-parameters.md#cardless-emi)

## Cards

The payment flow for **Card** payments is illustrated below.

![Errors Payment Methods Cards](https://razorpay.com/docs/payments/payment-gateway/rainy-day/errors/build/browser/assets/images/payment-flow-card.jpg)

Source Parameter

Step Parameter

The possible values for the `source` parameter for cards are listed below:

- `customer`
- `business`
- `internal`
- `gateway`
- `issuer_bank`

## UPI

**UPI** payments can be made using the following:

Intent Flow

The payment flow for UPI Intent payments is illustrated below.

![](https://razorpay.com/docs/payments/payment-gateway/rainy-day/errors/build/browser/assets/images/payment-flow-upi_intent.jpg)

Source Parameter

Step Parameter

The possible values for the `source` parameter for both collect and intent flows in UPI are as follows:

- `customer`
- `business`
- `internal`
- `customer_psp`
- `gateway`
- `network`
- `issuer_bank`
- `beneficiary_bank`

Collect Flow

The payment flow for UPI Collect payments is illustrated below.

![](https://razorpay.com/docs/payments/payment-gateway/rainy-day/errors/build/browser/assets/images/payment-flow-upi_collect.jpg)

Source Parameter

Step Parameter

The possible values for the `source` parameter for both collect and intent flows in UPI are as follows:

- `customer`
- `business`
- `internal`
- `customer_psp`
- `gateway`
- `network`
- `issuer_bank`
- `beneficiary_bank`

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-methods/upi/upi-intent.md)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/standard-integration/)  .

## Netbanking

The payment flow for **Netbanking** payments is illustrated below:

![Errors Payment Methods Netbanking](https://razorpay.com/docs/payments/payment-gateway/rainy-day/errors/build/browser/assets/images/payment-flow-netbanking.jpg)

Source Parameter

Step Parameter

The possible values for the `source` parameter for netbanking are listed below:

- `customer`
- `business`
- `internal`
- `issuer_bank`

## Wallet

The payment flow for **Wallet** payments is illustrated below:

![Errors Payment Methods Wallets](https://razorpay.com/docs/payments/payment-gateway/rainy-day/errors/build/browser/assets/images/payment-flow-wallet.jpg)

The payment flow for **Wallet** payments is illustrated below:

![Errors Payment Methods Wallets](https://razorpay.com/docs/payments/payment-gateway/rainy-day/errors/build/browser/assets/images/payment-flow-wallet.jpg)

Source Parameter

Step Parameter

The possible values for the `source` parameter for wallet are listed below:

- `customer`
- `business`
- `internal`
- `issuer`

## Cardless EMI

The payment flow for **Cardless EMI** payments is illustrated below:

![Errors Payment Methods Cardless EMI](https://razorpay.com/docs/payments/payment-gateway/rainy-day/errors/build/browser/assets/images/payment-flow-cardless_emi.jpg)

Source Parameter

Step Parameter

The possible values for the `source` parameter for Cardless EMI flow are:

- `customer`
- `business`
- `internal`
- `network`
- `issuer`

### Related Information

To understand the error codes, refer to the [Error Codes](/docs/errors/) section.

For the list of reasons, refer to the [Error Reasons](/docs/errors/) section.
