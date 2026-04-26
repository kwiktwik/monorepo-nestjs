<!-- Source: https://razorpay.com/docs/payments/offers/low-cost-emi/s2s-integration -->

You can integrate Low Cost EMI offers with your payment flows while integrating directly with our APIs.

## Prerequisites

Generate the API keys to start your integration. The keys are required for authenticating API requests with our servers.

Log in to the Dashboard to generate the API keys, if you have not done earlier. To make the direct API calls, you need the `Key_Secret`.

## Integration Steps

1. [Create a Low Cost EMI Offer](/razorpay-docs-md/offers/low-cost-emi/s2s-integration.md#step-1-create-a-low-cost-emi-offer)
2. [Create an Order and Pass Offer\_id](/razorpay-docs-md/offers/low-cost-emi/s2s-integration.md#step-2-create-an-order-and-pass-offer-id)
3. [Create a Payment](/razorpay-docs-md/offers/low-cost-emi/s2s-integration.md#step-3-create-a-payment)
4. [Show the Offer on Checkout](/razorpay-docs-md/offers/low-cost-emi/s2s-integration.md#step-4-show-the-offer-on-checkout)
5. [Verify the Payment](/razorpay-docs-md/offers/low-cost-emi/s2s-integration.md#step-5-verify-the-payment)

## Step 1: Create a Low Cost EMI Offer [Create a Low Cost EMI offer](/razorpay-docs-md/offers/create.md) from the Dashboard.

**Watch Out!**

After the offer creation, you need to save the breakdown of the interest rate percentage (subvented by you and your customer) and offer ID for each tenure at your end to [show the offer on checkout](/razorpay-docs-md/offers/low-cost-emi/s2s-integration.md#step-4-show-the-offer-on-checkout).

## Step 2: Create an Order and Pass Offer\_id

After generating the offer from the Dashboard, pass the `offer_id` in the order request attributes to the following endpoint:

**Watch Out!**

For Low Cost EMI, a separate `offer_id` is created for each tenure.

POST

/orders

Sample RequestJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 1000,
  "currency": "INR",
  "offer_id": "offer_DtEhEm3XslgfXE"
}'
```

## Step 3: Create a Payment

Send the following attributes required to create a payment at the following endpoint:

POST

/payments/create/json

### Sample Code

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json \
-H "Content-Type: application/json" \
-d'{
  "amount": 1000,
  "currency": "INR",
  "contact": 8888888888,
  "email": "gaurav@gmail.com",
  "order_id": "order_CjyltuCttYiMe8",
  "method": "emi",
  "emi_duration": 9,
  "card":{
    "number": "4386289407660153",
    "name": "Gaurav",
    "expiry_month": 11,
    "expiry_year": 30,
    "cvv": 100
  }
}'
```

### Request Parameters

key\_id

mandatory

`string` The key id that you have generated from the **API Keys** tab in the Dashboard.

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, `INR`. Refer to the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

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

`string` Name of the payment method. Possible value is `emi`.

card

Details associated with the card. Required if the payment method is `card`.

number

mandatory

`string` Unformatted card number. Required if the method is `card`.

name

mandatory

`string` Name of the cardholder. Required if the method is `card`.

expiry\_month

mandatory

`integer` Expiry month for card in `MM` format. Required if the method is `card`.

expiry\_year

mandatory

`string` Expiry year for card in `YY` format. Required if the method is `card`.

cvv

mandatory

`string` CVV printed on the back of card. Required if the method is `card`.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

emi\_duration

`string` The EMI duration in months. Required if the method is `emi`.

notes

optional

`object` Key-value object used for passing tracking info. Refer to [Notes](/razorpay-docs-md/api/understand.md#notes) for more details.

callback\_url

optional

`string` URL endpoint where Razorpay will submit the final payment status.

referrer

optional

`string` Referrer header passed by the client's browser.

user\_agent

optional

`string` Customer user-agent.

### Response Parameters

If the payment request is valid, the response contains the following fields.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible values:

- `otp_generate`: Use this URL to allow the customer to generate OTP and complete the payment on your webpage.
- `redirect`: Use this URL to redirect the customer to submit the OTP on the bank page.

url

`string` URL to be used for the action indicated.

## Step 4: Show the Offer on Checkout

You need to show the availability of Low Cost EMI Offers on checkout. Customers should be able to clearly view the discount on interest being given to them and how much interest they need to bear.

For example, you can view the image below to see how Low Cost EMI offers appear on [Razorpay Standard Checkout](/razorpay-docs-md/payment-methods/emi/low-cost-emi.md).

![Low Cost EMI on Standard Checkout](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/low-cost-emi-standard.jpg)

## Step 5: Verify the Payment

Once the customer completes the payment, a `POST` request is sent to the `callback_url` provided in the [payment create request](/razorpay-docs-md/offers/low-cost-emi/s2s-integration.md#step-3-create-a-payment). The data contained in the `POST` request depends on the **success** or **failure** of the payment made by the customer.

## Next Steps

After the customer has availed the offers and made the payment on the Checkout, you can track the status of the payments:

- From the Dashboard.
- By [configuring webhooks](/docs/webhooks/)  .
- By polling our [payment APIs](/razorpay-docs-md/api/index.md#fetch-payments-based-on-orders)  .

### Related Information

- [About Low Cost EMI Offers](/razorpay-docs-md/offers/low-cost-emi.md)
- [Create Low Cost EMI Offers](/razorpay-docs-md/offers/low-cost-emi/create.md)
- [Tutorial - How to Create Low Cost EMI Offers](/razorpay-docs-md/offers/low-cost-emi/tutorial.md)
