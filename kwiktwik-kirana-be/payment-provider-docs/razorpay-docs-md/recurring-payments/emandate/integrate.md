<!-- Source: https://razorpay.com/docs/payments/recurring-payments/emandate/integrate -->

The Recurring Payment integration involves the following steps:

1. [Emandate Registration](/razorpay-docs-md/recurring-payments/emandate/integrate.md#emandate-registration)
2. [Fetch Emandate Registration Details](/razorpay-docs-md/recurring-payments/emandate/integrate.md#fetch-emandate-registration-details)
3. [Charge Customers](/razorpay-docs-md/recurring-payments/emandate/integrate.md#charge-customers)

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/feature-request.gif)

## Prerequisites

- Check supported payment method for Emandate using the [Fetch Methods](/razorpay-docs-md/recurring-payments/emandate/supported-banks.md#fetch-supported-methods)

  API.
- Check the list of [Supported Banks](/razorpay-docs-md/recurring-payments/emandate/supported-banks.md#emandate)

  for Emandate and enable the same for your account.

## Emandate Registration

Emandate registration is a process of creating a payment checkout form for customers to make **Authorisation Transaction** and register their Emandate. A token will be generated once a customer makes this transaction.

Using this authorisation transaction, we can authenticate the customer's Emandate and ensure that we can charge them recurring payments. The authorisation transaction can be created using the following methods:

- [Razorpay Standard Checkout](/razorpay-docs-md/recurring-payments/emandate/integrate.md#using-razorpay-standard-checkout)

  .
- [Registration Link](/razorpay-docs-md/recurring-payments/emandate/integrate.md#using-a-registration-link)

  .

### Using Razorpay Standard Checkout

Following is the authorisation transaction flow for Razorpay Standard Checkout method.

![transaction flow](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/recurring-payments-authorization_transaction_standard_checkout.jpg)

To create checkout form for customers to complete authorisation transaction using the Razorpay Standard Checkout method:

**Watch Out!**

The authorisation transaction using standard checkout can be created only using Razorpay APIs.

1. [**Create a customer**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#111-create-a-customer)

   This returns a `customer_id`.
2. [**Create an order**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#112-create-an-order)

   This returns an `order_id`. The order must be created for:
3. [**Create authorisation transaction**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#113-create-an-authorization-payment)

   Pass the `customer_id`, `order_id` and a few additional parameters in your checkout to create the authorisation payment. The customer completes the authorisation payment, which generates a `token`.

#### Video Tutorial

Watch the below video to learn how to integrate recurring payments via the standard checkout method.

### Using a Registration Link

Registration Links are securely generated web addresses that allow your customers to complete the authorisation transaction. Registration links can be sent via SMS or email.

Following is the authorisation transaction flow for Razorpay registration link method:

![Recurring Payments Using Registration Link](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/recurring-payments-recurring_payments_registration_link.jpg)

For customers to complete the authorisation transaction via a registration link, you should **create a registration link and send it to your customer**

You can create a Registration Link using:

- [APIs](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#121-create-a-registration-link)
- [Dashboard](/razorpay-docs-md/recurring-payments/create.md#1-create-a-registration-link)

The customer completes the authorisation payment, which generates a `token`.

**No Need to Create a Customer and Order Separately**

If you use a registration link to create the authorisation transaction, Razorpay automatically creates a customer and the order for you.

#### Video Tutorials

**Using Dashboard**
Watch the below video to learn how to integrate recurring payments via the registration link method using Dashboard.

**Using APIs**
Watch the below video to learn how to integrate recurring payments via the registration link method using APIs.

#### Registration Link Statuses

A registration link moves through the following states during its life cycle:

### Authorisation Payment Statuses

Once the customer has made the Authorisation Payment, it moves through the following states as per the [payment flow](/razorpay-docs-md/payment-gateway/how-it-works.md):

## Fetch Emandate Registration Details

This is a process of fetching the token that contains the registration details of the customer and checking its status.

A token represents a mandate registration and is generated after the authorisation transaction is successfully captured. A token contains customer's payment details stored by Razorpay and is used to create a recurring payment.

**Handy Tips**

For simplicity, tokens are considered to be mandates. Hence, the status of the token determines the status of the mandate registration.

You can search for the tokens using the following:

- [APIs](/razorpay-docs-md/api/payments/recurring-payments/emandate/tokens.md)
- [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token)
- [Webhooks](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-token-status-using-webhooks)

### Token Statuses

As the authorisation transaction moves through its different states, the token that is generated also undergoes state changes. Following is the life cycle of a token:

![ Token life cycle](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/rec-pmnts-2_1_1_1.jpg)

Know more about the turnaround time (TAT) for Emandate from the [FAQs](/razorpay-docs-md/recurring-payments/emandate/faqs.md#5-what-is-the-timeline-for-emandate-token).

## Charge Customers

This is the process of charging customers the actual subsequent amount using the fetched token and customer details.

**Handy Tips**

Subsequent payments can be charged without the need of any intervention from the customer. However, subsequent payments need to be created manually by you.

Once a token goes to the confirmed state, you can start creating recurring payments for the customer as per your business requirements.

You can create subsequent payments using:

- [Dashboard](/razorpay-docs-md/recurring-payments/emandate/integrate.md#using-the-dashboard)
- [APIs](/razorpay-docs-md/recurring-payments/emandate/integrate.md#using-apis)

### Using the Dashboard

To create subsequent payments using the Dashboard:

1. [**Search for the token and check its status**](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token)

   After the authorisation transaction is complete, a token is generated. You can use the search feature on the Dashboard to find the required token and check its status.
2. [**Charge the token**](/razorpay-docs-md/recurring-payments/create.md#4-charge-the-token)

   After you have found the required confirmed token, you can create a subsequent payment by charging the token according to your business needs.

**Order is Created Automatically**

While creating a subsequent charge using the Dashboard, Razorpay automatically creates an order for you when you charge a token. There is no need to create an order separately.

### Using APIs

![](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/rec-pmnts-4_1.jpg)

To create subsequent payments using APIs:

1. [**Create a new Order**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-subsequent-payments.md#31-create-an-order-to-charge-the-customer)

   Like any other payment, each subsequent payment is tied to a unique order id. Associating a payment with an order id makes it easier to query Razorpay systems and handle multiple payment attempts and allows automatic capturing of payments.
2. [**Create a Payment**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-subsequent-payments.md#32-create-a-recurring-payment)

   Once the order is created, you can create a payment for it.
   After our system validates the payment along with `token_id`, a `razorpay_payment_id` is returned. In some cases, the payment entity returned is in the created state and may take 1 working day for confirmation.

### Related Information

- [Charge Customers During Registration](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md)
- [Supported Banks and Apps](/razorpay-docs-md/recurring-payments/emandate/supported-banks.md)
- [APIs](/razorpay-docs-md/recurring-payments/emandate/apis.md)
- [Handle Errors](/razorpay-docs-md/recurring-payments/emandate/errors.md)
