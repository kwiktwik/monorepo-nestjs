<!-- Source: https://razorpay.com/docs/payments/subscriptions/offers/create -->

You can create offers only from the Dashboard. You can control the discounts you offer your customers, restrict the payment methods on which offers are applied and limit their usage to a defined time period.

## Create Offers

Watch this video to see how to create Subscription Offers from the Dashboard.

To create offers:

1. Log in to the Dashboard and click **Subscriptions** under **PAYMENT PRODUCTS** in the left menu.
2. Click **+ Create New Offer**.
3. Click **Offers on Subscriptions**. The **Offer for Subscription** screen is displayed.
4. Enter the following information in the **Description** tab.
   - **Offer Name**: A name for the offer. This appears on the checkout. For example, *Monsoon Offer*.
   - **Display Text**: A description for the offer. This appears on the checkout. For example, *10% discount on all card payments*.
   - **Terms**: Terms and conditions for this offer.
5. Click **Next**.
6. Enter the following information in the **Discount type** tab.
   - **Redemption Type**:
     - **Single Use**: This is a one-time discount offered to the customer.
     - **Limited number of cycles**: You can specify the number of cycles for which the offer should be applied.
       For example, you can apply an offer for the first 3 cycles of a 12-month subscription.
     - **Forever**: The offer is applied for the entire duration of the subscription.
   - **Discount Type**:
     - **Flat**: A flat discount is offered to the customer.
     - **Percentage**: The discount offered is a percentage of the subscription amount.
7. Click **Next**.
8. Select the applicable payment method in the **Applicable On** tab.
   - **Payment Method**:
     - **UPI**: Offers will only be applicable for UPI Payments.
     - **Card**: Offers will only be applicable for card payments.
       - **Card type**: Credit card, debit card or both.
       - **Bank**: Card issuing bank. For example, HDFC Bank, Axis Bank.
          You can select 1 bank or all available banks. You cannot select multiple banks.
       - **Network**: Card network. For example, Visa, RuPay.
          You can select 1 network or all available networks. You cannot select multiple networks.
       - **Max Usage Per Card**: How many times can a particular card be used to avail the offer.
       - **IINs**: The card IINs on which the offer should be applied. You can enter multiple IINs separated by commas.
9. Click **Next**.
10. Enter the following information in the **Offer Validity** tab.
    - **Starting On**: The date and time from which the offer should be available to customers.
      - Start Immediately.
      - Select a date and time using the date-time picker.
    - **Expires On**: The date and time till when the offer should be available to customers. Select a date and time using the date-time picker.
    - **On Payment Failure**: What happens when an offer validation (such as payment method) fails.
      - Allow the customer to complete the payment without the offer.
      - Do not allow the payment to go through.
11. Click **Next**.
12. Review the offer.
13. Read the disclaimer. Click the check box.
14. Click **Create Offer**.

## Disable Offers

In certain scenarios, you might want to disable an existing offer. When you disable an offer it is no longer available to your customers.

**Handy Tips**

Disabling an offer does not mean it is deleted from any subscriptions to which it is linked. It only means the offer will no longer be available to your customers.

Know how to [delete an offer linked to a subscription](/razorpay-docs-md/subscriptions/offers/delete.md).

To disable an offer:

1. Log in to the Dashboard and click **Offers** under **PAYMENT PRODUCTS** in the left menu.
2. Click the required Offer Id.
3. In the right pane that appears, click **Disable**.

![disable offer](https://razorpay.com/docs/payments/subscriptions/offers/build/browser/assets/images/offers-disable_offer.jpg)

### Related Information

- [About Offers](/razorpay-docs-md/subscriptions/offers.md)
- [Link an Offer to a Subscription](/razorpay-docs-md/subscriptions/offers/link.md)
- [Update an Offer Linked to a Subscription](/razorpay-docs-md/subscriptions/offers/update.md)
- [Delete an Offer Linked to a Subscription](/razorpay-docs-md/subscriptions/offers/delete.md)
