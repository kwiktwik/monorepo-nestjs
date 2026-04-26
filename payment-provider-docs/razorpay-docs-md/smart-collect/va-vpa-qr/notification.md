<!-- Source: https://razorpay.com/docs/payments/smart-collect/va-vpa-qr/notification -->

All payments made using Smart Collect will show up on your Dashboard as well as in the usual payment response APIs.

## Webhooks

Payments made using Smart Collect will also trigger webhooks much like regular payments. To use webhooks, refer our [Webhooks](/docs/webhooks/) documentation.

### Event - Virtual Account Created

When a virtual account is created the `virtual_account.created` webhook event is fired. The payload is given below:

### Event - Virtual Account Credited

Payments made using Smart Collect are notified via the `virtual_account.credited` webhook event.

### Event - Virtual Account Closed

When a virtual account is closed the `virtual_account.closed` webhook event is fired. The payload is given below:

## Emails

You will also receive a `payment successful` notification email, as you do for regular payments.
