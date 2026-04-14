<!-- Source: https://razorpay.com/docs/payments/recurring-payments/cards/integrate -->

In India, recurring payments were restrictive in the past because of the RBI's requirement for a two-step verification process where the customer required to enter a One-Time Password (OTP), received via email or SMS, to complete the payment. In recent times, due to the relaxation of this requirement, you can define the interval in which you can charge customers automatically.

Tokenisation for Card based Recurring Payments

To process recurring mandates, customer card details must be secured/tokenised in accordance with applicable laws. Razorpay Checkout explicitly collects customer consent for tokenising the card to process e-mandate/recurring transactions.

![Tokenisation for card based Recurring Payments on Checkout](https://razorpay.com/docs/payments/recurring-payments/cards/build/browser/assets/images/caw-checkout.gif)

Recurring Payment integration involves the following steps:

1. [Register Card Mandate Registration](/razorpay-docs-md/recurring-payments/cards/integrate.md#1-register-card-mandate)
2. [Fetch Card Mandate Registration Details](/razorpay-docs-md/recurring-payments/cards/integrate.md#2-fetch-card-mandate-registration-details)
3. [Charge Customers](/razorpay-docs-md/recurring-payments/cards/integrate.md#3-charge-customers)

## 1. Register Card Mandate

Mandate registration is a process of creating a payment checkout form for customers to make **Authorisation Transaction** and register their card mandate. A token will be generated once a customer makes this transaction.

Using this authorisation transaction, we can authenticate the customer's card mandate and ensure that we can charge them recurring payments. The authorisation transaction can be created using the following methods:

Using Razorpay Standard Checkout

Using a Registration Link

Following is the authorisation transaction flow for Razorpay Standard Checkout method.

![Authorisation transaction flow for Razorpay Standard Checkout](https://razorpay.com/docs/payments/recurring-payments/cards/build/browser/assets/images/recurring-payments-authorization_transaction_standard_checkout.jpg)

To create checkout form for customers to complete authorisation transaction using the Razorpay Standard Checkout method:

**Watch Out!**

The authorisation transaction using Standard Checkout can be created only using Razorpay APIs.

1. [**Create a customer**](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#111-create-a-customer)

   This returns a `customer_id`.
2. [**Create an order**](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#112-create-an-order)

   This returns an `order_id`. The order must be created for:
3. [**Create authorisation transaction**](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#113-create-an-authorization-payment)

   Pass the `customer_id`, `order_id` and a few additional parameters in your checkout to create the authorisation payment. The customer completes the authorisation payment, which generates a `token`.

## 2. Fetch Card Mandate Registration Details

This is a process of fetching the token that contains the registration details of the customer and checking its status.

A token represents a mandate registration and is generated after the authorisation transaction is successfully captured. A token contains customer's payment details stored by Razorpay and is used to create a recurring payment.

**Handy Tips**

For simplicity, tokens are considered to be mandates. Hence, the status of the token determines the status of the mandate registration.

You can search for the tokens using:

- [APIs](/razorpay-docs-md/api/payments/recurring-payments/cards/tokens.md)
- [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token)
- [Webhooks](/razorpay-docs-md/recurring-payments/subscribe-to-webhooks.md#token-states)

Token Statuses

As the authorisation transaction moves through its different states, the token that is generated also undergoes state changes. Following is the life cycle of a token:

![Token life cycle](https://razorpay.com/docs/payments/recurring-payments/cards/build/browser/assets/images/rec-pmnts-2_1_1_1.jpg)

Know more about the turnaround time (TAT) for cards from the [FAQs](/razorpay-docs-md/recurring-payments/cards/faqs.md).

## 3. Charge Customers

This is the process of charging customers the actual subsequent amount using the fetched token and customer details.

**Handy Tips**

- Subsequent payments can be charged without the need of any intervention from the customer. However, subsequent payments need to be created manually by you.
- Once a token goes to the confirmed state, you can start creating recurring payments for the customer as per your business requirements.

You can create subsequent payments using Dashboard or APIs.

Using Dashboard

Using APIs

To create subsequent payments using the Dashboard:

1. [**Search for the token and check its status**](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token)

   After the authorisation transaction is complete, a token is generated. You can use the search feature on the Dashboard to find the required token and check its status.
2. [**Charge the token**](/razorpay-docs-md/recurring-payments/create.md#4-charge-the-token)

   After you have found the required confirmed token, you can create a subsequent payment by charging the token according to your business needs.

**Order is Created Automatically**

While creating a subsequent charge using the Dashboard, Razorpay automatically creates an order for you when you charge a token. There is no need to create an order separately.

### Related Information

- [Supported Banks and Apps](/razorpay-docs-md/recurring-payments/cards/supported-banks.md)
- [APIs](/razorpay-docs-md/recurring-payments/cards/apis.md)
