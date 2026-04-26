<!-- Source: https://razorpay.com/docs/api/x/account-validation -->

# Account Validation APIs

Copy for AI

View as Markdown [Account Validation](/docs/x/fund-account-validation/) validates your Contact's Fund Account details (such as bank account or virtual payment address (VPA) details) to verify the account number where the user wants to receive the amount. Account Validation is not available in test mode and is possible only for RazorpayX Lite.

To make an account validation transaction, you must [allowlist your IPs](/docs/x/dashboard/allowlist-ip/), [Create a Contact](/razorpay-docs-md/api/x/account-validation/create-contact.md) and Create a Fund Account for the Contact using either [bank account](/razorpay-docs-md/api/x/account-validation/bank-account/create-fund-account.md) or [VPA details](/razorpay-docs-md/api/x/account-validation/vpa/create-fund-account.md).

Fork the Razorpay Postman Public Workspace and try the Account Validation APIs using your [Test API Keys](/docs/x/dashboard/api-keys/). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-62befdac-a937-4ee9-8bc4-943801ce2368)

Related Guides: [About Fund Account Validation](/docs/x/fund-account-validation/) [Set up Webhooks](/docs/webhooks/setup-edit-payouts/) [Webhooks Payloads](/docs/webhooks/account-validation/)

Endpoints

08 [Create Contact

POST

Creates a Contact using customer's contact details such a phone number or email id.](/razorpay-docs-md/api/x/account-validation/create-contact.md) [Create a Fund Account of Type Bank Account

POST

Creates a Fund Account for an existing Contact using customer's bank account details.](/razorpay-docs-md/api/x/account-validation/bank-account/create-fund-account.md) [Validate a Bank Account

POST

Validates the contact's bank account.](/razorpay-docs-md/api/x/account-validation/bank-account.md) [Create a Fund Account of Type VPA

POST

Creates a Fund Account for an existing Contact using customer's virtual payment address or UPI.](/razorpay-docs-md/api/x/account-validation/vpa/create-fund-account.md) [Validate a VPA

POST

Validates the contact's virtual payment address or UPI fund account.](/razorpay-docs-md/api/x/account-validation/vpa.md) [Validate VPA using Reverse Penny Drop

POST

Validates the contact's virtual payment address or UPI fund account via Reverse Penny Drop.](/razorpay-docs-md/api/x/account-validation/reverse-penny-drop.md) [Fetch All Account Validation Transactions

GET

Retrieves the details of all Fund Account Validation transactions you have made.](/razorpay-docs-md/api/x/account-validation/fetch-all-transactions.md) [Fetch Account Validation Transactions With ID

GET

Retrieves particular Fund Account Validation transaction with its id.](/razorpay-docs-md/api/x/account-validation/fetch-transactions-with-id.md)
