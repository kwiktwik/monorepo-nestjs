<!-- Source: https://razorpay.com/docs/payments/offers/low-cost-emi/create -->

A Low Cost EMI is an offer where you can decide the cost to subvent for each EMI tenure and the customer bears the remaining cost.
This approach ensures that customers enjoy the benefits of EMI at an affordable price, helping you minimise the overall cost.

**Handy Tips**

Once you create a Low Cost EMI offer, you cannot edit it. To make changes, disable the previous offer and create a new one.

## Steps to Create Low Cost EMI Offers

Watch this video to see how to create an offer.

To create Low Cost EMI offers:

1. Log in to the Dashboard.
2. Navigate to **Offers** and click **+ Create No & Low Cost EMI**.

   ![Create a Low Cost EMI offer](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/offers-offers-dashboard.jpg)
3. The **Create an Offer** wizard appears with the following four sections. Enter details in all these sections to create the offer.
   - [**Description**](/razorpay-docs-md/offers/low-cost-emi/create.md#description)
   - [**Discount Type**](/razorpay-docs-md/offers/low-cost-emi/create.md#discount-type)
   - [**Applicable On**](/razorpay-docs-md/offers/low-cost-emi/create.md#applicable-on)
   - [**Additional Offer Type**](/razorpay-docs-md/offers/low-cost-emi/create.md#additional-offer-type)
   - [**Offer Validity**](/razorpay-docs-md/offers/low-cost-emi/create.md#offer-validity)

You can review the offer configurations at the end under the [**Overview**](/razorpay-docs-md/offers/low-cost-emi/create.md#overview) tab.

## Description

In the **Description** section, enter the following details. All the fields are mandatory.

1. **Offer Name**: Enter the name of the offer. For example, **Diwali Dhamaka**. This appears at the Checkout.
2. **Display Text**: Enter a meaningful description for the offer. For example, **Low Cost EMI Offers**. This appears at the Checkout.
3. **Terms**: Enter the terms and conditions for this offer.
4. Click **Next**.

![Enter the offer details to proceed](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/offers-low-cost-emi-description.jpg)

## Discount Type

In the **Discount Type** section, enter the discount details that should be applied to the offer.

1. **Minimum Order amount**: Enter the minimum bill amount for which the Low Cost EMI Offer can be applied. For example, the offer can be applied to a minimum amount of **₹4,000**. This is a mandatory field.
2. **Maximum Order amount**: Enter the maximum bill amount for which the Low Cost EMI Offer can be applied. For example, the offer can be applied to a maximum amount of **₹1,00,000**.
3. Click **Next**.

![Enter the discount details to proceed](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/offers-low-cost-emi-discount-type.jpg)

## Applicable On

Under the **Applicable On** tab, fill in the following details:

1. **Issuer**: Select the bank issuing the Low Cost EMI and click **Next**.
2. **EMI Tenure**: Select the tenures to be listed at the Checkout.
3. **EMI Offer Type**: Select **Low Cost EMI** from the drop-down list and configure the interest rate that you will bear for each tenure. The remaining interest rate is auto-filled which is borne by the customer.
4. Click **Next**.

![Enter the payment method details](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/offers-low-cost-emi-applicable-on.jpg)

## Additional Offer Type

**Feature Request**

This feature is being released out gradually and may not be available to all businesses yet.

In the Additional Offer Type section, you can configure extra incentives to make your Low Cost EMI offer more attractive to customers. This step allows you to provide additional discounts or cashback rewards on top of the reduced interest EMI benefit.

**Handy Tip**

This additional offer will be applied on top of the EMI discount.

1. **Additional Offer**: From the dropdown menu, select the type of additional offer you want to provide:

   - **Instant Discount**: Provides an immediate reduction in the order amount at the time of purchase.
   - **Cashback**: Credits the discount amount back to the customer's account after successful payment completion.

     **Watch Out!**

     Please note that cashback processing is handled externally and not managed by Razorpay.
2. **Tenures Applicable**: Select the specific EMI tenures for which this additional offer applies. You can choose from the tenures that were configured in the previous step.
3. **Discount**: Choose between a flat amount or a percentage-based discount:

   - **Flat**: Enter a fixed discount amount in rupees.
   - **Percentage**: Enter a percentage-based discount with a maximum limits.
4. **Discount Worth**: Enter the discount amount in cash value. For example, ₹1000.
   The field shows "Discount worth in cash" as a helper text to clarify the input format
5. Click **Next**.

![Configure additional offer type for enhanced customer benefits](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/offers-no-cost-emi-applicable-offer-type.jpg)

## Offer Validity

In the **Offer Validity** tab, set how long the offer should be valid and how you want to handle the payment failure situations:

1. **Starting On**: Select the **Starts Immediately** check box for the offer to come into effect immediately. Alternatively, you can select the date and time the created Offer should become active.
2. **Expires On**: Select the date and time the offer should end.
3. **On Payment Failure**: Define how to handle payment failure.
   - **Do not allow payment to go through**: The payment has failed.
   - **Allow customer to pay without availing offer**: The payment is allowed even though the set validations are not met. However, the offer is not applied to the bill amount. The customer will be charged the entire order amount.
4. **Max Usage**: Set the number of times the offer should be applied across all transactions. For example, **100**.
5. **Show Offer on Checkout**: Select this check box for the created offer to be displayed for all Standard Checkout payments including [Payment Links](/razorpay-docs-md/payment-links.md)   .
6. Click **Next**.

![Enter the offer validity details to proceed](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/offers-low-cost-emi-offer-validity.jpg)

## Overview

Click the **Overview** tab to view the offer summary you just created.

1. **Terms and Conditions**: Select the check box after you have read the disclaimer.
2. Click **Create EMI Offer**.

![Check the terms and conditions and create an offer](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/offers-low-cost-emi-overview.jpg)

By default, all the created offers are in the **enabled** state.

## Test the Low Cost EMI Offer

You can test the created Low Cost EMI offer for all Standard Checkout payments, including [Payment Links](/razorpay-docs-md/payment-links.md), [Payment Button](/razorpay-docs-md/payment-button.md), [Payment Pages](/razorpay-docs-md/payment-pages.md) and so on.

**Handy Tips**

- You can toggle between Live and Test Modes on your **Dashboard**. Navigate to the top menu ribbon and click the drop-down icon against **Live Mode**. Toggle to **Test Mode** and test the offers enabled.
- You can make test payments using one of the payment methods at the Checkout. No money is deducted from your account as this is a simulated transaction.

We will test the offer using a valid Payment Link for this example. Follow the steps given below:

1. Select the **Payment Link Id** you wish to test the created offer from the Dashboard.

   ![Payment Link Test Offer](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/offer-dashboard-test.jpg)
2. Copy the **Payment Link** URL and open it in your browser.
3. Enter your contact details and click **Proceed**.
4. Select **EMI**.
5. Select the payment option you created for the offer on from the Dashboard. Select the EMI plan and enter the required [test details](/razorpay-docs-md/payments/test-card-details.md)   .
6. Click **Pay via EMI**
7. Select **Success** or **Failure**, depending on which flow you wish to test.
8. You should see a confirmation message depending on the flow you have selected.

On successful payment, you should have received a discount on your payment. You can verify this by navigating to the **Transactions** → **Payments** tab and viewing the payment details.

## Disabling Low Cost EMI Offers

To disable Low Cost EMI offers:

1. Log in to the Dashboard.
2. Navigate to **Offers** to view a summary of the existing offers.
3. Click the required Offer\_id.
4. Go to the **Status** field in the pane that appears and click **Disable**.

   ![Disable an Offer](https://razorpay.com/docs/payments/offers/low-cost-emi/build/browser/assets/images/disable-offer.jpg)
5. Click **Yes, Disable**.

## Next Steps

Now that the Low Cost EMI is created, you should integrate it with the Checkout for customers to avail the EMI scheme.
Know more about [integrating Low Cost EMI Offers with Standard Checkout](/razorpay-docs-md/offers/low-cost-emi/standard-integration.md).

### Related Information

- [Tutorial - How to Create Low Cost EMI Offers](/razorpay-docs-md/offers/low-cost-emi/tutorial.md)
- [Low Cost EMI FAQs](/razorpay-docs-md/offers/low-cost-emi/faqs.md)
