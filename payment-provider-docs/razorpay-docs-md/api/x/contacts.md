<!-- Source: https://razorpay.com/docs/api/x/contacts -->

# Contacts APIs

Copy for AI

View as Markdown

A contact is an entity to whom payouts can be made through various supported modes like UPI, IMPS, NEFT and RTGS, Cards and more. Know more about [Contacts and Fund Accounts](/docs/x/contacts/).

It is mandatory to [allowlist the IPs](/docs/x/dashboard/allowlist-ip/) that you use while making payouts via APIs, else the request will fail. In case of errors, you can refer to the error codes in the respective API endpoint pages.

Fork the Razorpay Postman Public Workspace and try the Contacts APIs using your [Test API Keys](/docs/x/dashboard/api-keys/). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-46855750-fa22-46cd-9fa2-2f294507ec22)

Related Guides: [About Contacts](/docs/x/contacts/) [Set Up Webhooks](/docs/webhooks/setup-edit-payouts/)

Endpoints

05 [Create a Contact

POST

Creates a new Contact with phone number/email id.](/razorpay-docs-md/api/x/contacts/create.md) [Update a Contact

PATCH

Updates a particular Contact's details.](/razorpay-docs-md/api/x/contacts/update.md) [Retrieve All Contacts

GET

Retrieves all Contacts created in your RazorpayX account.](/razorpay-docs-md/api/x/contacts/fetch-all.md) [Retrieve Contact With ID

GET

Retrieves a single Contact with ID.](/razorpay-docs-md/api/x/contacts/fetch-with-id.md) [Activate or Deactivate a Contact

PATCH

Activates or deactivates an existing contact.](/razorpay-docs-md/api/x/contacts/update.md)
