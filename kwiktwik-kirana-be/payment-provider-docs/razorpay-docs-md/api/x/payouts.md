<!-- Source: https://razorpay.com/docs/api/x/payouts -->

# Payouts APIs

A [payout](/docs/x/payouts/) is a transfer of funds from your business account to a Contact's Fund Account(s). You can create and process payouts both on the RazorpayX Dashboard and via the Payouts API. Ensure to [create a contact](/razorpay-docs-md/api/x/contacts/create.md) and add a [fund account](/razorpay-docs-md/api/x/fund-accounts.md).

**What's New** [Idempotency Key](/razorpay-docs-md/api/x/payout-idempotency.md) is mandatory for all payout requests starting March 15, 2025.

To make payouts, you must [allowlist IPs](/docs/x/dashboard/allowlist-ip/) and pass the [idempotency key](/razorpay-docs-md/api/x/payout-idempotency.md).

Making payouts from [RazorpayX Lite](/docs/x/account-types/razorpayx-lite/) account to RazorpayX Lite Customer Identifiers or Razorpay [Customer identifiers](/razorpay-docs-md/smart-collect.md) is not supported.

Fork the Razorpay Postman Public Workspace and try the Payouts APIs using your [Test API Keys](/docs/x/dashboard/api-keys/). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-117c93d1-1a79-4958-9067-eb97a3459f08)

Related Guides: [About Payouts](/docs/x/payouts/) [Set up Webhooks](/docs/webhooks/setup-edit-payouts/) [Webhooks Payloads](/docs/webhooks/)

Endpoints

05 [Creates a Payout to a Bank Account

POST

Create a payout to a bank account.](/razorpay-docs-md/api/x/payouts/create/bank-account.md) [Create a Payout to a VPA

POST

Creates a payout to a VPA.](/razorpay-docs-md/api/x/payouts/create/vpa.md) [Fetch all Payouts

GET

Retrieves details of all the payouts.](/razorpay-docs-md/api/x/payouts/fetch-all.md) [Fetch a Payout with ID

GET

Retrieves details of one payout via ID.](/razorpay-docs-md/api/x/payouts/fetch-with-id.md) [Cancel a Queued Payout

PATCH

Cancels a payout in `queued` state.](/razorpay-docs-md/api/x/payouts/cancel.md)
