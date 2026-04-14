<!-- Source: https://razorpay.com/docs/payments/payment-methods/upi/gst-on-upi -->

As per the 2020 circular issued by the Central Board of Indirect Taxes & Customs (CBIC), businesses meeting the eligibility conditions described below must pass GST information for UPI transactions:

## Eligibility Conditions

Given below are the eligibility conditions:

- Businesses whose annual aggregate turnover exceeds ₹500 crores in any financial year from 2017-18 onwards.
- Businesses that generate B2C (Business-to-Customer) invoices.

The following categories of business will be excluded:

- An insurer or a banking company, or a financial institution, including a non-banking financial company.
- A goods transport agency supplying services in relation to transportation of goods by road in a goods carriage.
- Businesses supplying passenger transportation service.
- Businesses supplying services by way of admission to exhibition of cinematograph in films in multiplex screens.

## How to Comply with the Regulation

We enable eligible businesses to comply with this regulation by making some simple changes to their integration. Non-eligible businesses can also make these changes, even though this regulation does not apply to them at the moment.

1. [Make changes in Orders API integration](/razorpay-docs-md/payment-methods/upi/gst-on-upi.md#step-1-make-changes-in-orders-api-integration)

   .
2. [Handle API errors](/razorpay-docs-md/payment-methods/upi/gst-on-upi.md#step-2-handle-api-errors)

   .
3. [Make changes in webhook integration](/razorpay-docs-md/payment-methods/upi/gst-on-upi.md#step-3-make-changes-in-webhooks-integration)

   .

### Step 1: Make Changes in Orders API Integration

To comply with the change, you should use the [Orders API](/razorpay-docs-md/api/orders/create.md) in your integration flow, along with the following additional parameters request parameters:

#### Additional Request Parameters

tax\_invoice

optional

`object` This object contains information about the invoices. If not provided, the transaction will default to the non-GST compliant UPI flow.

number

optional

`string` This is the invoice number against which the payment is collected. If not provided, the transaction will default to the non-GST compliant UPI flow.

date

optional

`integer` Timestamp, in Unix format, that indicates the issue date of the invoice. If not provided, it will default to the current date.

customer\_name

optional

`string` The customer name on the invoice. If not provided, the transaction will default to non-GST compliant UPI flow.

gst\_amount

optional

`integer` The GST amount on the invoice in paise. If not provided, Razorpay will compute the values based on the default values provided by you. If default values are not updated, the transaction will default to the non-GST compliant UPI flow.

cess\_amount

optional

`integer` The cess amount on the invoice in paise. If not provided, Razorpay will compute the values based on the default values provided by you. If default values are not updated, the transaction will default to the non-GST compliant UPI flow.

supply\_type

optional

`string` Supply type indicating whether the transaction is interstate or intrastate. Possible values:

- `interstate`: Supply of goods and services takes place across the borders of two states or union territories. Only IGST is to be paid.
- `intrastate`: Supply of goods and services takes place within the states. Both CGST and SGST should be paid.

If not provided, the default value set by you on the Dashboard will be considered. If default values are not updated, the transaction will default to the non-GST compliant UPI flow.

business\_gstin

optional

`string` The GSTIN mentioned on the invoice. If not passed, it will be taken from your Dashboard.

### Step 2: Handle API Errors

You could face two types of errors while sending GST information using Orders API:

- Data not in the correct format
- Data missing

Given below is a sample error response.

#### Data not in Correct Format

Given below are the error codes and their description:

#### Data Missing

Given below are the error codes and their description:

### Step 3: Make Changes in Webhooks Integration

The GST information is also passed in the `order.paid` webhook payload, as shown below. Please make the necessary changes in your webhook integration.
