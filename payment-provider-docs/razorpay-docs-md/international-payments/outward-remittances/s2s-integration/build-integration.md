<!-- Source: https://razorpay.com/docs/payments/international-payments/outward-remittances/s2s-integration/build-integration -->

Follow these steps to integrate with the Outward Remittance LRS Flow APIs.

**1.1** [Fetch Forex Rates](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/build-integration.md#11-fetch-forex-rates)

**1.2** [Create an Order](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/build-integration.md#12-create-an-order)

**1.3** [Collect Documents](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/build-integration.md#13-collect-documents)

**1.4** [Create a Payment](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/build-integration.md#14-create-a-payment)

**1.5** [Handle Payment Success and Error Events](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/build-integration.md#15-handle-payment-success-and-error-events)

**1.6** [Verify Payment Signature](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/build-integration.md#16-verify-payment-signature)

**1.7** [Verify Payment Status](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/build-integration.md#17-verify-payment-status)

## 1.1 Fetch Forex Rates

Use the following API to fetch the real-time conversion rate Razorpay will charge to facilitate the transaction. This includes additional charges within the LRS flow.

GET

/forex\_charges

Query Parameters

amount

mandatory

`integer` The amount which needs to be converted in currency subunits. For example, for an amount of ₹295.00, enter 29500.

base\_currency

mandatory

`string` Currency ISO code for the given amount. The default length is 3 characters. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

conversion\_currency

mandatory

`string` ISO code for the currency to which the given amount should be converted, specified in currency subunits. If left blank, the conversion amount is provided for all supported currencies as a list. Otherwise, provides the conversion amount only for the requested currency. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

Response Parameters

amount

`string` The amount which needs to be converted in currency subunits.

base\_currency

`string` Currency ISO code for the given amount.

converted\_amount

`string` Converted amount in the requested currency.

conversion\_currency

`string` ISO code for the currency to which the given amount should be converted, specified in currency subunits.

expiry\_time

`integer` Unix timestamp at which the conversion rate will expire.

fee

`integer` Fee charged by the bank.

type

`string` Type of identity information collected. Possible value is `bank`.

amount

`string` The amount which needs to be converted in currency subunits.

taxes

`integer` Taxes collected for the remittance.

type

`string` Type of identity information collected. Possible value is `tcs`.

amount

`string` The amount which needs to be converted in currency subunits.

Error Response Parameters

## 1.2 Create an Order

Create an order using the following API and send additional information such as customer details, identity and bank account details.

### Prerequisites

- The Bank Account of the Payer/Remitter is mandatory as TPV (Third Party Validation) needs to be done.
- You are required to provided the PAN details of the payer (PAN number of the payer from whose bank account the amount will be debited).
- Debit Card TPV is mandatory.
- Partial payments are not permitted.

POST

/orders

Request Parameters

amount

mandatory

`integer` The amount for which the order is created, in currency subunits. For example, for an amount of ₹295, enter `29500`. Payment can only be made for this amount against the Order.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Can have a maximum length of 40 characters and has to be unique.

customer\_details

mandatory

`json_object` Contains the customer details of the order.

name

mandatory

`string` Customer's name. Alphanumeric, with period (.), apostrophe (') and parentheses allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

contact

mandatory

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

email

mandatory

`string` The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

identity

mandatory

`array` Collect identity-related information from the customer.

**Watch Out!**

This field is mandatory for all businesses using LRS, as we must collect PAN information to obtain TCS rates from the bank associated with that PAN.

type

mandatory

`string` Type of identity information collected. Possible value is `tax_id`.

id

mandatory

`string` Unique identifier of the identity type. For example, for tax\_id, the id is PAN Number, say, `AVOJB1111K`.

bank\_account

`json_object` Details of the bank account to be passed in the request. Required if the method is `emandate`.

account\_number

mandatory

`string` Bank account number used to initiate the payment.

ifsc

mandatory

`string` IFSC of the bank used to initiate the payment.

name

mandatory

`string` Name associated with the bank account used to initiate the payment.

notes

optional

`json object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

Response Parameters

amount

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

amount\_due

`integer` The amount pending against the order.

amount\_paid

`integer` The amount paid against the order.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

created\_at

`integer` Indicates the Unix timestamp when this order was created.

currency

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

entity

`string` Name of the entity. Here, it is `order`.

id

`string` The unique identifier of the order.

notes

`object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

offer\_id

`string` The unique identifier of the offer. For example, `offer_JHD834hjbxzhd38d`.

receipt

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

status

`string` The status of the order. Possible values:

- `created`: When you create an order, it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order changes to the `attempted` state following the first payment attempt and remains in this state until at least one payment is successfully processed and captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to this state.
   The order stays in the `paid` state even if the payment associated with the order is refunded.

Error Response Parameters

## 1.3 Collect Documents

Collect the necessary documents in the LRS flow to facilitate the processing and settlement of payments by our AD Partner Bank.

POST

/order/:id/documents

Request Parameters

document\_type

mandatory

`string` Type of document corresponding to the flow of LRS, that is Education or Travel. For example, it is `admission_letter` when the student’s admission letter is uploaded. Possible values:

- `admission_letter`
- `passport_front`
- `passport_back`
- `loan_sanction_letter`
- `booking_invoice`

purpose

mandatory

`string` The reason you are uploading this document. Possible values:

- `lrs_education`
- `lrs_travel`

Response Parameters

id

`string` The unique identifier of the document.

entity

`string` Name of the entity. Here, it is `document`.

purpose

`string` The reason you are uploading this document. Here, it is `lrs_education`. Possible values:

- `lrs_education`
- `lrs_travel`

size

`integer` Indicates the size of the document in bytes.

mime\_type

`string` Indicates the nature and format in which the document is uploaded. Possible values include:

- `image/jpg`
- `image/jpeg`
- `image/png`
- `application/pdf`

created\_at

`integer` Unix timestamp at which the document was uploaded.

Error Response Parameters

## 1.4 Create a Payment

Create a payment using the S2S JSON Payments API. In this sample, a payment is created with the `netbanking` payment method.

**Watch Out!**

Ensure all valid documents are in place before initiating a payment.

POST

/payments/create/json

CurlPythonPHPNode.jsResponse

copy

```bash
curl -u [YOUR_KEY_id]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json \
-H "Content-Type: application/json" \
 -d '{
    "amount": "1000",
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "customer_id": "cust_MpINfSkdEvtdxb",
    "order_id": "order_NGrgEcmYJsfUyl",
    "ip": "192.168.0.103",
    "method": "netbanking",
    "bank": "YESB",
    "notes": {
        "payment_reason": "Tuition Fee",
    }
}'
```

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, `INR`. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/supported-currencies.md). Length must be of 3 characters.

email

mandatory

`string` Email address of the customer. Maximum length supported is 40 characters.

contact

mandatory

`string` Phone number of the customer. For example, 9000090000.

order\_id

mandatory

`string` Unique identifier of the Order.
 Know more about [Orders API](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/build-integration.md#12-create-an-order).

ip

optional

`string` Customer's IP address.

method

mandatory

`string` Name of the payment method. Possible values are:

- `card`
- `netbanking`
- `upi`

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

payment\_reason

optional

`string` The reason you are making this payment. For example, `Tuition Fee`.

Response Parameters

If the payment request is valid, the response contains the following fields.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. The value here is `redirect`. Use this URL to redirect customer to the bank page.

url

`string` URL to be used for the action indicated.

**Watch Out!**

Refer to the [Payment Methods](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods.md) section for other payment options request parameters.

## 1.5 Handle Payment Success and Error Events

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

If the payment has failed, the callback will contain details of the error. Refer to [Errors](/docs/errors/) for details.

## 1.6 Verify Payment Signature

Signature verification is a mandatory step to ensure that the callback is sent by Razorpay. The `razorpay_signature` contained in the callback can be regenerated by your system and verified as follows.

Create a string for hashing by combining the "razorpay\_payment\_id" from the callback and the Order id generated in the initial step, separated by a `|`. Proceed to hash this string using SHA256 alongside your API Secret.

Signature

copy

```javascript
generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);

if (generated_signature == razorpay_signature) {
    payment is successful
}
```

### Generate Signature on your Server

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

## 1.7 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/international-payments/outward-remittances/s2s-integration/build/browser/assets/images/testpayment.jpg)

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/international-payments/outward-remittances/s2s-integration/test-integration.md)
