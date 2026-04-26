<!-- Source: https://razorpay.com/docs/payments/dashboard/account-settings/capture-refund -->

You can accept online payments from your customers. When a customer makes a payment, it usually flows through different [payment states](/razorpay-docs-md/payments.md#payment-life-cycle). Check how to [capture payments](/razorpay-docs-md/dashboard/account-settings/capture-refund.md#payment-capture-settings) and [set refunds](/razorpay-docs-md/dashboard/account-settings/capture-refund.md#choose-refund-speed).

## Payments in Authorised state

By default, once your customer completes a payment, it is automatically moved to the `captured` state. However, the payment can remain in the `authorized` state in the following scenarios:

- **Late authorization**: Due to external factors such as network issues or technical errors, Razorpay may not immediately receive payment status from the bank. In this case, Razorpay polls the APIs intermittently for 3 days to check the status. If we receive the payment status as successful, the payment is moved to the `authorized` state. Know more about [late authorization](/razorpay-docs-md/payments/late-authorisation.md)  .
- **Specific business use case**: Some businesses such as those in the Ecommerce industry, may retain the payment in the `authorized` state and later move them to the `captured` state.

**Watch Out!**

- For businesses which have the **Direct Settlement** feature enabled, payments will be auto-captured irrespective of the configuration.
- You must ensure that all payments in the authorized state are moved to the captured state within 3 days of creation. This is mandatory because payments that are not captured within this period will be refunded automatically to customers.

## Payment Capture Settings

You can configure **Payment Capture settings** on the Dashboard. You can choose to:

- [Auto-capture all payments](/razorpay-docs-md/payments/capture-settings.md#auto-capture-all-payments)
- [Auto-capture with set timeouts](/razorpay-docs-md/payments/capture-settings.md#auto-capture-with-custom-timeouts)
- [Manually capture timeout](/razorpay-docs-md/payments/capture-settings.md#manual-capture-timeout)

## Choose Refund Speed

You can make Normal Refunds or Instant Refunds. You can also issue refunds in batches. Know more about [Refunds](/razorpay-docs-md/refunds.md).

1. Log in to the Dashboard.
2. Click **Account & Settings**.
3. Click **Capture and refund settings** under **Payments and refunds**.
4. You can choose the type of refund you wish to make a default setting.
