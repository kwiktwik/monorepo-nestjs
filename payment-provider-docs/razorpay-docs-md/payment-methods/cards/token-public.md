<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-public -->

A token represents a customer's card details stored in Razorpay servers. We use these tokens to securely fetch the saved details for making it quick and easy for customers to make payments. Tokens are generally created with every payment requests and Tokens API can be used to migrate them from your current system to Razorpay.

**PCI-DSS Compliance**

The customer's payment information should never reach your servers unless you are PCI-DSS certified. Your site must be **PCI-DSS** certified to accept, process, store or transmit customer's card details securely to Razorpay.

## Tokens API

POST

/customers/:customer\_id/tokens/public

Example RequestResponse

copy

```bash
curl -X POST \
https://api.razorpay.com/v1/customers/cust_EdxDIpddQC9o1F/tokens/public \
 -u '<YOUR_API_KEY>' \
 -h 'content-type: application/json'
 -d '{
  "method": "card",
  "card": {
    "name": "Gaurav Kumar",
    "number": "4386289407660153",
    "expiry_month": "12",
    "expiry_year": "2022"
  }
}'
```

#### Path Parameter

customer-id

mandatory

`string` Unique identifier of the customer. You can create a customer using [API](/razorpay-docs-md/api/customers.md) or via the [Dashboard](/razorpay-docs-md/customers.md#create-a-customer).

#### Request Parameters

method

mandatory

`string` The payment method selected by the customer on checkout. Here, it should be `card`.

card

Details of the customer's card.

number

mandatory

`integer` The card number.

name

mandatory

`string` The name on the card.

expiry\_month

mandatory

`string` The expiry month of the card in `MM` format.

expiry\_year

mandatory

`string` The expiry year of the card in `YY` format.

All server-side requests must be [authenticated](/razorpay-docs-md/api/index.md#authentication) with `Basic Auth` using the [KEY\_ID] as username. You can generate your API keys on the [Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys).
