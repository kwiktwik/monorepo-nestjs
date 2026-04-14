<!-- Source: https://razorpay.com/docs/payments/recurring-payments/upi/integrate -->

The Recurring Payment integration involves the following steps:

1. [Mandate Registration](/razorpay-docs-md/recurring-payments/upi/integrate.md#1-mandate-registration)
2. [Fetch Mandate Registration Details](/razorpay-docs-md/recurring-payments/upi/integrate.md#2-fetch-emandate-registration-details)
3. [Charge Customers](/razorpay-docs-md/recurring-payments/upi/integrate.md#3-charge-customers)

## Prerequisites

- Raise a request with our [Support team](https://razorpay.com/support/#request)

  to get Recurring Payments activated on your account you are trying to integrate.
- Check if the UPI is enabled using the [Fetch Supported Methods](/razorpay-docs-md/recurring-payments/upi/supported-banks.md#fetch-supported-methods)

  API. Also, check the list of [supported banks and apps](/razorpay-docs-md/recurring-payments/upi/supported-banks.md)

  for UPI Recurring and enable it for your account.

## 1. Mandate Registration

Mandate registration is a process of creating a payment checkout form for customers to make **Authorisation Transaction** and register their UPI. A token will be generated once a customer makes this transaction.

Using this authorisation transaction, we can authenticate the customer's UPI and ensure that we can charge them recurring payments. The authorisation transaction can be created using Razorpay Standard Checkout or Registration Link.

**Handy Tips**

The lending businesses can restrict their customers from pausing and cancelling the mandate by enabling OC125 functionality. Raise a request with our [Support team](https://razorpay.com/support/#request) to enable the same.

Using Razorpay Standard Checkout

Using a Registration Link

Following is the authorisation transaction flow for Razorpay Standard Checkout method.

![](https://razorpay.com/docs/payments/recurring-payments/upi/build/browser/assets/images/recurring-payments-authorization_transaction_standard_checkout.jpg)

To create checkout form for customers to complete authorisation transaction using the Razorpay Standard Checkout method:

**Watch Out!**

The authorisation transaction using standard checkout can be created only using Razorpay APIs.

1. [**Create a customer**](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#111-create-a-customer)

   This returns a `customer_id`.
2. [**Create an order**](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#112-create-an-order)

   This returns an `order_id`. The order must be created for:
3. [**Create authorisation transaction**](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#113-create-an-authorization-payment)

   Pass the `customer_id`, `order_id` and a few additional parameters in your checkout to create the authorization payment. The customer completes the authorization payment, which generates a `token`.

### Authorisation Payment Statuses

Once the customer has made the Authorisation Payment, it moves through the following states as per the [payment flow](/razorpay-docs-md/payment-gateway/how-it-works.md):

## 2. Fetch Mandate Registration Details

This is a process of fetching the token that contains the registration details of the customer and checking its status.

A token represents a mandate registration and is generated after the authorisation transaction is successfully captured. A token contains customer's payment details stored by Razorpay and is used to create a recurring payment.

**Handy Tips**

For simplicity, tokens are considered to be mandates. Hence, the status of the token determines the status of the mandate registration.

You can search for the tokens using the following:

- [APIs](/razorpay-docs-md/api/payments/recurring-payments/upi/tokens.md)
- [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token)
- [Webhooks](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-token-status-using-webhooks)

### Token Statuses

As the authorisation transaction moves through its different states, the token that is generated also undergoes state changes. Following is the life cycle of a token:

![ Token life cycle](https://razorpay.com/docs/payments/recurring-payments/upi/build/browser/assets/images/rec-pmnts-2_1_1_1.jpg)

Know more about the turnaround time (TAT) for UPI from the [FAQs](/razorpay-docs-md/recurring-payments/upi/faqs.md).

## 3. Charge Customers

This is the process of charging customers the actual subsequent amount using the fetched token and customer details.

**Watch Out!**

- It may take 24-36 hours for the subsequent payment to reflect on your Dashboard. This is because of the failure of pre-debit notification and/or any retries that we attempt for the payment.
- **Do not** create subsequent payments on the last day of the cycle. This will cause the payment to fail.
- Subsequent payments can be charged without the need of any intervention from the customer. However, subsequent payments need to be created manually by you.

Once a token goes to the confirmed state, you can start creating recurring payments for the customer as per your business requirements.

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
