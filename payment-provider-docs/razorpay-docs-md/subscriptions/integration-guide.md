<!-- Source: https://razorpay.com/docs/payments/subscriptions/integration-guide -->

Check the prerequisites and steps to integrate Razorpay Subscriptions:

## Prerequisites

- Create a Razorpay account.
- Log in to the Dashboard and [generate the API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)  . You need to use these keys while using our APIs and Checkout.

## Integration Steps

Follow these steps to integrate Razorpay Subscriptions:

#### 1. Build Integration

Create Plan, Subscription and integrate with Standard Checkout.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-live Checklist

Check the go-live checklist.

### 1. Build Integration

Follow these steps to create plans, subscriptions and accept payments from customers.

Step 1.1 Create a Plan

A Plan is a foundation on which a Subscription is built. It acts as a reusable template and contains details of the goods or services offered with the amount to be charged and the frequency at which the customer should be charged (billing cycle). Depending on your business, you can create multiple Plans with different billing cycles and pricing.

- Create a Plan before creating a Subscription using your checkout.
- Create Plans from the [Dashboard](/razorpay-docs-md/subscriptions/create-plans.md#create-a-plan)

  or using [APIs](/razorpay-docs-md/api/payments/subscriptions/create-plan.md)  .

Step 1.2 Create a Subscription

A Subscription contains details like the Plan, the start date, total number of billing cycles, free [trial period](/razorpay-docs-md/subscriptions/create.md#trial-period)

(if any) and [upfront amount](/razorpay-docs-md/subscriptions/create.md#upfront-amount) to be collected.

Subscriptions can be created from the [Dashboard](/razorpay-docs-md/subscriptions/create-subscription-links.md#create-a-subscription-link-from-dashboard) or using [APIs](/razorpay-docs-md/api/payments/subscriptions/create-subscription.md).

Step 1.3 Integrate With Standard Checkout

After you create a Subscription, you need the customer's permission to charge their card at periodic intervals. For this, the customer has to complete an authentication/authorisation transaction.

#### Authentication Transaction

You can collect the authorisation transaction by passing the subscription\_id along with the other options to the Razorpay Standard Checkout.

Once the authorisation transaction is successful, Razorpay returns the `razorpay_payment_id`, `razorpay_subscription_id` and the `razorpay_signature`.

Code to Add Pay Button

Use the sample code to initiate Razorpay Standard Checkout. Check the [list of checkout parameters](/razorpay-docs-md/payment-gateway/web-integration/standard/integration-steps.md#123-checkout-options).

Checkout with Callback URLCheckout with Handler functionFailure response

copy

```javascript
<button id = "rzp-button1">Pay</button>
		<script src = "https://checkout.razorpay.com/v1/checkout.js"></script>
		<script>
			var options = {
				"key": "key_id",
				"subscription_id": "sub_00000000000001",
				"name": "Acme Corp.",
				"description": "Monthly Test Plan",
				"image": "/your_logo.jpg",
				"callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
				"prefill": {
					"name": "Gaurav Kumar",
					"email": "gaurav.kumar@example.com",
					"contact": "+919876543210"
				},
				"notes": {
					"note_key_1": "Tea. Earl Grey. Hot",
					"note_key_2": "Make it so."
				},
				"theme": {
					"color": "#F37254"
				}
			};
			var rzp1 = new Razorpay(options);
			document.getElementById('rzp-button1').onclick = function(e) {
				rzp1.open();
				e.preventDefault();
			}
			</script>
```

Failure Reasons and Next Steps

Payment Verification

This is a mandatory step that allows you to confirm the authenticity of the card details returned to the Checkout form for successful payments.

To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `subscription_id` to construct an HMAC hex digest as shown below:

   Code

   copy

   ```html
generated_signature = hmac_sha256(razorpay_payment_id + "|" + subscription_id, secret);

if (generated_signature == razorpay_signature) {
payment is successful
}
```
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

### 2. Test Integration

You can test the integration by making a test payment using our cards:

### 3. Follow Go-live Checklist

Consider the following steps before taking your integration live.

Switch Test API Keys With Live API Keys

After confirming if your integration is working successfully, you can take the integration live by switching the Test Mode API Keys with the Live Mode Keys.

Watch this video to know how to generate Live API keys:

Subscribe to Webhooks [Set up Razorpay Webhooks](/docs/webhooks/setup-edit-payments/) to configure and receive notifications when a specific event occurs. When one of these events is triggered, we send an HTTP POST payload in JSON to the webhook's configured URL. Subscribe to these [Subscriptions webhook events](/razorpay-docs-md/subscriptions/subscribe-to-webhooks.md#webhook-events-and-descriptions).

## Best Practices

Follow the best practices for a smooth Subscriptions integration.

- [Verify Payments](/razorpay-docs-md/subscriptions/integration-guide.md#payment-verification)

  : Verify the received payments to confirm the authenticity of the mandate details returned to the Checkout form for successful payments.
- [Implement Webhooks](/razorpay-docs-md/subscriptions/integration-guide.md#subscribe-to-webhooks)

  : Implement Razorpay Webhooks to receive notifications on various events of Subscriptions.

### Related Information

- [Subscriptions API](/razorpay-docs-md/api/payments/subscriptions.md)
- [Razorpay Standard Checkout](/razorpay-docs-md/payment-gateway/web-integration/standard.md)
