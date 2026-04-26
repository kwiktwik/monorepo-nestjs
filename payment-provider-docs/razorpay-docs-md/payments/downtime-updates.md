<!-- Source: https://razorpay.com/docs/payments/payments/downtime-updates -->

Downtime is a period during which one or more payment options under-perform, leading to considerable delays in payment processing. These downtimes are due to technical issues or outages at Razorpay's partner or issuing banks side. Razorpay informs you about the downtime to communicate it to your customers.

## Bank Downtime Updates

Bank Downtimes Updates provides you with an overview of various downtimes grouped across different payment methods on your Dashboard. You can view the latest status of downtimes for netbanking, cards, UPI and Emandate at any point in time. You can also view instrument details for downtimes such as Cards Network, Issuers and Banks in the **Downtime Updates** section on your Dashboard.

![Bank Downtime updates - Payment Methods Status](https://razorpay.com/docs/payments/payments/build/browser/assets/images/bank-downtimes-new.jpg)

## View Downtime Details

To view the downtime details:

1. Log in to the Dashboard.
2. Click **Bank Downtimes icon** in the top menu.

   ![Downtime Details - Razorpay Dashboard](https://razorpay.com/docs/payments/payments/build/browser/assets/images/bank-downtimes-dashboard.jpg)
3. Click on the required VPA handle, Network or Bank to view the details of the downtime. You can view the following information:
   - Number of downtimes for the day.
   - Duration of the downtime.
   - Past 30 days incidents, with downtime date, time, duration and severity levels.

     ![Bank's downtime - Past 30 days incidents with downtime date, duration and severity levels](https://razorpay.com/docs/payments/payments/build/browser/assets/images/bank-downtimes-details.jpg)

**Handy Tips**

- The status is auto-refreshed every 5 minutes.
- You can also do a manual refresh after every 5 minutes.

## Downtime Communication on Checkout

Razorpay identifies and sends you downtime updates via email for various payment instruments like cards and netbanking. Your customers will be able to view the downtime message on checkout, which will help them choose a payment method with a better success rate.

**Watch Out!**

We temporarily prevent customers from accessing payment instruments, which are bound to fail on checkout. For example, if all payments made via Netbanking are bound to fail, we show the option in a disabled state on checkout until it recovers. However, they can select an alternative instrument that is more likely to work to complete the payment successfully.

Customer Experience

![payment instrument in a disabled state](https://razorpay.com/docs/payments/payments/build/browser/assets/images/payments-downtime-disabled-state-v2.jpg)

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payments/build/browser/assets/images/feature-request.gif)

Razorpay shares updates regarding downtimes on various payment methods at the checkout as shown:

Card

![Downtime Communication on Checkout for Card](https://razorpay.com/docs/payments/payments/build/browser/assets/images/card-downtime-v2.jpg)

UPI

![Downtime Communication on Checkout for UPI](https://razorpay.com/docs/payments/payments/build/browser/assets/images/upi-downtime-v2.jpg)

Netbanking

![Downtime Communication on Checkout for Netbanking](https://razorpay.com/docs/payments/payments/build/browser/assets/images/netbanking-downtime-v2.jpg)

### Related Information

- [Payment Downtime API](/razorpay-docs-md/api/payments/downtime.md)
