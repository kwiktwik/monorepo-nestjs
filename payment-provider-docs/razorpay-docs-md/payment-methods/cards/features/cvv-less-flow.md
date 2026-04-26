<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/features/cvv-less-flow -->

You can offer CVV-less payments for saved cards and let your customers complete a payment without the card CVV. CVV-less card payments are simple, fast and secure, and do not require the customers to remember the CVV. *Offering CVV-less saved card flows to your customers can increase the conversion rate by 4%.*

We encourage the businesses to remove the CVV box on the checkout page. If you are live on Razorpay Standard Checkout, the UI changes reflect automatically. The customer can choose their saved cards as their preferred payment option and experience a faster transaction.

![CVV Less Card Payment Flow GIF](https://razorpay.com/docs/payments/payment-methods/cards/features/build/browser/assets/images/pm-cvv-otp-less.gif)

**Handy Tips**

CVV-less payments on RuPay is an on-demand feature. Reach out to our [support team](https://razorpay.com/support/#request) for more information.

## Frequently Asked Questions (FAQs)

1. How can I handle the CVV field for Razorpay payments with saved cards?

The CVV field is optional by default for saved card payments on all networks. To implement this change, you can skip passing the CVV field in the payment request to this field to Razorpay.

2. Does this mean I no longer need to accept CVV from customers?

Yes. You need to make the necessary UI changes to stop accepting CVV from your customers on saved card payments only.

3. Do all networks support CVV-less flow?

CVV-less flow is supported for tokenised payments on all networks: Visa, Mastercard, RuPay, Amex and Diners.

4. Which card issuers support CVV-less payments?

Besides Rupay cards, all issuers support CVV-less payments on other networks. For Rupay, given below is the list of supported issuers:

5. I have integrated with Standard Checkout on Razorpay. How does this feature impact me?

CVV-less flow will be automatically enabled for Visa, Mastercard and American Express cards on Razorpay Standard Checkout.

6. I have integrated with Custom Checkout/S2S on Razorpay. How does this feature impact me?

If you are integrated with Razorpay’s Custom Checkout/S2S APIs, you need not pass CVV to Razorpay for tokenised payments mandatorily. Update your integration as follows:

- Modify the UI to stop collecting CVV from customers.
- For tokenised payments, the CVV field in the cards object can either be:
  - null
  - empty
  - removed entirely.

**Watch Out!**

Do not pass dummy CVV values.

7. I use Juspay to route card payments to Razorpay. Can I stop sending the CVV to Juspay?

In this case, Juspay must send CVV-less card payments via Razorpay. We recommend you reach out to your Juspay POC.

8. CVV validation was a mandatory step until now. Does this feature compromise my customer’s security?

The new RBI guidelines for the **Card on File Tokenization (CoFT)** process ensure enhanced card security. Your customer’s card details are securely encrypted and stored, with access to only card networks and issuing banks. Considering this, Visa and Amex have made CVV validation optional for tokenised cards. This change is 100% compliant with all RBI regulations about card security.

9. What is Tokenisation?

Tokenisation is the process by which the original card number / Primary Account Number (PAN) is replaced with a surrogate value called a **token**. Razorpay’s RBI-compliant TokenHQ solution allows cardholders to tokenise their cards and securely process transactions through the tokenised cards. To know more about TokenHQ, reach out to our [support team](https://razorpay.com/support/#request).

10. Is this change applicable only to specific transactions, for example, less than INR 2000?

CVV-less flows are applicable to all tokenised transactions for all networks, irrespective of the payment amount.

11. Why is this introduced only on saved cards? Why not all cards?

One of the ways cardholder authenticity and security are maintained for CVV-less transactions is via their consent and authorisation at the time of saving their card. Plain card payments still need to maintain cardholder security by mandating the CVV.
