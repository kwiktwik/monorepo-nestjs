<!-- Source: https://razorpay.com/docs/api/x/composite-account-validation -->

# Composite Account Validation APIs

Copy for AI

View as Markdown

Composite Account Validation API allows you to create a Contact [Linked Text](/razorpay-docs-md/api/x/contacts/create.md), the contact's Fund Account (bank account or UPI) and validate it in a single API call.

**Watch Out!**

Account Validation is not available in test mode and is possible only for RazorpayX Lite.

To make an account validation transaction, you must [allowlist your IPs](/docs/x/dashboard/allowlist-ip/), [Create a Contact](/razorpay-docs-md/api/x/account-validation/create-contact.md) and Create a Fund Account for the Contact using either [bank account](/razorpay-docs-md/api/x/account-validation/bank-account/create-fund-account.md) or [VPA details](/razorpay-docs-md/api/x/account-validation/vpa/create-fund-account.md).

Related Guides: [About Fund Account Validation](/docs/x/fund-account-validation/) [Set up Webhooks](/docs/webhooks/setup-edit-payouts/) [Webhooks Payloads](/docs/webhooks/account-validation/)

Endpoints

04 [Validate a Bank Account

POST

Creates and validates the contact's bank account.](/razorpay-docs-md/api/x/composite-account-validation/bank-account.md) [Validate a VPA

POST

Creates and validates the contact's virtual payment address or UPI fund account.](/razorpay-docs-md/api/x/composite-account-validation/vpa.md) [Fetch All Account Validation Transactions

GET

Retrieves the details of all Fund Account Validation transactions you have made.](/razorpay-docs-md/api/x/composite-account-validation/fetch-all-transactions.md) [Fetch Account Validation Transactions With ID

GET

Retrieves particular Fund Account Validation transaction with its id.](/razorpay-docs-md/api/x/composite-account-validation/fetch-transactions-with-id.md)
