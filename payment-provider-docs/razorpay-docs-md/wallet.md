<!-- Source: https://razorpay.com/docs/payments/wallet -->

**Watch Out!**

We have discontinued support for this product, effective April 2023. As a result, we will not be onboarding new users for this product anymore.

Razorpay White Label Wallet enables you to launch your own closed wallet using Razorpay APIs for a white-labeled solution. Razorpay wallet allows you to:

- Load money into a wallet
- Accept payments from a wallet
- Refund payments to a wallet
- Send cashbacks to a wallet

## Get Started

Follow the below steps to create Razorpay Wallet:

1. [Create a Customer](/razorpay-docs-md/api/customers.md#create-a-customer)

   : You must create a customer before creating a wallet. You can create a customer using the Dashboard or APIs. After creating a customer, a unique `customer_id` will be generated. You can use the `customer_id` parameter to manage the customer's wallet using APIs.
2. [Load money into a wallet](/razorpay-docs-md/wallet/wallet-operations.md#load-a-wallet)

   : After you load money for a customer, the first time, a wallet is created.

After completing the above steps, you can start [accepting payments from the wallet](/razorpay-docs-md/wallet/wallet-operations.md#accept-payments-from-a-wallet). For more operations on the wallet, refer to the [Wallet Operations](/razorpay-docs-md/wallet/wallet-operations.md) page.

### Related Information

- [Wallet Operations](/razorpay-docs-md/wallet/wallet-operations.md)
- [Payments Wallet API Reference](/razorpay-docs-md/wallet/api-reference.md)
