<!-- Source: https://razorpay.com/docs/payments/payment-methods/upi/turbo-upi -->

Turbo UPI by Razorpay enables businesses to accept UPI payments from their customers within their mobile application. Customers no longer need to switch to third-party UPI apps to complete payments. This helps increase payment success rates and improves customer experience. Given below is a sample UI representation:

![Turbo UPI Standard Checkout Flow](https://razorpay.com/docs/payments/payment-methods/upi/build/browser/assets/images/turbo-upi-flow.jpg)

On-Demand Feature - Raise a Request

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-methods/upi/build/browser/assets/images/feature-request.gif)

### Advantages

Customers

Businesses

1. Turbo UPI eliminates the need for transactions to be routed via an external third-party UPI application.
2. The steps are reduced from 5 to 1 simple step.
3. Improve UPI payment success rate with Turbo UPI compared to traditional third-party UPI apps.
4. Single source for dispute resolution and refund handling. In case of payment failure or refunds, the customer will not be handling multiple parties to resolve the dispute and will have a single point of dispute resolution.
5. 5x faster UPI payment versus regular UPI payments.

## Use Cases

Turbo UPI is helpful for businesses with high-frequency transactions.

Examples

- **Doorstep Food/Grocery Delivery**
  Customers select UPI to make quick payments for food/grocery delivery. However, they have to hop between the business and UPI apps, which causes friction. Customers are unsure which support team to contact for disputes - the UPI app or the business. With Turbo UPI, customers can experience 1-click payments and speedy dispute resolution on the business app.
- **Insurance**
  Customers use UPI to pay their insurance premiums, which could be high-ticket transactions. Insurance firms can use Turbo UPI to make the premium payment experience faster and smoother and achieve a higher payment success rate, which reassures customers.
- **Investment**
  Investment companies must comply with regulations and collect payments from only customers' KYC-verified bank accounts. With Turbo UPI, investment companies can implement third-party validation on all customer payments and ensure regulatory compliance while providing a 1-click payment experience.
- **Gaming**
  Turbo UPI enables customers to make in-app game purchases without leaving the gaming app. This enhances the customer's experience as they can make a quick UPI payment and continue playing.

## Turbo UPI Flows

Turbo UPI has three flows:

- [Onboarding Flow](/razorpay-docs-md/payment-methods/upi/turbo-upi.md#onboarding-flow)
- [Transactional Flow](/razorpay-docs-md/payment-methods/upi/turbo-upi.md#transactional-flow)
- [Non-Transactional Flow](/razorpay-docs-md/payment-methods/upi/turbo-upi.md#non-transactional-flow)

## Onboarding Flow

Follow the steps to onboard customers:

1. The customer navigates to your app's checkout screen and taps **+Link bank account**.

   ![Razorpay Turbo UPI- Add bank account](https://razorpay.com/docs/payments/payment-methods/upi/build/browser/assets/images/turbo-upi-std-add-bank.jpg)
2. The customer needs to give permission so that we can validate the phone number with the bank.

   ![Razorpay Turbo UPI- Allow Phone Permission](https://razorpay.com/docs/payments/payment-methods/upi/build/browser/assets/images/turbo-upi-std-allow-phone.jpg)
3. The customer is shown a list of banks from which they can select one.

   ![Razorpay Turbo UPI- Bank Selection](https://razorpay.com/docs/payments/payment-methods/upi/build/browser/assets/images/turbo-upi-custom-select-bank-account.png)
4. This adds the customer's bank account. After the onboarding is complete the customer can also set up their UPI PIN.

   ![Razorpay Turbo UPI- Bank Account Linked](https://razorpay.com/docs/payments/payment-methods/upi/build/browser/assets/images/turbo-upi-in-app-acc-linked.jpg)
5. The customer can complete the payment using the newly added Bank account.

**Handy Tips**

If you have not set up the UPI PIN before, additional standard steps will be required, including entering card details and setting up the PIN.

## Transactional Flow

Transactional flow is the user journey of making the payment via Turbo UPI.

1. The customer proceeds to the checkout and selects the bank account they want to make the payment.
2. The customer enters the UPI PIN.

## Non-Transactional Flow

The following methods should also be integrated along with Turbo UPI:

- **Delete linked Bank Account**: Customers can delete their existing bank account linked to your app.
- **Check Balance**: Customers can check their account balance on your app.
- **Reset UPI PIN**: Customer can reset their UPI PIN for the bank account linked to your app.
- **Change UPI PIN**: Customer can change their UPI PIN for the bank account linked to your app.

![View the non-transactional flow](https://razorpay.com/docs/payments/payment-methods/upi/build/browser/assets/images/turbo-upi-non-transactional.jpg)

## Integrate Turbo UPI

Perform the following steps to integrate Turbo UPI:

Standard Checkout

Custom Checkout

- [Android Integration](/razorpay-docs-md/payment-gateway/android-integration/standard/payment-methods/turbo-upi.md)
- [iOS Integration](/razorpay-docs-md/payment-gateway/ios-integration/standard/payment-methods/turbo-upi.md)
