<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/upi/saved-vpa/build-integration -->

The steps required to integrate tokens in the payment flow are as follows:

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/intent.md)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/s2s-integration/)  .

### Step 1: Create a Customer

Create a customer whose VPAs should be saved. You can skip this step if you have already created customers in your account.

POST

/customers

CurlJavaPythonPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers \
-H "Content-Type: application/json" \
-d '{
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000"
}'
```

#### Request Parameters

name

mandatory

`string` The name of the customer.

email

optional

`string` The email ID of the customer.

contact

optional

`integer` The phone number of the customer.

notes

optional

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters
(maximum), are supported.

#### Response

The `id` obtained in the response should be sent as `customer_id` while creating the token.

### Step 2: Create an Order

You should create an order before initiating a payment at your end.

POST

/orders

CurlResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 200,
  "currency": "INR"
}'
```

#### Request Parameters

amount

mandatory

`integer` The amount for which the order was created, in currency subunits.
For example, for an amount of ₹295, enter `29500`.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. Only `INR` is supported.

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Maximum length of 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### Step 3: Create Tokens for a Customer

While making the UPI collect payment, the customer enters the VPA on your UI. To store the VPA as a **token**, pass additional attributes in the create payment request:

#### Request Parameters

customer\_id

`string` Unique identifier of the customer. This can be obtained from the response of [Step 1](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/saved-vpa/build-integration.md#step-1-create-a-customer).

amount

mandatory

`integer` The amount for which the order was created, in currency subunits.
For example, for an amount of ₹295, enter `29500`.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. Only `INR` is supported.

order\_id

mandatory

`string` Order ID generated via [Razorpay Orders API](/razorpay-docs-md/api/orders.md).

email

mandatory

`string` Email address of the customer.

contact

mandatory

`string` Phone number of the customer.

method

mandatory

`string` The payment method used to make the payment. Possible value is `upi`.

upi

mandatory

`object` The UPI type payment method.

vpa

mandatory

`string` UPI ID used for making the payment on the UPI app.

ip

mandatory

`string` The client's browser IP address. For example, `105.106.107.108`.

referer

mandatory

`string` Value of `referer` header passed by the client's browser. For example, `https://merchansite.com/example/paybill`

user\_agent

mandatory

`string` Value of `user_agent` header passed by the client's browser.
For example, **Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36**

save

`boolean` Specifies if the VPA should be stored as a token. Possible values are:

- `true`: Saves the VPA details.
- `false`(default): Does not save the VPA details.

#### Response

The response contains an HTML page that is rendered in the customer's browser. The customer can now complete the payment by logging in to the respective UPI app.

### Step 4: Fetch all Tokens of the Customer

All the card (if saved earlier) and VPA tokens of a customer can be retrieved.

GET

/customers/:customer\_id/tokens

CurlJavaPythonPHPNode.jsResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/customers/cust_EIW4T2etiweBmG/tokens
```

#### Response

Pass the token that contains the VPA details of the customer, `token_EeO65VIv8BXZg5` in the above example, to the payment create request.

### Step 5: Create Payments using Tokens

After VPA tokenisation, customers can complete their UPI payments without having to enter their VPAs again for repeat transactions on your site.

You should pass the following attributes in each payment create request, instead of the `vpa` field:

#### Request Parameters

customer\_id

`string` Unique identifier of the customer.

amount

mandatory

`integer` The amount for which the order was created, in currency subunits.
For example, for an amount of ₹295, enter `29500`.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. Only `INR` is supported.

order\_id

mandatory

`string` Order ID generated via [Razorpay Orders API](/razorpay-docs-md/api/orders.md).

email

mandatory

`string` Email address of the customer.

contact

mandatory

`string` Phone number of the customer.

method

`string` The payment method used to make the payment. Possible value is `upi`.

token

`string` Token of the saved VPA, obtained in the [previous step](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/saved-vpa/build-integration.md#step-4-fetch-all-tokens-of-the-customer).

#### Response

The response contains an HTML page that is rendered in the customer's browser. The customer can now complete the payment by logging in to the respective UPI app.

### Next Steps

You can check the status of the payments using any of the following methods:

- Poll the Razorpay servers to [fetch a payment](/razorpay-docs-md/api/payments/fetch-with-id.md)

  or [fetch the payments made for an order](/razorpay-docs-md/api/payments.md#fetch-payments-based-on-orders)  .
- Subscribe to [payments](/docs/webhooks/payments/)

  and [orders](/docs/webhooks/orders/)

  Webhook events that are generated in Razorpay when the customer completes the payment on your website.
