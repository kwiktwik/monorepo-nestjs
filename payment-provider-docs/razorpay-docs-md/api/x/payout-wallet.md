<!-- Source: https://razorpay.com/docs/api/x/payout-wallet -->

# Payout Wallet APIs - Amazon

Copy for AI

View as Markdown

With Payout Wallet APIs, make payouts to your Contact's Amazon Pay Gift Card wallet from [RazorpayX Lite](/docs/x/account-types/razorpayx-lite/). You can process payouts up to ₹10,000 per transaction multiple times in a day. Know more about [Amazon Gift Cards](/docs/x/payout-wallet/amazon/).

Creating the Contact and Fund account before making a payout helps you improve payout processing time. You can continue to use the Contact and Fund account details (instead of Ids) in the composite API to make payouts. This does not create duplicate Contacts or Fund accounts in your system.

Idempotency allows you to safely retry or send the same request multiple times without the fear of performing the same action more than once. Know more about [Payout Idempotency](/razorpay-docs-md/api/x/payout-idempotency.md).

Fork the Razorpay Postman Public Workspace and try the Payout Wallet API using your [Test API Keys](/docs/x/dashboard/api-keys/). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-1706cd68-1bcc-4879-ba60-90b4289449bd)

Related Guides: [About Amazon Payout Wallet](/docs/x/payout-wallet/amazon/) [Set Up Webhooks](/docs/webhooks/setup-edit-payouts/) [Webhook Payloads](/docs/webhooks/) [Amazon Brand Guidelines](/docs/x/payout-wallet/amazon/branding-guidelines/)

Endpoints

04 [Create a Contact

POST

Creates contact for Amazon Pay Gift Card.](/razorpay-docs-md/api/x/payout-wallet/create/contact.md) [Create a Fund Account of type `wallet`

POST

Creates a `wallet` fund account for your Contact to receive Amazon Pay Gift Card.](/razorpay-docs-md/api/x/payout-wallet/create/fund-account.md) [Create a Payout

POST

Creates a normal payout to your Contact's Amazon Pay Gift Card.](/razorpay-docs-md/api/x/payout-wallet/create/payout.md) [Make Payouts to Amazon Pay Wallet Using Composite API

POST

Create a Contact, Fund Account and make the payout to your Contact's Amazon Pay Gift Card in a single API call.](/razorpay-docs-md/api/x/payout-wallet/create/payout-composite.md)
