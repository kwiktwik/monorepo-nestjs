<!-- Source: https://razorpay.com/docs/api/x/payout-composite -->

# Payout Composite APIs

Copy for AI

View as Markdown

Composite API allows you to make three requests in a single API call. No OTP authorization is required when creating a payout using APIs. Ensure you [allowlist IPs](/docs/x/dashboard/allowlist-ip/) and pass the [idempotency key](/razorpay-docs-md/api/x/payout-idempotency/make-request.md) to make a successful payout.

You can either create a new Contact and its Fund Account while making the payout, or use an existing Contact and Fund Account details to make the payout. Using the Contact and Fund Account details instead of IDs will not create duplicate Contacts or Fund Accounts in your system. However, we recommend that you create the Contact and Fund Account before making a payout to help **improve payout processing time**.

Fork the Razorpay Postman Public Workspace and try the Payout Composite APIs using your [Test API Keys](/docs/x/dashboard/api-keys/). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-d81df592-f496-49f0-a3b1-e8cf62855d50)

Related Guides: [About Payouts API](/razorpay-docs-md/api/x/payouts.md) [Set Up Webhooks](/docs/webhooks/setup-edit-payouts/) [Webhook Payloads](/docs/webhooks/) [Payouts Best Practices](/docs/x/payouts/best-practices/)

Endpoints

03 [Create a Payout to a Bank Account

POST

Creates a payout along with the Contact and Fund Account with of the type bank account.](/razorpay-docs-md/api/x/payout-composite/create/bank-account.md) [Create a Payout to a VPA

POST

Creates a payout along with the Contact and Fund Account of the type VPA.](/razorpay-docs-md/api/x/payout-composite/create/vpa.md) [Create a Payout to a Card

POST

Creates a payout along with the Contact and Fund Account of the type card.](/razorpay-docs-md/api/x/payout-composite/create/card.md)
