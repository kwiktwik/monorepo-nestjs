<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/s2s-integration -->

Using Razorpay, you can let your customers use Cardless EMI as a payment method to convert their payment amount to EMIs without needing their debit or credit card. Customers enjoy the benefits of the EMI as the payments are made using credits approved by the supported Cardless EMI Payment Partners.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

## Supported Payment Partners

Following is the list of supported Payment Partners for Cardless EMI:

## Payment Flow

The payment flow for a customer using Cardless EMI is described below:

1. Customers enter the required details on the Checkout form and select **EMI**.
2. Customer selects the preferred cardless EMI service provider.
3. If the amount entered in the Checkout is eligible for EMI, customers are sent an OTP on their registered mobile numbers to authenticate their account with the selected cardless EMI service provider.
4. If the entered mobile number is invalid, an error message is displayed that the user does not have an account with the service provider.
5. After the successful verification, customers select EMI plan of their choice and complete the transaction.

You will receive the entire transaction amount from the Cardless EMI service provider. As per the terms and conditions, the customers pay the total order amount with additional interest (if any) as EMIs to the provider.

## Prerequisites

- Keep the API keys (a combination of `Key_Id` and `Key_Secret`) handy for integration.
- [Generate API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  from the Dashboard.
- Integrate with [Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md)

  to accept payments on your website or app.

## Integration Step

After the order is created and the customer's payment details are obtained, the information should be sent to Razorpay to complete the payment. You can do this by passing `method = cardless_emi` and `provider=<provider_name>` while creating the payment.

POST

/payments/create/json

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/create/json \
-H "Content-Type: application/json" \
 -d '{
  "amount": "100",
  "currency": "INR",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "order_id": "order_EAkbvXiCJlwhHR",
  "method": "cardless_emi",
  "provider_name": "earlysalary"
}'
```

#### Request Parameters

The payment request for each of the supported payment methods will slightly vary. Know more about the [relevant payment request fields](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods.md).

#### Response Parameters

If the payment request is valid, the response contains the following fields.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. The value here is `redirect`. Use this URL to redirect the customer to the bank's page.

url

`string` URL to be used for the action indicated.
