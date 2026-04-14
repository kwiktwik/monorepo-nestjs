<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/saved-vpa -->

Razorpay enables you to save the VPAs of a customer. The VPAs entered by the customer is stored and secured as tokens in Razorpay. The customers can select the saved VPA and complete the payment on subsequent visits.

- This saves the customer the hassle of entering the VPA again for every transaction.
- Without Saved VPAs, the customers may enter invalid VPAs or forget their VPAs, which could lead to higher drop-off rates.

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#intent-flow)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/custom-integration/)  .

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/build/browser/assets/images/feature-request.gif)

## User Flow

The user flow for accepting payments using tokens is as follows:

1. The customer enters VPA to make UPI payments at your checkout.
2. The entered **VPAs are saved as tokens** by Razorpay.
3. On a repeat visit to your site, all the tokens saved for a customer are displayed on your checkout.
4. From the displayed list of VPAs, the customer selects VPAs of their choice to complete the payment.

## Prerequisites

To authenticate API requests sent to Razorpay servers, send the API key, a combination of `Key_Id` and `Key_Secret`, in the request header. [Generate API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys) from the Dashboard.

## Integration Steps

The steps required to integrate tokens in the payment flow are as follows:

### 1.1 Create a Customer

Create a customer, whose VPAs should be saved, with details such as `email` and `contact`.

POST

/customers

Sample RequestJavaPythonPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers \
-H "Content-Type: application/json" \
-d '{
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "9900000000",
  "fail_existing": "0"
}'
```

Know more about [Customers](/razorpay-docs-md/customers.md).

### 1.2 Create an Order

An order must be created before initiating payment on your Checkout.

POST

/orders

Sample RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 200,
  "currency": "INR"
}'
```

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

### 1.3 Create Tokens for a Customer

While making the UPI collect payment, the customer enters the VPA on the checkout. To save the VPA, send `customer_id` and `save` attributes along with the other [Checkout fields](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#checkout-options) as shown below:

Custom Checkout Sample Code

copy

```javascript
razorpay.createPayment({
  amount: 200,
  contact: '9900000000',
  email_id: 'gaurav.kumar@example.com',
  customer_id: 'cust_EIW4T2etiweBmG',
  save: 1,
  order_id: 'order_Ee0biRtLOqzRjP',
  method: 'upi'
  vpa: '9900000000@upi'
});
```

customer\_id

`string` Unique identifier of the customer. This can be obtained from the response of [Step 1](/razorpay-docs-md/payment-gateway/web-integration/custom/features/saved-vpa.md#step-1-create-a-customer).

save

`integer` Specifies if the VPA should be stored as tokens. Possible values are:

- `1`: Saves the VPA details.
- `0`(default): Does not save the VPA details.

### 1.4 Fetch all Tokens of the Customer

All the VPA tokens of a customer can be retrieved as follows:

GET

/customers/:customer\_id/tokens

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
    -X GET https://api.razorpay.com/v1/customers/cust_EIW4T2etiweBmG/tokens
```

### 1.5 Create Payments Using Tokens

Once the VPAs are tokenized, in all the repeat transactions on your website, customers can complete their UPI payments without having to enter their VPAs again.

In subsequent payments, instead of `vpa`, pass `customer_id` and `token` attributes along with the other [Checkout fields](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#checkout-options) as shown below:

Custom Checkout Sample Code

copy

```javascript
.... //beginning of your custom code
razorpay.createPayment({
  amount: 100,
  contact: '9900000000',
  email_id: 'gaurav.kumar@example.com',
  customer_id: 'cust_EIW4T2etiweBmG',
  order_id: 'order_EAFrKULhM6Eopk',
  method: 'upi',
  token: 'token_EeO65VIv8BXZg5'
});
...... //rest of the code
```

customer\_id

`string` Unique identifier of the customer.

token

`string` Token of the saved VPA obtained in the [previous step](/razorpay-docs-md/payment-gateway/web-integration/custom/features/saved-vpa.md#14-fetch-all-tokens-of-the-customer).
