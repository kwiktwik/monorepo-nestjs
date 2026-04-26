<!-- Source: https://razorpay.com/docs/payments/smart-collect -->

[Smart Collect Changelog

Discover new features, updates and deprecations related to Razorpay Smart Collect (since Jan 2024).](/razorpay-docs-md/changelog.md#products)

Razorpay Smart Collect empowers businesses to create on-demand Customer Identifiers (CI) for receiving payments via NEFT, RTGS, and IMPS. Smart Collect 2.0 expands this functionality to include UPI payments through Virtual UPI IDs. These identifiers are linked to your registered bank account, and Razorpay automates payment reconciliation and provides notifications for received payments.

#### What is a Customer Identifier and a Virtual UPI ID?

**Customer Identifier**
Customer identifier is a customisable virtual receiver (with customer identifier number and IFSC) created on top of your current/escrow account. You can share the Customer Identifier information with your customers/businesses and collect payments.

**Virtual UPI ID**
Virtual UPI id is an extension of Customer Identifier. It is a customisable UPI id that your customers/businesses can use to pay you. It combines the ease of UPI payments and id customisation to offer you a seamless payment reconciliation experience.

**Handy Tips**

- Understand the Razorpay [payment flow](/razorpay-docs-md/payment-gateway/how-it-works.md)

  that Smart Collect follows to collect payments.
- Smart Collect also supports [Third-Party Validation (TPV)](/razorpay-docs-md/smart-collect/third-party-validation.md)  .

Advantages

Smart Collect

Smart Collect 2.0

Smart Collect has the following advantages:

- **Instant Identifier Creation**: Generate Customer Identifiers in real-time using the Dashboard and APIs.
- **Multiple Payment Avenues**: Enable customers to make payments via NEFT, RTGS and IMPS.
- **Automatic Reconciliation**: Eliminate the difficulty of manual reconciliation and save time and cost.
- **Account-level Visibility**: View and manage every payment received from customers.
- **Real-time Notifications**: Get real-time notifications on payments with Webhooks.
- **Third-Party Validation (TPV)**: Smart Collect supports Third-Party Validation.

Smart Collect 2.0 vs Smart Collect

Smart Collect and Smart Collect 2.0 use the same APIs to create and maintain Customer Identifiers. Smart Collect 2.0 offers additional benefits, such as:

Smart Collect Use Cases

Explore the [Smart Collect Use Cases](/razorpay-docs-md/smart-collect/use-cases.md) to gain deeper insights into the capabilities and practical applications of Smart Collect and Smart Collect 2.0.

## Prerequisites

Smart Collect

Smart Collect 2.0

1. Ensure that you do not fall under the `Individuals` merchant category as Smart Collect is not available for this Merchant Category Code (MCC).
2. Read and understand the [pricing model](https://razorpay.com/smart-collect/#pricing)

   and have the [API documentation](/razorpay-docs-md/api/payments/smart-collect.md)

   for Smart Collect handy.
3. Ensure that the business use case is well charted. Smart Collect supports **many customers - one account** and **many customers - many accounts** models.
4. Raise a request through a Point of Contact (POC) or the Dashboard to enable Smart Collect and Smart Collect TPV for your account.
5. Do check the [list of banks](/razorpay-docs-md/third-party-validation/bank-list.md#list-of-banks-supporting-tpv-for-smart-collect)

   which support Smart Collect with TPV.

## Supported Platforms

Razorpay Smart Collect is supported on the following platforms:

Standard Checkout

Custom Checkout

### Related Information

- [How Smart Collect Works](/razorpay-docs-md/smart-collect/how-it-works.md)
- [Customer Identifier States](/razorpay-docs-md/smart-collect/states.md)
- [Auto Third Party Validation (TPV) on Smart Collect](/razorpay-docs-md/smart-collect/third-party-validation.md)
- [Smart Collect APIs](/razorpay-docs-md/api/payments/smart-collect.md)
- [Subscribe to Webhooks](/razorpay-docs-md/smart-collect/subscribe-to-webhooks.md)
