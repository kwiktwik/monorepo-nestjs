<!-- Source: https://razorpay.com/docs/api/x/payouts-cards -->

# Payouts to Cards APIs

With Payouts to Cards APIs, you can make payouts directly to a credit card, debit card or prepaid card. Payouts via **Visa Direct** and **MasterCard Send** are temporarily unavailable. Know more about the [supported networks](/docs/x/payouts/cards/#supported-networks-and-banks).

**Feature Request**

This is an on-demand feature and available only to PCI-compliant merchants. To enable this feature, raise a request using the [support form](https://razorpay.com/support/) on the RazorpayX Dashboard.

Adhering to the RBI guidelines, you can either make a payout without saving card details or save a card details with a tokenisation service - [Razorpay TokenHQ](https://razorpay.com/card-tokenisation/) or any external token provider. Payouts to these tokenised cards can be made using the mode `card`. [Allowlist IPs](/docs/x/dashboard/allowlist-ip/) that you use while making payouts via APIs and pass the [idempotency key](/razorpay-docs-md/api/x/payout-idempotency.md). [Create a Contact](/razorpay-docs-md/api/x/contacts/create.md) and [Fund Account](/razorpay-docs-md/api/x/fund-accounts.md) before creating payouts.

Fork the Razorpay Postman Public Workspace and try the Payouts to Cards APIs using your [Test API Keys](/docs/x/dashboard/api-keys/). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/f960539b-c56c-41e5-810b-63d2a89d447e/folder/12492020-0a7f8d61-ca43-439c-80db-a6fb08877a5f)

Related Guides: [About Payout to Cards](/docs/x/payouts/cards/) [Set up Webhooks](/docs/webhooks/setup-edit-payouts/) [Webhooks Payloads](/docs/webhooks/) [Status Details](/docs/errors/x/payout-status-details/)

Endpoints

05 [Create a Payout

POST

Make a payout to a card without saving the card details.](/razorpay-docs-md/api/x/payouts-cards/create/without-saving-card.md) [Create Fund Account

POST

Creates a fund account for a card tokenised by external token providers.](/razorpay-docs-md/api/x/payouts-cards/create/save-card/external-token/fund-account.md) [Create a Payout

POST

Makes a payout to a card tokenised by external token providers.](/razorpay-docs-md/api/x/payouts-cards/create/save-card/external-token/payout.md) [Create Fund Account

POST

Creates a fund account for a card tokenised by Razorpay TokenHQ.](/razorpay-docs-md/api/x/payouts-cards/create/save-card/razorpay-tokenhq/fund-account.md) [Create a Payout

POST

Makes a payout to a card tokenised by Razorpay TokenHQ.](/razorpay-docs-md/api/x/payouts-cards/create/save-card/razorpay-tokenhq/payout.md)
