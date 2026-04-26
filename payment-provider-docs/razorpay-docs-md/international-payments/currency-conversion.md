<!-- Source: https://razorpay.com/docs/payments/international-payments/currency-conversion -->

Razorpay Settlements occur in INR based on the conversion rate at the time of payment.

## Checkout Form and APIs

On the checkout form or when using APIs for Razorpay products such as Orders, Payment Links, Subscriptions or Invoices, you need to specify the desired currency and pass the amount in the currency subunit.

Sample Code

The following is a sample API request and response to create an order for $20:

RequestJavaPythonPHPRubyNode.js.NETResponse

copy

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/orders \
-H "content-type: application/json"
-d '{
  "amount": 2000,
  "currency": "USD",
  "receipt": "rcptid #11"
  }'
```

currency

mandatory

`string` Currency in which you want to accept the payment. For example, `GBP`. Check the [supported international currencies.](/razorpay-docs-md/international-payments.md#supported-products-and-currencies) amount

mandatory

`integer` The amount to be charged in the specified currency subunit.

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

For example, when selling a product for ₹1,000 in the domestic market, you pass INR in the `currency` parameter and `100000` in the `amount` parameter (since the amount should be in sub units).

When selling in the international market, you might want to charge $20 for the same product. In this case, you must pass `USD` in the `currency` parameter and `2000` in the `amount` parameter (since the amount should be in sub units).

Payment Entity

The [Payment entity](/razorpay-docs-md/api/payments.md#payment-entity) will contain additional fields when the currency is not INR to provide visibility into the conversion rate.

**Example**

The following is a sample payment entity for a $1 payment:

Payment Entity

copy

```json
{
  "id": "pay_Donb2t6WkJYhfU",
  "entity": "payment",
  "amount": 100,
  "currency": "USD",
  "base_amount": 7129,
  "base_currency": "",
  "status": "captured",
  "order_id": "order_CjCr5oKh4AVC51",
  "international": true,
  "method": "card",
  "amount_refunded": 0,
  "refund_status": null,
  "description": "Payment at the Dollar Store",
  "card_id": "card_Donb2wk8eC8EDN",
  "email": "gaurav.kumar@example.com",
  "contact": "+919876543210",
  "notes": [],
  "fee": 207,
  "tax": 0,
  "error_code": null,
  "error_description": null,
  "created_at": 1400826750
}
```

base\_currency

`string` The conversion currency that will be used to calculate fees and settlements. This currently defaults to INR and is present only if the `currency` is not INR.

base\_amount

`integer` The converted payment amount that will be used to calculate fees and settlements. Represented in the smallest unit of the `base_currency`. This attribute is currently only present if the `currency` is not INR.

## Select International Currency

When using products such as Payment Links or Subscription Links, ensure you select the desired currency from the currency drop-down list and add the amount in the selected currency. For example, if you want to charge $20 when selling in the international market, select `USD` in the **Currency** drop-down list and enter 20 in the **Amount** field.

Watch this video to see how to select the international currency from the Dashboard.

![Select the international currency from the Razorpay Dashboard](https://razorpay.com/docs/payments/international-payments/build/browser/assets/images/select-international-currency-dashboard.gif)

## Settlements

After your customers have made the payment, the payment amount is converted to INR and settled to your Razorpay Payment Gateway (PG) account as per your settlement schedule. The exchange rate (according to the processing bank) on the date the payment was made is used to make the conversion.

#### Example

A customer made a payment of $10 on February 02, 2019.

- **Settlement Schedule**: T+7 business days for domestic transactions, where T is the date of capture of payment.
- **Date of payment capture**: February 02, 2019
- **Conversion Rate**: $1 = ₹70 as on February 02, 2019
- **Settlement Amount**: For $10 payment, $10 \* ₹70= 700 (minus taxes and fees) is settled to your account on February 09, 2019.
