<!-- Source: https://razorpay.com/docs/payments/payment-gateway/emi²/eligibility-check -->

Use the Eligibility Check API to verify your customer's eligibility for EMI²-related payment instruments such as Debit Card EMI, Cardless EMI, and Pay Later. This check helps you display only relevant payment methods to your customers, reducing the chances of failed transactions.

**Watch Out!**

This is an on-demand feature. Please raise a request with us at [[affordability-widget@razorpay.com](mailto:affordability-widget@razorpay.com)](mailto:affordability-widget@razorpay.com)

to get this feature activated.

**Handy Tips**

- You can check customer and transaction eligibility only for Debit Card EMI, Cardless EMI and Pay Later, not for Credit Card EMI.
- You can perform the eligibility check on methods and instruments enabled for your account. Know how to [check the payment methods enabled](/razorpay-docs-md/payment-methods.md#view-payment-methods)

  for your account.

## Use Case

Before your customer navigates to the checkout, you can do an eligibility check on all the available EMI² instruments and display only those that apply to the customer. This helps reduce payment failures and drop-offs and enhances the customer experience.

## Eligibility Check States

Following are the various states of an eligibility check:

![Different states of the eligibility check process](https://razorpay.com/docs/payments/payment-gateway/emi²/build/browser/assets/images/affordability-eligibility-check.jpg)

## Eligibility Check Entity

The eligibility check entity has the following parameters:

inquiry

`string` Types of methods or instruments on which eligibility check is required. Possible value is `affordability`.

currency

`string` A three-letter ISO code for the currency for which you want to accept the payment. Possible value is `INR`.

amount

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`. The customer makes a payment for this amount against the order; hence, eligibility is checked for the amount.

customer

`object` Customer details.

id

`string` Unique identifier of the customer created using [Customers API](/razorpay-docs-md/customers.md). For example, `cust_1Aa00000000004`.

contact

`string` The customer's phone number. A maximum length of 15 characters, including country code. For example, `+919000090000`.

ip

`string` Customer's IP address from where the order is placed. For example, `105.106.107.108`.

referrer

`string` Referrer header passed by the client's browser.

user\_agent

`string` Customer user-agent.

instruments

`array` Payment Instruments on which eligibility check is performed. Use the `instruments` array to check eligibility on specific methods instruments.

method

`string` Payment methods on which eligibility check is performed. Possible values:

- `cardless_emi`
- `emi`
- `paylater`

provider

`string` List of Cardless EMI providers. Possible values for `cardless_emi`:

- `hdfc`
- `icic`
- `idfb`
- `kkbk`
- `earlysalary`
- `walnut369`

List of Pay Later providers. Possible values for `paylater`:

- `lazypay`
- `paypal`

issuer

`string` List of EMI issuers. Possible value is `hdfc`.

type

`string` Type of card. Possible value is `debit`.

eligibility\_req\_id

`string` A unique identifier of the eligibility check request on a specific instrument. For example, `elig_F1cxDoHWD4fkQt`.

eligibility

`object` Defines the customer's eligibility status and shows the associated error code in case of failure.

status

`string` Displays the current state of the eligibility check performed on each payment instrument. Possible values:

- `eligible`
- `ineligible`
- `pending`
- `failed`

error

`object` The error object.

code

`string` The type of error.

description

`string` Descriptive text about the error.

source

`string` Point of failure in a specific operation. For example, customers, businesses, and so on.

step

`string` The stage where the error occurred. Stages can vary depending on the payment method.

reason

`string` The exact reason for the error.

## Eligibility Check API

You can initiate a request for an eligibility check using the endpoint and the following mandatory parameters:

- Customer contact details.
- Transaction amount.

POST

customers/eligibility

RequestSuccess ResponseFailure Response

copy

```bash
-X POST 'https://api.razorpay.com/v1/customers/eligibility' \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H "content-type: application/json"
-d '{
  "inquiry": "affordability",
  "amount": 500000, // mandatory
  "currency": "INR", // mandatory
  "customer": {
    "id": "cust_KhP5dO1dKmc0Rm",
    "contact": "+918220276214", // mandatory
    "ip": "105.106.107.108",
    "referrer": "https://merchansite.com/example/paybill",
    "user_agent": "Mozilla/5.0"
  }
}'
```

### Request Parameters

inquiry

optional

`string` List of methods or instruments on which eligibility check is required. Possible value is `affordability`.

amount

mandatory

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`. The user makes a payment for this amount against the order; hence, eligibility is checked for the amount.

currency

mandatory

`string` A three-letter ISO code for the currency for which you want to accept the payment. Possible value is `INR`.

customer

`object` Customer details.

id

optional

`string` Unique identifier of the customer created using [Customers API](/razorpay-docs-md/customers.md). For example, `cust_1Aa00000000004`.

contact

mandatory

`string` The customer's phone number. A maximum length of 15 characters, including country code. For example, `+919000090000`.

ip

optional

`string` Customer's IP address from where the order is placed. For example, `105.106.107.108`.

referrer

optional

`string` Referrer header passed by the client's browser.

user\_agent

optional

`string` Customer user-agent.

instruments

optional

`array` Payment instruments on which an eligibility check is required.

method

`string` Payment methods on which an eligibility check is required. Possible Values :

- `emi`
- `cardless_emi`
- `paylater`

issuers

`string` List of EMI issuers. Possible value is `HDFC`.

types

`string` Type of card. Possible value is `debit`.

providers

`string` List of Cardless EMI providers. Possible values for `cardless_emi`:

- `hdfc`
- `icic`
- `idfb`
- `kkbk`
- `earlysalary`
- `walnut369`

List of Pay Later providers. Possible values for `paylater`:

- `lazypay`
- `paypal`

**Configure Payment Methods or Instruments**

Refer to the [Configurations](/razorpay-docs-md/payment-gateway/emi-/eligibility-check/configurations.md) doc for eligibility checks on specific methods or instruments.

### Response Parameters

Descriptions for the response parameters are present in the [Eligibility Check Entity](/razorpay-docs-md/payment-gateway/emi-/eligibility-check.md#eligibility-check-entity) parameters table.

### Error Response Parameters

Given below is the list of errors for eligibility check.

**Handy Tips** [Standard Errors](/razorpay-docs-md/api/understand.md) for Razorpay APIs are applicable.

Bad Request Errors

invalid\_inquiry

- **Source**: business
- **Error Cause**: Request
- **Description**: The inquiry parameter is invalid.
- **Next Steps**: Retry with a valid inquiry parameter.

invalid\_currency

- **Source**: business
- **Error Cause**: Request
- **Description**: The currency is invalid.
- **Next Steps**: Retry with a valid currency.

currency\_required

- **Source**: business
- **Error Cause**: Request
- **Description**: The currency field is required.
- **Next Steps**: Retry with required fields.

invalid\_user\_agent

- **Source**: business
- **Error Cause**: Request
- **Description**: The user agent is invalid.
- **Next Steps**: Retry with a valid user agent.

invalid\_ip

- **Source**: business
- **Error Cause**: Request
- **Description**: The IP is invalid.
- **Next Steps**: Retry with a valid IP.

mobile\_number\_required

- **Source**: business
- **Error Cause**: Request
- **Description**: Contact number is required.
- **Next Steps**: Retry with required fields.

invalid\_mobile\_number

15 digits max

- **Source**: business
- **Error Cause**: Request
- **Description**: Contact number should not be greater than 15 digits, including country code.
- **Next Steps**: Retry with a valid mobile number.

digits and + symbol only

- **Source**: business
- **Error Cause**: Request
- **Description**: Contact number can only contain digits and + symbol.
- **Next Steps**: Retry with a valid mobile number.

8 digits minimum

- **Source**: business
- **Error Cause**: Request
- **Description**: Contact number should be at least 8 digits, including country code.
- **Next Steps**: Retry with a valid mobile number.

amount\_required

- **Source**: business
- **Error Cause**: Request
- **Description**: Amount is required.
- **Next Steps**: Retry with required fields.

invalid\_amount

amount is not an integer

- **Source**: business
- **Error Cause**: Request
- **Description**: The amount must be an integer.
- **Next Steps**: Retry with a valid amount.

amount should be minimum INR 1.00

- **Source**: business
- **Error Cause**: Request
- **Description**: The amount must be at least INR 1.00.
- **Next Steps**: Retry with a valid amount.

invalid\_customer\_id

- **Source**: business
- **Error Cause**: Request
- **Description**: The customer ID is invalid.
- **Next Steps**: Retry with a valid customer ID.

customer\_id\_does\_not\_exist

- **Source**: business
- **Error Cause**: Request
- **Description**: The customer ID does not exist.
- **Next Steps**: Retry with a valid customer ID.

invalid\_instruments

- **Source**: business
- **Error Cause**: Request
- **Description**: The instruments array is invalid.
- **Next Steps**: Retry with a valid instruments array.

method\_not\_applicable

- **Source**: business
- **Error Cause**: Request
- **Description**: The eligibility check is not applicable on this method.
- **Next Steps**: Retry with a valid method.

provider\_not\_applicable

- **Source**: business
- **Error Cause**: Request
- **Description**: The eligibility check is not applicable on this provider.
- **Next Steps**: Retry with a valid provider.

card\_type\_not\_applicable

- **Source**: business
- **Error Cause**: Request
- **Description**: The eligibility check is not applicable on this card type.
- **Next Steps**: Retry with a valid card type.

issuer\_not\_applicable

- **Source**: business
- **Error Cause**: Request
- **Description**: The eligibility check is not applicable on this issuer.
- **Next Steps**: Retry with a valid issuer.

invalid\_method

- **Source**: business
- **Error Cause**: Request
- **Description**: The method is invalid.
- **Next Steps**: Retry with a valid method.

invalid\_provider

- **Source**: business
- **Error Cause**: Request
- **Description**: The provider is invalid.
- **Next Steps**: Retry with a valid provider.

invalid\_card\_type

- **Source**: business
- **Error Cause**: Request
- **Description**: The card type is invalid.
- **Next Steps**: Retry with a valid card type.

invalid\_issuer

- **Source**: business
- **Error Cause**: Request
- **Description**: The issuer is invalid.
- **Next Steps**: Retry with a valid issuer.

method\_not\_enabled

- **Source**: business
- **Error Cause**: Request
- **Description**: The method is not enabled for you.
- **Next Steps**: No Retry.

instrument\_not\_enabled

- **Source**: business
- **Error Cause**: Request
- **Description**: The provider is not enabled for you.
- **Next Steps**: No Retry.

max\_issuers\_limit

- **Source**: business
- **Error Cause**: Request
- **Description**: The number of issuers passed in the request must be less than 30.
- **Next Steps**: No Retry.

max\_providers\_limit

- **Source**: business
- **Error Cause**: Request
- **Description**: The number of providers passed in the request must be less than 30.
- **Next Steps**: No Retry.

max\_networks\_limit

- **Source**: business
- **Error Cause**: Request
- **Description**: The number of networks passed in the request must be less than 5.
- **Next Steps**: No Retry.

Gateway Errors

timed\_out

- **Source**: gateway
- **Error Cause**: All Gateways
- **Description**: The payment provider could not revert with a suitable response in time.
- **Next Steps**: Please retry after some time.

gateway\_technical\_error

- **Source**: gateway
- **Error Cause**: All Gateways
- **Description**: We are facing some trouble completing your request at the moment. Please try again shortly.
- **Next Steps**: Please retry after some time.

account\_does\_not\_exist

- **Source**: gateway
- **Error Cause**: getSimpl, lazypay, icic paylater
- **Description**: The customer doesn’t have an existing account with the provider.
- **Next Steps**: No Retry.

user\_not\_approved

- **Source**: gateway
- **Error Cause**: instacred, zestmoney, axio
- **Description**: The customer has not been approved by the partner.
- **Next Steps**: No Retry.

credit\_limit\_expired

- **Source**: gateway
- **Error Cause**: earlysalary
- **Description**: The customer’s credit limit has expired.
- **Next Steps**: No Retry.

credit\_limit\_exhausted

- **Source**: gateway
- **Error Cause**: getSimpl, lazypay
- **Description**: The customer has exhausted their credit limit.
- **Next Steps**: No Retry.

credit\_limit\_inactive

- **Source**: gateway
- **Error Cause**: zestmoney
- **Description**: The customer's credit limit is inactive.
- **Next Steps**: No Retry.

min\_amt\_required

- **Source**: gateway
- **Error Cause**: All Gateways
- **Description**: The order amount is less than the minimum transaction amount.
- **Next Steps**: No Retry.

max\_amt\_limit

- **Source**: gateway
- **Error Cause**: All Gateways
- **Description**: The order amount is above the maximum transaction amount limit.
- **Next Steps**: No Retry.

eligibility\_check\_within\_payment\_flow

- **Source**: gateway
- **Error Cause**: All Gateways
- **Description**: The eligibility will be checked at the time of payment.
- **Next Steps**: No Retry.

account\_blocked

- **Source**: gateway
- **Error Cause**: lazypay, icic paylater
- **Description**: The customer's account has been blocked by the partner.
- **Next Steps**: No Retry.

account\_disabled

- **Source**: gateway
- **Error Cause**: lazypay
- **Description**: The customer's account has been disabled by the partner.
- **Next Steps**: No Retry.

transaction\_suspended

- **Source**: gateway
- **Error Cause**: lazypay
- **Description**: Transaction for this merchant are temporary suspended by gateway.
- **Next Steps**: No Retry.

merchant\_account\_disabled

- **Source**: gateway
- **Error Cause**: lazypay
- **Description**: Gateway has disabled the account for this merchant.
- **Next Steps**: No Retry.

## Fetch Eligibility by id

The following endpoint retrieves the details of the eligibility check. Add the `eligibility_req_id` received in response previously.

GET

customers/eligibility/:eligibility\_req\_id

RequestSuccess ResponseFailure Response

copy

```bash
-X GET 'https://api.razorpay.com/v1/customers/eligibility/elig_F1cxDoHWD4fkQt' \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H "content-type: application/json"
```

### Path Parameter

eligibility\_req\_id

`string` The unique identifier of the eligibility request to be retrieved.

### Response Parameters

Descriptions for the response parameters are present in the [Eligibility Check Entity](/razorpay-docs-md/payment-gateway/emi-/eligibility-check.md#eligibility-check-entity) parameters table.

### Error Response Parameters

Given below is a list of possible errors you may face while fetching eligibility.

## Test Details

You can test the eligibility using our test phone numbers.

Debit Card EMI

Cardless EMI

Pay Later

Know the interest rates and minimum order amount for:

- [Debit Card EMI Providers](/razorpay-docs-md/payment-gateway/emi-/faqs.md#5-can-you-provide-a-list-of-the)
- [Cardless EMI Providers](/razorpay-docs-md/payment-gateway/emi-/faqs.md#1-what-are-the-standard-interest-rates-charged)
- [Pay Later Providers](/razorpay-docs-md/payment-gateway/emi-/faqs.md#2-what-are-the-standard-interest-rates-charged)
