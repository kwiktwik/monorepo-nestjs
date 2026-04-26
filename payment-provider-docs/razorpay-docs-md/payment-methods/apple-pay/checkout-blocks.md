<!-- Source: https://razorpay.com/docs/payments/payment-methods/apple-pay/checkout-blocks -->

Razorpay Checkout Blocks is a client-side JavaScript SDK that enables businesses to offer express checkout experiences with digital wallets such as Apple Pay, Google Pay and more, directly on their own checkout page. The SDK abstracts the complexities of integrating individual wallet providers, allowing you to go live with single-click payments. Know more about [Razorpay Payments](/razorpay-docs-md/index.md).

Instead of redirecting customers to a Razorpay-hosted page, the SDK renders natively on your site, providing a seamless, single-click payment experience with no extra page loads or redirects.

Advantages

- Offer single-click express checkout with digital wallet. No redirects, no extra page loads.
- Support multiple wallet (Apple Pay, Google Pay and more) through a single, unified SDK.

How It Works

The Checkout Blocks SDK manages the full payment lifecycle for each supported wallet. At a high level:

1. Your Checkout page loads the Checkout Blocks SDK script.
2. The SDK dynamically loads only the wallet adapters you need (for example, Apple Pay, Google Pay).
3. You check wallet eligibility on the customer's device using `isSupported()`.
4. If eligible, render the payment button and call `initiatePayment()` on user click.
5. The SDK handles merchant validation, payment authorisation, DCC (if applicable) and completion.
6. Your page receives payment events (`onPaymentComplete`, `onError`) via callbacks.

No redirect to `api.razorpay.com` is required, the entire flow happens on your domain.

![Express checkout flow](https://razorpay.com/docs/payments/payment-methods/apple-pay/build/browser/assets/images/checkout-blocks-apple-pay-flow.jpg)

## Prerequisites

Before you begin the integration, ensure you have:

- **Active Razorpay Account**: A Razorpay account with payments enabled.
- **Order Creation via Backend**: Your server must be able to create orders using the [Orders API](/razorpay-docs-md/api/orders/create.md)

  and pass the `order_id` to the frontend.
- **HTTPS Protocol**: Your website must be served over HTTPS for security compliance. Digital wallet require a secure context.

**Handy Tips**

Razorpay manages all Apple Pay certificates and business verification on your behalf. You only need to host the domain association file.

## Integration Steps

Follow the steps given below to integrate Checkout Blocks and accept express checkout payments on your website.

**1.1** [Load the Checkout Blocks SDK](/razorpay-docs-md/payment-methods/apple-pay/checkout-blocks.md#11-load-the-checkout-blocks-sdk)

**1.2** [Create an Order](/razorpay-docs-md/payment-methods/apple-pay/checkout-blocks.md#12-create-an-order)

**1.3** [Initialise SDK and Check Wallet Eligibility](/razorpay-docs-md/payment-methods/apple-pay/checkout-blocks.md#13-initialise-sdk-and-check-wallet-eligibility)

**1.4** [Handle Payment Events](/razorpay-docs-md/payment-methods/apple-pay/checkout-blocks.md#14-handle-payment-events)

**1.5** [Verify Payment Signature](/razorpay-docs-md/payment-methods/apple-pay/checkout-blocks.md#15-verify-payment-signature)

**1.6** [Integrate Payments Rainy Day Kit](/razorpay-docs-md/payment-methods/apple-pay/checkout-blocks.md#16-integrate-payments-rainy-day-kit)

**1.7** [Verify Payment Status](/razorpay-docs-md/payment-methods/apple-pay/checkout-blocks.md#17-verify-payment-status)

### 1.1 Load the Checkout Blocks SDK

Add the Checkout Blocks SDK script to the `<head>` section of your Checkout page. The SDK exposes a global `RazorpayCheckoutBlocks` object that you use to interact with wallet.

Script Setup

Add the following to your HTML `<head>`:

HTML

copy

```html
<!-- Merchant adds preconnect in <head> -->
<link rel="preconnect" href="https://checkout.razorpay.com">
<link rel="dns-prefetch" href="https://checkout.razorpay.com">

<!-- SDK script with preload hint -->
<script src="https://checkout.razorpay.com/checkout-blocks/checkout-blocks.js"></script>
```

**Handy Tips**

Adding `preconnect` and `dns-prefetch` hints can reduce script load time by up to 75%. We strongly recommend including these in your `<head>` tag.

The SDK core is under 10 KB (gzipped). Wallet-specific adapters are loaded dynamically only when needed:

- Core SDK — `https://checkout.razorpay.com/checkout-blocks/checkout-blocks.js`
- Apple Pay Adapter — `https://checkout.razorpay.com/checkout-blocks/rzp-apple-pay.js`
- Google Pay Adapter — `https://checkout.razorpay.com/checkout-blocks/rzp-google-pay.js`

### 1.2 Create an Order

Before initiating a payment, create an order on your backend using the [Razorpay Orders API](/razorpay-docs-md/api/orders/create.md). Pass the resulting `order_id` to your frontend to initialise the SDK.

The SDK flow requires your site to call `Create Order (amount, currency)` on the Razorpay backend and receive an `order_id` in response. Use this `order_id` when initialising the SDK in [step 1.3](/razorpay-docs-md/payment-methods/apple-pay/checkout-blocks.md#13-initialise-sdk-and-check-wallet-eligibility).

Refer to the [Orders API documentation](/razorpay-docs-md/api/orders/create.md) for detailed request and response parameters.

### 1.3 Initialise SDK and Check Wallet Eligibility

Once the SDK is loaded and you have an `order_id`, you can initialise Checkout Blocks and check whether the customer's device supports a given wallet.

Integration Option 1: Razorpay-Managed Web Component

Use this approach if you want Razorpay to handle button rendering and payment initiation automatically. Simply place the `<razorpay-checkout-element>` web component on your page.

JavaScript

copy

```javascript
// 1. Add checkout-blocks.js script tag in head
<script
  src="https://checkout.razorpay.com/checkout-blocks/checkout-blocks.js" />

// 2. Render the web component exposed by razorpay
<razorpay-checkout-element
  id="apple-pay"
  order_id="orderid"
  wallet="apple-pay"
>
</razorpay-checkout-element>;

// 3. Listen for events
document
  .getElementById('apple-pay')
  .addEventListener('complete-payment', () => {});

document.getElementById('apple-pay').attachListeners({
  onCompletePayment: () => {},
  onError: () => {},
});
```

The web component automatically checks device eligibility and renders the appropriate payment button. If the wallet is not supported on the customer's device, nothing is rendered.

Integration Option 2: Business-Controlled

Use this approach if you want full control over button rendering and payment initiation. You use the SDK's JavaScript API to check eligibility and trigger payments programmatically.

JavaScript

copy

```javascript
// 1. Add checkout-blocks.js script tag in head
<script
  src="https://checkout.razorpay.com/checkout-blocks/checkout-blocks.js" />

const rce = window.RazorpayCheckoutBlocks; // Exposed by the script
rce.load(rce.APPLE_PAY, rce.GOOGLE_PAY); // Business chooses the wallet to accept payments from

// 2. Check if wallet is supported and initiatePayment using razorpay
if (await rce.isSupported(rce.APPLE_PAY)) {
  <button
    onClick={rce.initiatePayment(rce.APPLE_PAY, { order_id, other_options })}
  >
    Apple Pay
  </button>
}
```

**Watch Out!**

`initiatePayment()` can only be called once per transaction. Calling it again will not start a new payment unless the current transaction has ended (completed, failed or cancelled).

### 1.4 Handle Payment Events

Subscribe to payment lifecycle events to track the payment status and update your UI accordingly.

Available Events

Success Callback

If the payment is successful, the `onPaymentComplete` event contains the following fields:

- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`

Send these values to your server for [signature verification](/razorpay-docs-md/payment-methods/apple-pay/checkout-blocks.md#15-verify-payment-signature).

Error Callback

If the payment fails, the `onError` event contains details about the failure. Common error codes:

On retryable errors, the SDK automatically re-renders the payment buttons so the customer can attempt payment again.

### 1.5 Verify Payment Signature

Signature verification is a mandatory step to ensure that the payment callback is authentic and sent by Razorpay. The `razorpay_signature` contained in the success callback can be regenerated by your system and verified as follows.

Create a string to be hashed using the `razorpay_payment_id` contained in the callback and the `order_id` generated in step 1.2, separated by a `|`. Hash this string using SHA256 and your API Secret.

copy

```
generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);

if (generated_signature == razorpay_signature) {
    payment is successful
}
```

#### Generate Signature on your Server

Sample code

JavaPythonGoPHPRubyNode.js.NET

copy

```java
/**
* This class defines common routines for generating
* authentication signatures for Razorpay Webhook requests.
*/
public class Signature
{
    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
    /**
    * Computes RFC 2104-compliant HMAC signature.
    * * @param data
    * The data to be signed.
    * @param key
    * The signing key.
    * @return
    * The Base64-encoded RFC 2104-compliant HMAC signature.
    * @throws
    * java.security.SignatureException when signature generation fails
    */
    public static String calculateRFC2104HMAC(String data, String secret)
    throws java.security.SignatureException
    {
        String result;
        try {

            // get an hmac_sha256 key from the raw secret bytes
            SecretKeySpec signingKey = new SecretKeySpec(secret.getBytes(), HMAC_SHA256_ALGORITHM);

            // get an hmac_sha256 Mac instance and initialize with the signing key
            Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
            mac.init(signingKey);

            // compute the hmac on input data bytes
            byte[] rawHmac = mac.doFinal(data.getBytes());

            // base64-encode the hmac
            result = DatatypeConverter.printHexBinary(rawHmac).toLowerCase();

        } catch (Exception e) {
            throw new SignatureException("Failed to generate HMAC : " + e.getMessage());
        }
        return result;
    }
}
```

### 1.6 Integrate Payments Rainy Day Kit

Use Payments Rainy Day kit to overcome payments exceptions such as:

- [Late Authorisation](/razorpay-docs-md/payments/late-authorisation.md)
- [Payment Downtime](/razorpay-docs-md/api/payments/downtime.md)
- [Payment Errors](/docs/errors/)

### 1.7 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-methods/apple-pay/build/browser/assets/images/testpayment.jpg)

## Apple Pay - Domain Verification

To accept Apple Pay payments, your domain must be verified with Apple via Razorpay. Follow the steps below:

Steps to Verify Your Domain

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com)   .
2. Navigate to the Apple Pay settings section and download the domain association file provided by Razorpay.
3. Host the file on your server at the following path:
   `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`
4. Ensure the file is publicly accessible over HTTPS.
5. Razorpay will use its own Apple Merchant ID. Your domain is whitelisted automatically once onboarding is complete.

**Watch Out!**

The domain association file must be served with `Content-Type: application/octet-stream` or `text/plain`. Ensure your server does not block or redirect requests to the `.well-known` directory.

## Frequently Asked Questions

1. Can I integrate multiple wallet using a single SDK?

Yes. Checkout Blocks is designed to support multiple digital wallet through a single integration. You load the SDK once and specify which wallet to enable. Each wallet adapter is loaded dynamically, keeping the core bundle lightweight.

2. What happens if the customer's device does not support the wallet?

The `isSupported()` method returns `false` for unsupported wallet. In the Web Component approach, the element simply does not render. You should always check eligibility before displaying a payment button.

3. Can the customer retry a failed payment?

Yes. On payment failure, the customer can attempt payment again without refreshing the page.
