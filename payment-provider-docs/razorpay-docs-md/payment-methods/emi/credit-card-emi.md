<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/credit-card-emi -->

Razorpay Checkout supports EMIs on credit cards issued by major banks. EMI is available by default on Razorpay Standard Checkout. No additional integration is needed.

**Watch Out!**

Instant Refunds are not supported on EMI, Cardless EMI and Pay Later.

## Supported Payment Partners

Following is the list of supported Payment Partners for Credit Card EMI and the minimum order amount stipulated by them:

Banks

Other Cards

#### Quick Notes

For HDFC Bank and State Bank of India (SBI), please raise a request [here](https://dashboard.razorpay.com/app/payment-methods/emi) to enable them (not enabled by default).

#### Interest Rates

Check the standard [credit card interest rates charged by major banks](/razorpay-docs-md/payment-methods/emi/faqs.md#1-what-are-the-standard-credit-card-interest).

### Fetch EMI Plans

Use the below endpoint to fetch a list of EMI plans offered by banks:

GET

/methods

**[YOUR\_KEY\_ID] Required**

To fire this API, you must provide your [KEY\_ID] for authorization. Your [KEY\_SECRET] is not required and should not be passed. Know how to generate the [API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys).

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID] \
-X GET https://api.razorpay.com/v1/methods
```

## Payment Flow on Standard Checkout

Customers select the products on your website or app and proceed to Checkout. On the Checkout page, the customers:

1. Enter the **Phone Number** and click **Continue**.
2. Select **EMI** as the payment method.

   ![Select emi payment option on checkout](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/emi-options-card.jpg)
3. Select **Credit Card**.

   ![Select credit card payment option on checkout](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/emi-credit-card.jpg)
4. Choose a bank from the list and select the EMI tenure. Click **Continue**.

   ![EMI tenure and click Select Plan](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/emi-credit-tenure1.jpg)
5. Enter the relevant details. The eligibility depends on the customer's card's BIN (first 6 digits). If the card is not eligible, the customers can pay the full amount.
6. Choose if they want to **Save this card as per RBI guidelines** or pay without saving the card.

After the successful payment, Razorpay redirects customers to your application or website. Customers' monthly statements will reflect the EMI amount with interest charged by the bank.

When the customers complete the payment on the Checkout, the entire transaction amount is authorized by the customer's issuing bank and converted into EMIs within 3-4 days, depending on the payment terms agreed with the credit card provider.

## FAQs [Credit Card EMI FAQs](/razorpay-docs-md/payment-methods/emi/faqs.md#credit-card-emi).
