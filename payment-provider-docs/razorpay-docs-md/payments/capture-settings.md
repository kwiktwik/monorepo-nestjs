<!-- Source: https://razorpay.com/docs/payments/payments/capture-settings -->

When a customer makes an online payment, it usually flows through different states. Know more about [payment states](/razorpay-docs-md/payments.md#payment-life-cycle).

By default, once your customer completes a payment, it is automatically moved to the `captured` state.

However, the payment can remain in the `authorized` state in the following scenarios:

- **Late authorization**
  Due to external factors such as network issues or technical errors, Razorpay may not immediately receive payment status from the bank. In this case, Razorpay polls the APIs intermittently for 3 days to check the status. If we receive the payment status as successful, the payment is moved to the `authorized` state. Know more about [late authorization](/razorpay-docs-md/payments/late-authorisation.md)  .
- **Specific business use case**
  Some businesses such as those in the Ecommerce industry, may retain the payment in the `authorized` state and later move them to the `captured` state.

**Watch Out!**

- For **Direct Settlement** merchants, payments will be auto-captured irrespective of the configuration.
- You must ensure that all payments in the authorized state are moved to the captured state within 3 days of creation. This is mandatory because payments that are not captured within this period will be refunded automatically to customers.

You can configure **Payment Capture settings** on the Dashboard. You can choose to:

- [Auto-capture all payments](/razorpay-docs-md/payments/capture-settings.md#auto-capture-all-payments)
- [Auto-capture with set timeouts](/razorpay-docs-md/payments/capture-settings.md#auto-capture-with-custom-timeouts)
- [Manually capture timeout](/razorpay-docs-md/payments/capture-settings.md#manual-capture-timeout)

## Payment Capture Settings

**Handy Tips**

- Only the Razorpay account owner can configure payment capture settings on the Dashboard.
- Payment Capture settings are applicable only for payments created using the Orders API.

## Auto-capture All Payments

You can use this setting to capture all `authorized` payments automatically. This eliminates the time and effort spent manually capturing payments. **This is the default setting for all customers.**

![ Auto-capture all payments process flow](https://razorpay.com/docs/payments/payments/build/browser/assets/images/payment-capture-auto-capture-all-payments.jpg)

Watch this video to know how to set up the **Automatic Capture** option.

To auto-capture all `authorized` payments:

1. Log in to the Dashboard.
2. Navigate to the **Account & Settings** option and scroll to the **Payments Capture** option.
3. Click the **Change** button next to **Automatic Capture**.
4. Under **Automatic Capture**, click the drop-down and select the time period in the **Capture all payments authorised within** field. For example, 3 days.
5. Click **Next**.
6. Select **Refund Automatically** and click **Next**.
7. Select Normal Refund as the **Refund Speed**.
8. Click **Save**.

## Auto-capture With Custom Timeouts

Once the payment is `created`, you can:

- Auto-capture payments that are `authorized` within a certain time period, and
- Manually capture payments that are `authorized` after that time period.

You can do this by setting up custom timeouts for automatic and manual capture.

### Auto-capture Timeout

Let us say you only want to auto-capture payments that are `authorized` within 3 days from creation.

![Auto Capture Timeout process flow](https://razorpay.com/docs/payments/payments/build/browser/assets/images/payment-capture-auto-capture-timeout.jpg)

Watch this video to see how to set up the **Automatic Capture with Timeout** option.

### Auto-capture + Manual Capture Timeouts

Let us say you want to:

- Auto-capture payments that are `authorized` within 2 days from creation.
- Manually capture payments that are `authorized` within 3 days from creation.

![Auto and Manual Capture Timeout process flow](https://razorpay.com/docs/payments/payments/build/browser/assets/images/payment-capture-auto-capture-and-manual-capture-timeouts.jpg)

Watch this video to see how to set up the **Automatic and Manual Capture with Timeout** option.

To configure capture settings:

1. Log in to your Dashboard.
2. Navigate to the **Account & Settings** option and scroll to the **Payments Capture** option.
3. Click the **Change** button next to **Automatic Capture**.
4. Under **Automatic Capture**, click the drop-down and select the time period in the **Capture all payments authorised within** field. For example, 2 days.
5. Click **Next**.
6. Select **Capture manually via dashboard or API**.
7. Click the drop-down and select the time period in the **Capture payments manually authorised within** field. For example, 3 days.
8. Click **Next**.
9. Select Normal Refund as the **Refund Speed**.
10. Click **Save**.

## Manually Capture Payments

You can use this setting to capture `authorized` payments manually.

**Watch Out!**

Manual capture of payments is not supported on [bank transfer](/razorpay-docs-md/payment-methods/bank-transfer.md). All bank transfer payments are auto-captured.

### Manual Capture Timeout

Let us say you only want to manually capture payments that are `authorized` within 3 days from creation. To do this, you should set the manual capture timeout as 3 days.

![Manual Capture Timeout process flow](https://razorpay.com/docs/payments/payments/build/browser/assets/images/payment-capture-manual-capture-only.jpg)

Watch this video to set up the **Manual Capture** option.

To set up the manual capture:

1. Log in to the Dashboard.
2. Navigate to the **Account & Settings** option and scroll to the **Payments Capture** option.
3. Click the **Change** button next to **Automatic Capture**.
4. Select the **Manual Capture** option.
5. Set the manual capture timeout to 3 days and click **Next**.
6. Select Normal Refund as the **Refund Speed**.
7. Click **Save**.

You can manually capture payments in the `authorized` state using our [Capture API](/razorpay-docs-md/api/payments.md#capture-a-payment) or from the [Dashboard](/razorpay-docs-md/payments/dashboard.md#manual-capture-of-payments). All payments that are not captured within the manual timeout period will be auto-refunded.

## Configure Payment Capture Settings Using Orders API

Capture values passed in the [Orders API](/razorpay-docs-md/payments/capture-settings/api.md) take precedence over the Payment Capture settings configured on the Dashboard. You can use this to change the capture settings for individual payments.

### Related Information

- [How Payment Gateway Works](/razorpay-docs-md/payment-gateway/how-it-works.md)
- [Payment States](/razorpay-docs-md/payments.md)
- [Refunds](/razorpay-docs-md/refunds.md)
- Manually capture payments in the `authorized` state using the [Capture API](/razorpay-docs-md/api/payments.md#capture-a-payment)

  or from the [Dashboard](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)
- [Set up and Subscribe to Webhook events](/docs/webhooks/setup-edit-payments/)
