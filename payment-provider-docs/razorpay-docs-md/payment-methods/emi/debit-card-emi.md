<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/debit-card-emi -->

#### Debit Card EMI Changelog

Discover new features, updates and deprecations related to Debit Card EMI (since Jan 2024).

Using Razorpay, you can let your customers use Debit EMI as a payment method to buy various products on EMI using their Debit Cards without paying the entire amount immediately. Razorpay supports EMIs on debit cards issued by [major banks](/razorpay-docs-md/payment-methods/emi/faqs.md#5-can-you-provide-a-list-of-the). EMI is available by default on Razorpay Standard Checkout. No additional integration is needed.

**Watch Out!**

Instant Refunds are not supported on EMI, Cardless EMI and Pay Later.

## Supported Banks for Debit Card EMIs

Below is a list of banks that support debit card EMIs.

**Handy Tips**

Check the [standard debit card interest rates](/razorpay-docs-md/payment-methods/emi/faqs.md#5-can-you-provide-a-list-of-the) and the minimum amount charged by the banks.

## Payment Flow on Standard Checkout

Customers select the products on your website or app and proceed to Checkout.

On the Checkout page, the customers:

1. Enter the **Phone Number** and click **Continue**.
2. Select **EMI** as the payment method.

   ![Select emi payment option on checkout](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/emi-options-card.jpg)
3. Select **Debit Card**.

   ![Select debit card payment option on checkout](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/emi-debit-card.jpg)
4. Choose a bank from the list and select the EMI tenure. Click **Continue**.

   ![EMI tenure and click Select Plan](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/emi-credit-tenure.jpg)
5. They enter the relevant card details and choose if they want to **Save this card as per RBI guidelines** or pay without saving the card.
6. Click **Continue**.

If the customers are not eligible, they can pay the full amount.

After the successful payment, Razorpay redirects customers to your application or website. Customers' monthly statements will reflect the EMI amount with interest charged by the bank.

## FAQs [Debit Card EMI FAQs](/razorpay-docs-md/payment-methods/emi/faqs.md#debit-card-emi).
