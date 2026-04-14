<!-- Source: https://razorpay.com/docs/payments/recurring-payments/cards/supported-banks -->

Given below is the list of banks and apps that support recurring payments via Cards.

**Watch Out!**

- Please contact our support team if you are facing difficulties with card payments from any of the major banks on the above list.
- Bank downtime can affect success rates when processing recurring payments via debit cards.

**Handy Tips**

We support Visa, Mastercard and RuPay cards of all major banks.

## Fetch Supported Methods

Use the below endpoint to fetch a list of supported card networks and banks available for recurring payments.

GET

/methods

**[YOUR\_KEY\_ID] Required**

To fire this API, you need to provide your [KEY\_ID] for authorization. Your [KEY\_SECRET] is not required and should not be passed.

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID] \
    -X GET https://api.razorpay.com/v1/methods
```

### Related Information

- [Integrate Recurring Payments Using Cards](/razorpay-docs-md/recurring-payments/cards/integrate.md)
- [APIs](/razorpay-docs-md/recurring-payments/cards/apis.md)
