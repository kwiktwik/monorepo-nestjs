<!-- Source: https://razorpay.com/docs/payments/payment-methods/netbanking -->

You can accept payments from your customers using Netbanking. The customers enter their Netbanking credentials to make payments. This method is available by default. No additional integration or permissions are needed to enable this method at your application Checkout.

## Netbanking Payment Flow

The diagram given below represents the payment flow for netbanking:

![Payment Flow for Netbanking](https://razorpay.com/docs/payments/payment-methods/build/browser/assets/images/payment-flow-netbanking.jpg)

To pay using the Netbanking payment method, customers:

1. Select **Netbanking** as the payment method on the checkout page and choose their bank from the list of supported banks.
2. Are redirected to their bank's secure login page.
3. Enter their **Netbanking credentials (User ID and Password)** to authenticate.
4. Review the payment details and authorise the transaction.

![Payment Flow for Netbanking](https://razorpay.com/docs/payments/payment-methods/build/browser/assets/images/NB_Payment_Flow.gif)

After successful payment, customers are redirected back to your website or app with the payment confirmation.

Supported Platforms and Availability

## Supported Banks

List of supported banks:

**Watch Out!**

Allahabad Bank netbanking is merged with Indian Bank, and both the bank codes are supported.

## Fetch Supported Methods

Use the below endpoint to fetch a list of banks Razorpay supports for netbanking payments:

GET

/methods

**Watch Out!**

To fire this API, provide your [KEY\_ID] for authorization. Your `<KEY_SECRET>` is **NOT** required and should **NOT** be passed.

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID] \
    -X GET https://api.razorpay.com/v1/methods
```

## Third-Party Validation (TPV)

Use Third-Party Validation if your business model requires customers to register a bank account and use the registered account to make payments.

- [Third-Party Validation document](/razorpay-docs-md/third-party-validation.md)
- [List of banks that support TPV](/razorpay-docs-md/third-party-validation/bank-list.md)
