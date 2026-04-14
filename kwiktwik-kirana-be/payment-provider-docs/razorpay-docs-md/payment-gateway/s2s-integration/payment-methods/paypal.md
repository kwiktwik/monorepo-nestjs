<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/paypal -->

PayPal is a payment method that you can integrate with Razorpay to accept payments in international currencies.

You can accept payments based on the transaction limit of your PayPal account. Know more about the other [payment methods and the transaction limits](/razorpay-docs-md/payment-methods/transaction-limits.md).

### Advantages

Integrating PayPal as a payment method offers you the following advantages:

- **Better Success Rates**: Enjoy up to 20% higher success rates.
- **Faster Settlement time**: Get paid on a T+1 settlement schedule.
- **Wide user base**: Reach Over 30 million PayPal users around the world.
- **No additional charges**: PayPal defines the rates for transactions.

**Watch Out!**

You can accept payments from the provided [list of supported currencies](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal/supported-currencies.md).

## Onboarding Process to Enable PayPal

Watch this video to see the onboarding process to enable PayPal on your checkout form.

**Handy Tips**

The PayPal section is visible only in the **Live** mode on the Dashboard.

To enable PayPal:

1. Log in to the Dashboard.
2. Navigate to **Account & Settings** → **International payments** (under Payment methods). Scroll to the **PayPal** section and click **Link Account**.

   ![Link PayPal Account on Razorpay Dashboard](https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/build/browser/assets/images/paypal-link-account-s2s.jpg)
3. Upon redirection to PayPal:

   - If you do not have a PayPal account, you need to complete the verification process and KYC. This will include confirming your email address by clicking on the link sent to you by PayPal.
   - If you already have a PayPal account, you need to authorise Razorpay to accept payments.

   You should now be able to see your PayPal enablement status set to `Pending` on your Razorpay Dashboard. PayPal will activate your account within 48 hours if all of the previous steps are successfully completed.

   You can now proceed with the integration. This depends on how you have integrated Razorpay on your website or application.

   By default, your PayPal account is configured to receive USD payments. You can enable more currencies on your account from your PayPal Dashboard.

   **Watch Out!**

   - You should not use the same email ID for multiple MIDs.
   - Each merchant should set up a separate PayPal account for each MID.

## Integration Steps

If you are using Razorpay Server-to-Server integration, first you need to raise a request with our [Support team](https://razorpay.com/support/) to enable PayPal and complete the [onboarding procedure](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal.md#to-enable-paypal).

Follow the steps given below to integrate S2S JSON API and accept payments using PayPal.

**1.1** [Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal.md#11-create-an-order)

**1.2** [Create a Payment](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal.md#12-create-a-payment)

**1.3** [Handle Payment Success and Error Events](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal.md#13-handle-payment-success-and-error-events)

**1.4** [Verify Payment Signature](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal.md#14-verify-payment-signature)

**1.5** [Integrate Payments Rainy Day Kit](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal.md#15-integrate-payments-rainy-day-kit)

**1.6** [Verify Payment Status](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal.md#16-verify-payment-status)

### 1.1 Create an Order

To process a payment, create a Razorpay Order to correspond with the order in your system. Send the order request parameters to the following endpoint:

Order is an important step in the payment process.

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal.md#api-sample-code)  . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  Orders API.
- The `order_id` received in the response should be passed to the checkout. This ties the order with the payment and secures the request from being tampered.

You can create an order:

- Using the sample code on the Razorpay Postman Public Workspace.
- By manually integrating the API sample codes on your server.

### Razorpay Postman Public Workspace

You can use the Postman workspace below to create an order: [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/request/12492020-6f15a901-06ea-4224-b396-15cd94c6148d)

**Handy Tips**

Under the **Authorization** section in Postman, select **Basic Auth** and add the Key Id and secret as the Username and Password, respectively.

You can create an order manually by integrating the API sample codes on your server.

### API Sample Code

Use this endpoint to create an order using the Orders API.

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders 
-U [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
  "amount": 50000,
  "currency": "",
  "receipt": "qwsaq1",
  "partial_payment": true,
  "first_payment_min_amount": 230,
  "notes": {
    "key1": "value3",
    "key2": "value2"
  }
}'
```

Success ResponseFailure Response

copy

```json
{
  "id": "order_IluGWxBm9U8zJ8",
  "entity": "order",
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "",
  "receipt": "rcptid_11",
  "offer_id": null,
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1642662092
}
```

Request Parameters

amount

mandatory

`integer` The transaction amount, expressed in the currency subunit. For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

currency

mandatory

`string` The currency in which the transaction should be made. Refer to the [list of supported currencies](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal/supported-currencies.md). Length must be of 3 characters.

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

first\_payment\_min\_amount

optional

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000 is to be received from the customer in two installments of #1 - ₹5,000, #2 - ₹2,000, then you can set this value as `500000`. This parameter should be passed only if `partial_payment` is `true`.

Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) parameters table.

Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

## 1.2 Create a Payment

Once an order is created, your next step is to create a payment. The following API will create a payment with `wallet` as the payment method:

POST

/payments/create/json

CurlPythonGoPHPNode.jsResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json \
-H "Content-Type: application/json" \
 -d '{
  "amount": "50000",
  "currency": "",
  "email": "gaurav.kumar@example.com",
  "contact": "+919876543210",
  "order_id": "order_EAkbvXiCJlwhHR",
  "ip": "198.29.65.27",
  "method": "wallet",
  "wallet": "paypal"
  }'
```

Request Parameters

amount

mandatory

`integer` The transaction amount, expressed in the currency subunit. For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

currency

mandatory

`string` The currency in which the transaction should be made. Refer to the [list of supported currencies](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal/supported-currencies.md). Length must be of 3 characters.

order\_id

mandatory

`string` Unique identifier of the Order.
 Know more about [Orders API](/razorpay-docs-md/api/orders.md).

ip

mandatory

`string` Customer's IP address.

email

mandatory

`string` Email address of the customer. Maximum length supported is 40 characters.

contact

mandatory

`string` Phone number of the customer. Maximum length supported is 15 characters, inclusive of country code.

method

mandatory

`string` Name of the payment method. Possible value is `wallet`

wallet

`string` Wallet code for the wallet used for the payment. Required if the method is `wallet`. Possible value is `paypal`.

Response Parameters

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible values:

- `redirect` : Use this URL to redirect customer to submit the OTP on the bank page.

url

`string` URL to be used for the action indicated.

## 1.3 Handle Payment Success and Error Events

Once the payment is completed by the customer, a `POST` request is made to the `callback_url` provided in the payment request. The data contained in this request will depend on whether the payment was a **success** or a **failure**.

### Success Callback

If the payment made by the customer is successful, the following fields are sent:

- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`

Callback Example

copy

```json
{
  "razorpay_payment_id": "pay_29QQoUBi66xm2f",
  "razorpay_order_id": "order_9A33XWu170gUtm",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

### Failure Callback

If the payment has failed, the callback will contain details of the error. Refer to [Errors](/razorpay-docs-md/api/index.md#errors) for details.

## 1.4 Verify Payment Signature

Signature verification is a mandatory step to ensure that Razorpay sends the callback. The `razorpay_signature` contained in the callback can be regenerated by your system and verified as follows.

Create a string to be hashed using the `razorpay_payment_id` contained in the callback and the Order ID generated in the first step, separated by a `|`. Hash this string using SHA256 and your API Secret.

copy

```
generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);

if (generated_signature == razorpay_signature) {
    payment is successful
}
```

### Generate Signature on your Server

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

## 1.5 Integrate Payments Rainy Day Kit

Use Payments Rainy Day kit to overcome payments exceptions such as:

- [Late Authorisation](/razorpay-docs-md/payments/late-authorisation.md)
- [Payment Downtime](/razorpay-docs-md/api/payments/downtime.md)
- [Payment Errors](/docs/errors/)

## 1.6 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/build/browser/assets/images/testpayment.jpg)

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/test-integration.md)

## Settlements

You receive the payments made using PayPal directly to your PayPal wallet. PayPal makes the settlements in INR.

## Refunds

**Refunds - PayPal Balance Required**

Ensure you have sufficient balance in your PayPal account before you initiate a refund.

1. Refunds can be initiated by you either from the [Dashboard](/razorpay-docs-md/payments/dashboard.md#issue-refunds)

   or by using the [Refunds API](/razorpay-docs-md/api/refunds.md#refund-a-payment)   .
2. The refund amount is deducted from your PayPal account and credited to your customer's PayPal account.
