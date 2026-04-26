<!-- Source: https://razorpay.com/docs/payments/route/integration-guide -->

Razorpay Route can split payments between third parties, sellers or bank accounts.

## Prerequisites

- Create a Razorpay account.
- Log in to the Dashboard and [generate the API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)  . You need to use these keys while using our APIs and Checkout.

## Integration Steps

Follow these steps to integrate Razorpay Route:

#### 1. Build Integration

Integrate Route.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow these steps to create Linked Accounts and transfer funds to them.

Step 1.1 Create Linked Accounts

To transfer funds to various third parties, sellers, bank accounts or vendors, you should add them as Linked Accounts. When you add a Linked Account, you gain complete visibility and control of all the fund movements, such as transfers, reversals and refunds for each of your Linked Accounts.

You can create Linked Accounts using [Dashboard](/razorpay-docs-md/route/linked-account.md#add-and-manage-linked-accounts) and APIs. Follow these steps to create Linked Accounts using APIs:

1.1.1 Create a Linked Account [Create a Linked Account](/razorpay-docs-md/api/payments/route/create-linked-account.md) using the API. A unique `account_id` will be assigned to the created account.

1.1.2. Create a Stakeholder

You should now [create a stakeholder](/razorpay-docs-md/api/payments/route/create-stakeholder.md) using the `account_id`. A unique `stakeholder_id` will be assigned to the created stakeholder account.

1.1.3. Request a Product Configuration

Now that both Linked Account and stakeholder are created, you should [request a Route product configuration](/razorpay-docs-md/api/payments/route/request-product-config.md).

1.1.4. Update a Product Configuration

You should now trigger the [update product configuration](/razorpay-docs-md/api/payments/route/update-product-config.md)

API with the bank account details of the Linked Account. The configuration will be activated if the information review is successful.

If the `activation_status` moves to the `needs_clarification` state, you can check the `requirements` array in the response for `needs_clarification` reasons. The array will contain the following information:

You should use the endpoint in the `resolution_url` to update the details and get the configuration activated.

Step 1.2 Transfer Funds to Linked Accounts

After you create Linked Accounts, you can start transferring funds to them. You can transfer funds using the following methods:

- [Orders](/razorpay-docs-md/route/transfer-funds-to-linked-accounts.md#transfer-via-orders)

  : You can set up transfers at the time of order creation. The transfer is automatically created and settled to the respective Linked Accounts after the payment is captured and the order is paid.
- [Payments](/razorpay-docs-md/route/transfer-funds-to-linked-accounts.md#transfers-via-payments)

  : You can initiate a transfer from the received payments.
- [Direct Transfer](/razorpay-docs-md/route/transfer-funds-to-linked-accounts.md#direct-transfers)

  : You can transfer funds to Linked Accounts directly from your account balance using Direct Transfers.

**Requirements to Initiate a Transfer**

- Maintain sufficient funds to successfully process the transfer to the Linked Account.
- You can only transfer the `captured` payments.
- You can create more than one transfer on a `payment_id`. However, the total transfer amount (payment amount + fee) should not exceed the captured payment amount.
- You cannot request a transfer on payment once a refund has been initiated.

## 2. Test Integration

After completing the integration, you can simulate a test transfer in the test mode using the [Transfer via Payment](/razorpay-docs-md/route/transfer-funds-to-linked-accounts.md#transfers-via-payments) or [Direct Transfer](/razorpay-docs-md/route/transfer-funds-to-linked-accounts.md#direct-transfers) methods from the Dashboard.

**Watch Out!**

Transfers via orders can only be done using [APIs](/razorpay-docs-md/api/payments/route/create-transfers-orders.md).

## 3. Go-live Checklist

Consider the following steps before taking your integration live.

3.1 Switch Test API Keys With Live API Keys

- After confirming your integration is working successfully, you can take the integration live by switching the Test Mode API Keys with the Live Mode Keys.

  Watch this video to learn how to generate Live API keys:
- You can create live Transfers to Linked Accounts created in the Test Mode.

3.2 Subscribe to Webhooks [Set up Webhooks](/docs/webhooks/setup-edit-payments/) to configure and receive notifications when a specific event occurs. When one of these events is triggered, we send an HTTP POST payload in JSON to the webhook's configured URL. You can subscribe to these [Route webhook events](/docs/webhooks/route/#route).

## Appendix

This section provides information about business type, category, sub-category, KYC requirements and their possible values.

Business Type

The following table lists the supported Business Types:

Business Category

The following table lists the possible values for Business Category:

Business Sub-Category

The following table lists the possible values for Business Sub-Category:

KYC Requirements

Given below are the [KYC Requirements](/razorpay-docs-md/route/build/browser/assets/images/Razorpay_Sub-Merchant_Onboarding_KYC_Requirements_and_User_Communications.md).

### Related Information

- [Route API](/razorpay-docs-md/api/payments/route.md)
- [Route Webhooks](/razorpay-docs-md/route/subscribe-to-webhooks.md)
