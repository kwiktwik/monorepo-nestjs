<!-- Source: https://razorpay.com/docs/payments/payments/test-card-details -->

You can test the payment flow using our test cards.

**Watch Out!**

- You can use these test cards to make payments in **test** mode only.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.
- If you use these test cards for **live** mode payments, either of the following error message will be displayed: `card issuer is invalid` or `invalid card input`.

Watch this video to see how to use the test card details.

To use the test card details:

1. At the Checkout, select Card as the payment method.
2. Enter the **OTP** to access saved cards if required.
3. Enter the card details. This depends on the flow you are testing.
4. Enter any random CVV.
5. Enter any future date as the expiry date.
6. Click **Pay**. A sample payment page is displayed.
   - Enter a random **OTP** between 4 to 10 digits to make the payment successful and click **Submit**.
   - Enter a random **OTP** below 4 digits to fail the payment and click **Submit**.

Use the following cards for testing. You can use any random CVV and any future date as the expiry date.

## Test Cards for Indian Payments

Use the following test cards to test various payment scenarios for Indian payments. You can save any of the test cards below. The saved card flow allows customers to store their card details for future transactions. When a customer selects the option to save their card, Razorpay handles the tokenization process internally. Know more about [Saved Cards](/razorpay-docs-md/payment-methods/cards/features/saved-cards.md).

### Error Scenarios

Use these test cards to simulate and test various error conditions for the following networks. Once you initiate the payment, in success/failure screen, you must select failure to get the right error. Know more about [Cards Error Codes](/docs/errors/payments/cards/).

BAD\_REQUEST\_ERROR

GATEWAY\_ERROR

## Test Cards for International Payments

**Handy Tips**

You may encounter an address collection window when using the Mastercard test card number `5105 1051 0510 5100` for international payments. To complete the test payment, provide the following address details:

- **Address Line 1**: 21 Applegate Apartment
- **Address Line 2**: Rockledge Street
- **City**: New York
- **State**: New York
- **Country**: US
- **Zipcode**: 11561

## Test Cards for Subscriptions

## Test Card for EMI Payments
