<!-- Source: https://razorpay.com/docs/payments/smart-collect/apis -->

Use Razorpay Smart Collect to create Customer Identifiers and accept large payments from your customers in the form of bank transfers via NEFT, RTGS and IMPS. Customer Identifiers are similar to bank accounts wherein customers can transfer payments. You can create, retrieve and close Customer Identifiers using the Smart Collect APIs.

**Smart Collect 2.0**

Use [Smart Collect 2.0](/razorpay-docs-md/smart-collect.md) to collect payments using UPI and other banking modes.

## Smart Collect 2.0 APIs

Use Smart Collect 2.0 APIs to create and manage Customer Identifiers of the type `VPA (UPI)`. You can use the Smart Collect APIs to manage Customer Identifiers of the type `Bank Account`.

List of Smart Collect 2.0 APIs

Refer to the list of Smart Collect 2.0 APIs to create and manage Customer Identifiers of the type `VPA (UPI)`.

List of Smart Collect 2.0 API for TPV

Refer to the list of Smart Collect 2.0 APIs to create and manage Customer Identifiers of the type `VPA (UPI)`with TPV.

## Smart Collect APIs

List of Smart Collect APIs

API-wise Integration Checklist for Smart Collect

Create a Customer

Create a Customer Identifier

- Use [Create a Customer API](/razorpay-docs-md/api/customers.md#create-a-customer)

  if a Customer Identifier/UPI ID will be mapped to a unique customer.
- You can use the **fail\_existing** (set to `"1"`) API parameter to create a customer. This helps you avoid `customer_id` being created multiple times for the same customer and will help in your reconciliation process.
- We request you to create a single `customer_id` rather than making multiple IDs for the same customer. If their details change, you can use the [Edit Customer Details](/razorpay-docs-md/api/customers.md#edit-customer-details)

  API. Duplicate validation is done based on the combination of email ID and phone number.

List of APIs for Smart Collect TPV

To know more about Third Party Validation (TPV), click [here](/razorpay-docs-md/smart-collect/third-party-validation.md).

API-wise Integration Checklist for Smart Collect TPV

Create a Customer

Create a Customer Identifier

- Use [Create a Customer API](/razorpay-docs-md/api/customers.md#create-a-customer)

  if a Customer Identifier is mapped to a unique customer.
- You can use the **fail\_existing** (set to `"1"`) API parameter to create a customer. This helps you avoid `customer_id` being created multiple times for the same customer and will help in your reconciliation process.
- We request you to create a single `customer_id` rather than making multiple IDs for the same customer. If their details change, you can use the [Edit Customer Details](/razorpay-docs-md/api/customers.md#edit-customer-details)

  API. Duplicate validation is done based on the combination of email ID and phone number.

List of Banks Supporting TPV for Smart Collect

Given below is the list of banks supporting TPV for Smart Collect.

### Related Information

- [Smart Collect](/razorpay-docs-md/smart-collect.md)
- [How Smart Collect Works](/razorpay-docs-md/smart-collect/how-it-works.md)
