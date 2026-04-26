<!-- Source: https://razorpay.com/docs/payments/recurring-payments/emandate/supported-banks -->

Use the **Methods API** endpoint to fetch the list of banks that support Emandate payments using Netbanking, Aadhaar (eSign authentication) and Debit card authorisation types.

GET

/methods

**[YOUR\_KEY\_ID] Required**

To fire this API, you need to provide your [KEY\_ID] for authorisation. Your [KEY\_SECRET] is not required and should not be passed.

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID] \
-X GET https://api.razorpay.com/v1/methods
```

#### Related Information

- [Integrate Recurring Payments Using Emandate](/razorpay-docs-md/recurring-payments/emandate/integrate.md)
- [Charge Customers During Registration - Use Cases and Payment Methods](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md)
- [APIs](/razorpay-docs-md/recurring-payments/emandate/apis.md)
- [Handle Errors](/razorpay-docs-md/recurring-payments/emandate/errors.md)
