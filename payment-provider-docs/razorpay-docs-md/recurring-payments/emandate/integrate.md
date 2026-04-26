<!-- Source: https://razorpay.com/docs/payments/recurring-payments/emandate/integrate -->

The Recurring Payment integration for Emandate payment method involves the following steps:

1. [Emandate Registration](/razorpay-docs-md/recurring-payments/emandate/integrate.md#1-emandate-registration)
2. [Fetch Emandate Registration Details](/razorpay-docs-md/recurring-payments/emandate/integrate.md#2-fetch-emandate-registration-details)
3. [Charge Customers](/razorpay-docs-md/recurring-payments/emandate/integrate.md#3-charge-customers)

## Prerequisites

- Emandate is enabled by default. If it is not active on your account, contact [Razorpay Support](https://razorpay.com/support/)  .
- Use the [Fetch Methods API](/razorpay-docs-md/recurring-payments/emandate/supported-banks.md#fetch-supported-methods)

  to verify supported payment methods.
- Ensure the required banks from the [List of Supported Banks](/razorpay-docs-md/recurring-payments/emandate/supported-banks.md#emandate)

  are enabled for your account.

## 1. Emandate Registration

Emandate registration is a process of creating a payment checkout form for customers to make **Authorisation Transaction** and register their Emandate. A token will be generated once a customer makes this transaction.

Using this authorisation transaction, we can authenticate the customer's Emandate and ensure that we can charge them recurring payments.

### 1.1 Create Authentication Transaction

The authorisation transaction can be created using:

Razorpay Standard Checkout

Following is the authorisation transaction flow for Razorpay Standard Checkout method.

![transaction flow](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/recurring-payments-authorization_transaction_standard_checkout.jpg)

To create checkout form for customers to complete authorisation transaction using the Razorpay Standard Checkout method:

**Watch Out!**

The authorisation transaction using Standard Checkout can be created only using Razorpay APIs.

1. [**Create a customer**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#111-create-a-customer)

   This returns a `customer_id`.
2. [**Create an order**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#112-create-an-order)

   This returns an `order_id`. The order must be created for:
3. [**Create authorisation transaction**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#113-create-an-authorization-payment)

   Pass the `customer_id`, `order_id` and a few additional parameters in your checkout to create the authorisation payment. The customer completes the authorisation payment, which generates a `token`.

Video Tutorial

Watch the below video to learn how to integrate recurring payments via the Standard Checkout method.

Registration Link

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

Video Tutorials

Using Dashboard

Using APIs

Watch the below video to learn how to integrate recurring payments via the registration link method using Dashboard.

Registration Link Statuses

A registration link moves through the following states during its life cycle:

### 1.2 Complete Authentication

When setting up an Emandate, customers can authenticate the registration using one of three methods depending on their preferences.

- **Aadhaar-based authentication** (recommended): Provides real-time registration and instant confirmation.
- **Netbanking authentication**: Redirects customers to their bank's internet banking portal for credential-based verification.
- **Debit card authentication**: Allows customers to verify using their card details and OTP.

Given below are the detailed steps for each authentication method:

Aadhaar (Recommended Auth Type)

**Handy Tips**

Razorpay's real-time Aadhaar Emandate registration solution eliminates the traditional 2-4 day manual approval process, delivering instant registration confirmation in minutes.

By streamlining the authentication flow, Razorpay reduces failed first debits and customer drop-off, providing immediate status visibility to both businesses and customers.

Given below is the authentication process via Aadhaar:

1. The customer visits the registration link shared by you. This opens the invoice and displays the checkout. They enter their phone number and email and click **Authenticate**.

   ![customer enters phone and email on checkout](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-1.jpg)
2. They select the **Pay via Netbanking - Bank Account** payment method and proceed.

   ![customer selects payment method](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-2.jpg)
3. They select their preferred bank and the authentication mechanism. In this case, it is Aadhaar.

   ![customer selects bank and auth type](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-3.jpg)
4. They enter their bank details such as account number, account type, IFSC and account holder name.

   ![customer enters bank details](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-4.jpg)
5. The mandate summary page opens where customer then reviews the details and clicks **Proceed**.

   ![customer reviews details](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-5.jpg)
6. The bank's mandate registration form opens. Customer confirms the details and submits the mandate registration request.

   ![customer reviews details](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/aadhaar-mandate-checkout.jpg)
7. The customer reads the Aadhaar disclaimer and agrees to provide their Aadhaar details for authentication.

   ![customer reviews disclaimer](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/aadhaar-mandate-checkout-2.jpg)
8. The customer submits their Aadhaar details.

   ![customer enters aadhaar details](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/aadhaar-mandate-checkout-3.jpg)
9. The customer enters the OTP to complete 2FA.

   ![customer enters OTP](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/aadhaar-mandate-checkout-4.jpg)

   **Handy Tips**

   For mandate amounts above ₹15,000, the customer must complete a second OTP verification as part of Aadhaar authentication.
10. The customer is redirected to the NPCI mandate acceptance page.

    ![mandate acceptance](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/aadhaar-mandate-checkout-5.jpg)
11. They are then automatically redirected to the Razorpay mandate success page, where they must click **Proceed**.

    ![razorpay mandate summary page](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/aadhaar-mandate-checkout-6.jpg)
12. The customer is redirected to the invoice checkout page which shows the final status. This completes the netbanking authentication process.

    ![mandate confirmation via aadhaar auth](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/aadhaar-mandate-checkout-7.jpg)

Netbanking

Given below is the authentication process via netbanking:

1. The customer visits the registration link shared by you. This opens the invoice and displays the checkout. They enter their phone number and email and click **Authenticate**.

   ![customer enters phone and email on checkout](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-1.jpg)
2. They select the **Pay via Netbanking - Bank Account** payment method and proceed.

   ![customer selects payment method](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-2.jpg)
3. They select their preferred bank and the authentication mechanism. In this case, it is Netbanking.

   ![customer selects bank and auth type](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-3.jpg)
4. They enter their bank details such as account number, account type, IFSC and account holder name.

   ![customer enters bank details](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-4.jpg)
5. The mandate summary page opens where customer then reviews the details and clicks **Proceed**.

   ![customer reviews details](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-5.jpg)
6. The bank's mandate registration form opens. Customer confirms the details and submits the mandate registration request.

   ![emandate registration form submission](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-6.jpg)
7. The bank's netbanking login page opens. Here, customer enters their login credentials and completes OTP verification process.

   ![netbanking login](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-7.jpg)
8. The customer is redirected to the NPCI mandate acceptance page. They are then automatically redirected to the Razorpay mandate success page, where they must click **Proceed**.

   ![mandate acceptance](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-8.jpg)
9. The customer is redirected to the invoice checkout page which shows the final status. This completes the netbanking authentication process.

![mandate confirmation via netbanking](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-9.jpg)

Debit Card

Given below is the authentication process via debit card:

1. The customer visits the registration link shared by you. This opens the invoice and displays the checkout. They enter their phone number and email and click **Authenticate**.

   ![customer enters phone and email on checkout](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-1.jpg)
2. They select the **Pay via Netbanking - Bank Account** payment method and proceed.

   ![customer selects payment method](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-2.jpg)
3. They select their preferred bank and the authentication mechanism. In this case, it is debit card.

   ![customer selects bank and auth type](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-3.jpg)
4. They enter their bank details such as account number, account type, IFSC and account holder name.

   ![customer enters bank details](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-4.jpg)
5. The mandate summary page opens where customer then reviews the details and clicks **Proceed**.

   ![customer reviews details](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-5.jpg)
6. The bank's mandate registration form opens. The customer enters the debit card details and submits the mandate registration request.

   ![emandate registration form submission](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-debit-card-reg-form.jpg)
7. They complete the OTP verification process.

   ![emandate OTP verification](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-debit-card-otp.jpg)
8. The customer is redirected to the NPCI mandate acceptance page. They are then automatically redirected to the Razorpay mandate success page, where they must click **Proceed**.

   ![mandate acceptance](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-debit-card-mandate.jpg)
9. The customer is redirected to the invoice checkout page which shows the final status. This completes the netbanking authentication process.

![mandate confirmation via netbanking](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/emandate-netbanking-checkout-9.jpg)

### Authorisation Payment Statuses

Once the customer has made the Authorisation Payment, it moves through the following states as per the [payment flow](/razorpay-docs-md/payment-gateway/how-it-works.md):

## 2. Fetch Token and Verify States

This is a process of fetching the token that contains the registration details of the customer and checking its status.

A token represents a mandate registration and is generated after the authorisation transaction is successfully captured. A token contains customer's payment details stored by Razorpay and is used to create a recurring payment.

**Handy Tips**

For simplicity, tokens are considered to be mandates. Hence, the status of the token determines the status of the mandate registration.

You can search for the tokens using the following:

- [APIs](/razorpay-docs-md/api/payments/recurring-payments/emandate/tokens.md)
- [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token)
- [Webhooks](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-token-status-using-webhooks)

Token Statuses

As the authorisation transaction moves through its different states, the token that is generated also undergoes state changes. Following is the life cycle of a token:

![ Token life cycle](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/rec-pmnts-2_1_1_1.jpg)

Know more about the turnaround time (TAT) for Emandate from the [FAQs](/razorpay-docs-md/recurring-payments/emandate/faqs.md#5-what-is-the-timeline-for-emandate-token).

## 3. Charge Customers

This is the process of charging customers the actual subsequent amount using the fetched token and customer details.

**Handy Tips**

Subsequent payments can be charged without the need of any intervention from the customer. However, subsequent payments need to be created manually by you.

Once a token goes to the confirmed state, you can start creating recurring payments for the customer as per your business requirements.

**Handy Tips**

If you want to collect the first payment immediately, you can [charge customers during registration](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md) itself, combining authorisation and the first debit into a single step.

You can create subsequent payments using:

Using the Dashboard

To create subsequent payments using the Dashboard:

1. [**Search for the token and check its status**](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token)

   After the authorisation transaction is complete, a token is generated. You can use the search feature on the Dashboard to find the required token and check its status.
2. [**Charge the token**](/razorpay-docs-md/recurring-payments/create.md#4-charge-the-token)

   After you have found the required confirmed token, you can create a subsequent payment by charging the token according to your business needs.

**Order is Created Automatically**

While creating a subsequent charge using the Dashboard, Razorpay automatically creates an order for you when you charge a token. There is no need to create an order separately.

Using APIs

![](https://razorpay.com/docs/payments/recurring-payments/emandate/build/browser/assets/images/rec-pmnts-4_1.jpg)

To create subsequent payments using APIs:

1. [**Create a new Order**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-subsequent-payments.md#31-create-an-order-to-charge-the-customer)

   Like any other payment, each subsequent payment is tied to a unique order id. Associating a payment with an order id makes it easier to query Razorpay systems and handle multiple payment attempts and allows automatic capturing of payments.
2. [**Create a Payment**](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-subsequent-payments.md#32-create-a-recurring-payment)

   Once the order is created, you can create a payment for it.
   After our system validates the payment along with `token_id`, a `razorpay_payment_id` is returned. In some cases, the payment entity returned is in the created state and may take 1 working day for confirmation.

### Related Information

- [Supported Banks and Apps](/razorpay-docs-md/recurring-payments/emandate/supported-banks.md)
- [APIs](/razorpay-docs-md/recurring-payments/emandate/apis.md)
- [Handle Errors](/razorpay-docs-md/recurring-payments/emandate/errors.md)
