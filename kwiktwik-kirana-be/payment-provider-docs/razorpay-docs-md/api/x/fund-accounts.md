<!-- Source: https://razorpay.com/docs/api/x/fund-accounts -->

# Fund Accounts APIs

Copy for AI

View as Markdown

Every Contact has an associated Fund Account. When you [make payouts](/docs/x/payouts/) to a Contact, they receive the amount in their Fund Account. Fund Accounts can be of [four types](/docs/x/fund-accounts/#fund-account-types), and a Contact can have multiple Fund Accounts.

You must [create a Contact](/razorpay-docs-md/api/x/contacts/create.md) to create a Fund Account. We recommend you to create Contacts and Fund Accounts beforehand to improve the [payout processing time](/docs/x/payouts/status-details/). When making payouts, ensure to [allowlist IPs](/docs/x/dashboard/allowlist-ip/), else the request will fail.

Fork the Razorpay Postman Public Workspace and try the Fund Accounts APIs using your [Test API Keys](/docs/x/dashboard/api-keys/). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-47aa8c0b-d897-48d2-aa5a-5d5c10c5c2b1)

Related Guides: [About Fund Accounts](/docs/x/fund-accounts/) [Set Up Webhooks](/docs/webhooks/setup-edit-payouts/) [Webhook Payloads](/docs/webhooks/account-validation/)

Endpoints

05 [Create Bank Account type Fund Account

POST

Creates a new Fund Account using bank account details.](/razorpay-docs-md/api/x/fund-accounts/create/bank-account.md) [Create VPA type Fund Account

POST

Creates a new Fund Account using VPA details.](/razorpay-docs-md/api/x/fund-accounts/create/vpa.md) [Fetch All Fund Account

GET

Retrieves all the Fund Accounts.](/razorpay-docs-md/api/x/fund-accounts/fetch-all.md) [Fetch a Fund Account with ID

GET

Retrieves a single Fund Account with ID.](/razorpay-docs-md/api/x/fund-accounts/fetch-with-id.md) [Activate/Deactivate a Fund Account

PATCH

Activates or deactivates an existing Fund Account.](/razorpay-docs-md/api/x/fund-accounts/activate-or-deactivate.md)
