<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/upi/collect -->

UPI payments enable customers to make payments using a Virtual Payment Address (VPA) without entering bank information.

Customers enter their VPAs on your UI, open the respective UPI apps and complete the payment after 2-factor authentication (UPI PIN and MPIN) on their mobile devices. Customers are redirected to your website or app after successful payment.

In this flow, customers likely enter invalid VPAs or forget their VPAs, which could lead to higher drop-off rates. To overcome this problem, Razorpay enables you to validate and save the VPAs of a customer. Know more about [Saved VPA](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/saved-vpa.md).

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

**NPCI Restrictions for UPI Collect Flow**

As per NPCI guidelines, the following MCC codes are restricted and cannot accept UPI Collect payments:

Restricted MCC Codes

### Best Practices

Follow these best practices to accept online payments using the UPI collect flow:

- [Validate the VPA](/razorpay-docs-md/payment-gateway/web-integration/custom/features/validate-vpa.md)

  before initiating the payment request.
- Add a custom UPI Collect expiry based on the business requirement to provide enough time for the customer to complete the payment.
- Use the [Saved VPA](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/saved-vpa.md)

  feature offered by Razorpay to provide a better customer experience.

## Prerequisites

- Reach out to our [Support Team](https://razorpay.com/support/#raise-a-request)

  to enable VPA validation and saved VPA features for your account.
- Keep the API keys (`Key_Id` and `Key_Secret`) handy for integration.
- [Generate API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  from the Dashboard.

## User Flow

Let us understand the process for accepting payments via the UPI collect flow:

1. The customer selects UPI as the payment method and enters the VPA of their choice on the UI.
    Razorpay validates the entered VPA.
2. The customer saves the entered VPA details while completing the payment.
   Razorpay saves all the valid VPA details as **tokens**.
3. On a repeat visit, the customer selects the VPA token to complete the payment.

## Create VPA Tokens

Given below are the steps to create VPA tokens:

1. [Create a customer](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-1-create-a-customer)

   or fetch the customer for whom the VPA should be saved.
2. [Create an order](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-2-create-an-order)

   .
3. [Validate the VPA](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-3-validate-the-vpa)

   entered by the customer.
4. [Initiate payment](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-4-initiate-a-payment)

   with a collect request on the provided VPA.
5. [Handle Payment Success and Error Events](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-5-handle-payment-success-and-error-events)

   .

### Step 1: Create a Customer

**Handy Tips**

Skip this step if you already have customers created in your account.

Create a customer whose VPAs should be saved, with details such as `email` and `contact`.

POST

/customers

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/customers \
-H "Content-Type: application/json" \
-d '{
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "fail_existing": "0"
}'
```

Response

copy

```json
{
  "id": "cust_EIW4T2etiweBmG",
  "entity": "customer",
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "gstin": null,
  "created_at": 1234567890
}
```

#### Request Parameters

name

mandatory

`string` The name of the customer.

email

optional

`string` The email id of the customer.

contact

optional

`string` The phone number of the customer.

fail\_existing

optional

`string` The request throws an exception by default if a customer with the exact details already exists. You can pass an additional parameter `fail_existing` to get the existing customer's details in the response. Possible values:

- `1` (default): If a customer with the same details already exists, throws an error.
- `0`: If a customer with the same details already exists, fetches details of the existing customer.

notes

optional

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

### Step 2: Create an Order

You should create an order before initiating a payment at your end.

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NET

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

Response

copy

```json
{
  "id": "order_Ee0biRtLOqzRjP",
  "entity": "order",
  "amount": 200,
  "amount_paid": 0,
  "amount_due": 200,
  "currency": "INR",
  "receipt": null,
  "offer_id": null,
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1586789358
}
```

#### Request Parameters

amount

mandatory

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. Only `INR` is supported.

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Maximum length of 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

### Step 3: Validate the VPA

Collect the VPA details of the customer and validate it as follows:

POST

/payments/validate/vpa

Curl.NET

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/validate/vpa \
-H "Content-Type: application/json" \
-d '{
  "vpa": "gauravkumar@exampleupi"
}'
```

Response

copy

```json
{
  "vpa": "gauravkumar@exampleupi",
  "success": true,
  "customer_name": "Gaurav Kumar"
}
```

#### Request Parameters

vpa

mandatory

`string` The virtual payment address (VPA) you want to validate. For example, `gauravkumar@exampleupi`.

**Deprecation Notice**

UPI Collect is deprecated effective 28 February 2026. This tab is applicable only for exempted businesses. If you are not covered by the exemptions, refer to the [migration documentation](/docs/announcements/upi-collect-migration/s2s-integration/) to switch to UPI Intent.

### Step 4: Initiate a Payment

Once validated, you can now save the VPA provided by the customer. Create a payment with the valid `vpa` as follows:

POST

/payments/create/upi

#### Request Parameters

amount

mandatory

`integer` The amount associated with the payment in the smallest unit of the supported currency. For example, `2000` means ₹20.

currency

mandatory

`string` ISO code of the currency associated with the payment amount. Only `INR` is supported.

order\_id

mandatory

`string` Unique identifier of the order obtained in the response of the previous step.

notes

optional

`json object` Key-value pairs that can hold additional information about the payment.
 Refer to the [Notes](/razorpay-docs-md/api/understand.md#notes) section of the API Reference Guide.

description

optional

`string` Descriptive text of the payment.

contact

mandatory

`string` Phone number of the customer.

email

mandatory

`string` Email address of the customer.

**Watch Out!**

The `email` field is mandatory by default. However, you can contact the [support team](https://razorpay.com/support/#request) to make it optional using a feature flag.

save

`boolean` Specifies if the VPA should be stored as tokens. Possible values are:

- `true`: Saves the VPA details.
- `false`(default): Does not save the VPA details.

customer\_id

mandatory

`string` Unique identifier of the customer, obtained from the response of [Step 1](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-1-create-a-customer).

ip

mandatory

`string` The client's browser IP address. For example, `117.217.74.98`.

referer

mandatory

`string` Value of `referer` header passed by the client's browser. For example, `https://example.com/`

user\_agent

mandatory

`string` Value of `user_agent` header passed by the client's browser.
For example, **Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36**

upi

`object` Details of the collect expiry.

flow

mandatory

`string` Specify the type of the UPI payment flow.
 Possible values are:

- `collect` (default)
- `intent`

vpa

mandatory

`string` The customer's VPA to which the collect request will be sent.

expiry\_time

mandatory

`integer` The number of minutes after which the link will expire. The default value is `5`. Maximum value is `5760`.

#### Response Parameters

razorpay\_payment\_id

`string` Unique identifier for the payment returned by Checkout only for successful payments.

### Step 5: Handle Payment Success and Error Events

Once the customer completes the payment, a `POST` request is made to the `callback_url` provided in the payment request. The data contained in this request will depend on whether the payment was a **success** or a **failure**.

#### Success Callback

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

#### Failure Callback

If the payment has failed, the callback will contain details of the error. Refer to [Errors](/docs/errors/payments/payment-methods-error-parameters/#upi) for details.

## Create Payments using Tokens

The customer can make payments using the VPA tokens (which were saved earlier) on a repeat transaction.

1. [Create an order](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-1-create-an-order)

   .
2. [Fetch all tokens of a customer](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-2-fetch-vpa-tokens-of-a-customer)

   .
3. [Initiate a payment](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-3-initiate-a-payment-using-vpa-token)

   with the token selected by the customer.
4. [Handle Payment Success and Error Events](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-4-handle-payment-success-and-error-events)

   .

### Step 1: Create an Order

You should create an order before initiating the payment.

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 600,
  "currency": "INR"
}'
```

Response

copy

```json
{
  "id": "order_ExhN1Y0100Dkjw",
  "entity": "order",
  "amount": 600,
  "amount_paid": 0,
  "amount_due": 600,
  "currency": "INR",
  "receipt": null,
  "offer_id": null,
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1586789358
}
```

#### Request Parameters

amount

mandatory

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`. Payment can only be made for this amount against the order.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. Refer the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Can have a maximum length of 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### Step 2: Fetch VPA Tokens of a Customer

Use the API given below to retrieve all the card (if saved earlier) and VPA tokens of a customer.

GET

/customers/:customer\_id/tokens

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/customers/cust_EIW4T2etiweBmG/tokens
```

### Step 3: Initiate a Payment Using VPA Token

In each payment create request, instead of the `vpa` field, pass the `customer_id` and `token` attributes:

POST

/payments/create/upi

RequestResponse

copy

```json
{
  "id": "cust_EIW4T2etiweBmG",
  "entity": "customer",
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "gstin": null,
  "created_at": 1234567890
}
```0

#### Request Parameters

customer\_id

`string` Unique identifier of the customer.

token

`string` Token of the saved VPA.

#### Response Parameters

Once the payment is successfully created, you will receive a response containing the `next` array. This array tells you the next steps that you should take to process the payment:

razorpay\_payment\_id

`string` Unique identifier for the payment returned by Checkout only for successful payments.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` The action that you need to perform further. In this case, the value is `poll`

url

`string` Contains the URL that you must poll to fetch the status of the payment, either `authorized` or `failed`.

### Step 4: Handle Payment Success and Error Events

Once the customer completes the payment, a `POST` request is made to the `callback_url` provided in the payment request. The data contained in this request will depend on whether the payment was a **success** or a **failure**.

#### Success Callback

If the payment made by the customer is successful, the following fields are sent:

- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`

Callback Example

copy

```json
{
  "id": "cust_EIW4T2etiweBmG",
  "entity": "customer",
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "gstin": null,
  "created_at": 1234567890
}
```1

#### Failure Callback

If the payment has failed, the callback will contain details of the error. Refer to [Errors](/docs/errors/payments/payment-methods-error-parameters/#upi) for details.

#### Verify Payment Status

You can verify the status of the payments using any of the following methods:

- Poll Razorpay servers periodically for the [payments made for the order](/razorpay-docs-md/api/orders/fetch-payments.md)

  using our Fetch Payment APIs.
- Subscribe to the webhook events created in our system for each of the following entities:

  - [payments](/docs/webhooks/payments/)
  - [orders](/docs/webhooks/orders/)

#### Payment failure and re-initiating payment

If the Order is not marked `paid` within 2-3 minutes, then you can re-initiate payment for the same.

### Related Information

- [UPI Error Codes](/docs/errors/payments/payment-methods-error-parameters/#upi)
- [UPI Transaction Limits](/razorpay-docs-md/payment-methods/transaction-limits/upi.md)
