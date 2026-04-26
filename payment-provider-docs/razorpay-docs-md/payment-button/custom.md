<!-- Source: https://razorpay.com/docs/payments/payment-button/custom -->

You can create a Payment Button using the Dashboard and embed it on your website to accept payments from customers.

**Example**

You work for a baking institute and are in charge of organising a baking competition. You must add a payment button in your website for participants to register and pay the enrollment fee.

## Prerequisites

- [Set up](/razorpay-docs-md/set-up.md#sign-up)

  your Razorpay account.
- Log in to the Dashboard.
- The Dashboard has [test and live modes](/razorpay-docs-md/dashboard/test-live-modes.md)  . Payment Buttons created in the test mode do not appear in the live environment. **You must create a new Payment Button in live mode**.

## Create a Custom Payment Button

Watch this video to see how to create a Custom Payment Button.

Below are the steps to create a Custom Payment Button:

1. [Select a Template](/razorpay-docs-md/payment-button/custom.md#1-select-a-template)
2. [Add Button Details](/razorpay-docs-md/payment-button/custom.md#2-add-button-details)

### 1. Select a Template

1.1 Log in to the Dashboard.

1.2 Go to the **PAYMENT PRODUCTS** section and click **Payment Button**.

![Dashboard - Payment Products](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-payment-button-dashboard.jpg)

1.3 Click **+ Create Payment Button**.

1.4 On the **Button Creation Wizard**, select the **Create Your Own** button type.

![Pick a Button Type](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-select-template.jpg)

1.5 Click **Use this template**.

### 2. Add Button Details

Configure these sections to create the Payment Button:

2.1 Button Details

On the **Button Details** pop-up page, enter the relevant information:

1. **Title**: Provide a name for the button. This name is for your internal reference and appears on the Dashboard. It **will not be visible** to customers. For example, **Annual Baking Competition**.
2. **Button Type**: If you want to change the button type, click the drop-down list and select one of the types. If the button type is switched mid-way, any information entered during creation will not be saved.
3. **Button Label**: The text on the button to be displayed to customers. Please enter alphanumeric characters only. The maximum character limit is 20. An example for this is **Register Now**.
4. **Button Theme**: You can choose between the following themes:
   - Razorpay Dark
   - Razorpay Light
   - Razorpay Outline
   - Brand Color (This is the color configured by you on Dashboard)
5. Click **Next**.

![Button Details](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-button-details.jpg)

2.2 Amount Details

For the Payment Button in the example, you must create the Registration Fee amount fields with the following configuration:

To create the **Registration Fee** amount field:

1. Click **+Add Amount Field**.

   ![Amount Details](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-amount-details-2.jpg)
2. From the drop-down list, select **Fixed Amount** as the field type.
3. On the pop-up:
   1. Enter the label of the product as `Registration Fee`.
   2. Click **+ Add Description** and enter details if required.
   3. Enter the amount as `500`.

      ![Amount Details](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-amount-field.jpg)
   4. Click the more icon to view **Advanced Options**. Select **Item has Limited Stock** and enter the value as `50`.

      ![Amount Details](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-amount-field-2.jpg)
   5. Click **Save**.
4. **Save** the field and click **Next**.

![Amount Details](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-amount-fields-complete.jpg)

2.3 Customer Details

In **Customer Details**, configure the information that must be entered by the participant while making the payment. By default, `Email` and `Phone` must be entered. However, you can edit the labels of these fields.

![Customer Details](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-customer-details.jpg)

#### Custom Fields

You can add more fields to collect additional data from the participant. Let us add two custom fields - **Name** and **Address**.

To add **Name** custom field:

1. Click **+ Add Input Field**. From the drop-down list that appears, select **Single Line Text**.
2. In the modal, enter the label for the custom field - `Name`.
3. If required, add a description for the field.
4. Click **Save**.

Similarly, create the custom field for **Address**.

![Customer Details](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-customer-details-added.jpg)

To proceed, click **Next**.

The data entered by the participants will be available in the Transaction Details report.

2.4 Review and Create

1. Review the details entered in the previous sections. You can click **Back** to navigate to the **Button Details**, **Amount Details** and **Customer Details** sections to make changes.
2. Click **Create Button**.

   ![Review Page](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-review-button.jpg)
3. After completing the steps, the button code appears. Copy this code and add it in your webpage.

   ![Review Page](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-pb-success.jpg)

## Embed Payment Button Code in Website

The embed code generated on the Dashboard must be embedded in your website. After this is done, the Buy Now button will appear on your website.

Customers can click this button to:

1. Open Razorpay Checkout.
2. Select the products.
3. Add their name and address.
4. Complete the payment.

You can embed this code on any webpage, be it a custom HTML site or one built on platforms such as WordPress, Wix or Google Sites.

Example

Let us embed the Buy Now button on an HTML page.

1. Create a blank HTML file on your system.
2. Paste the embed code onto the page.
3. Save this HTML page and open it on the browser.

Your button has now been embedded on your website!

![Embed Payment Button Code GIF](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-embed-min.gif)

## Make Test Payments Using the Payment Button

Follow these steps to make a test payment using a payment button:

1. Select the payment button you wish to test from the Dashboard and click **Get Code**.
2. Click **Copy Code** to copy the code to your clipboard.

   ![Payment Button Code Selection](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/pb-button-code-select.jpg)
3. Test the Payment Button by adding the code to the [Payment Button Test Widget](https://cdn.razorpay.com/static/widget/test-payment-button.html)   .
4. Paste the code in the text box and click **Run Code**.
5. Click on the Payment Button that appears in the preview section.

   ![Payment Button Test Preview](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/pb-run-test-preview.jpg)
6. Enter the required details and click **PROCEED TO PAY**.
7. Select the payment method of your choice to proceed with the payment.

   Cards

   UPI

   Netbanking

   You can use these [test card details](/razorpay-docs-md/payments/test-card-details.md#test-cards)   .
8. You should see a confirmation message depending on the flow you have selected.

   ![Payment Success](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/pb-payment-success.jpg)

### Customer Interaction

Let us make a test transaction to check how the customer will interact with the button on your website.

1. Click the **Register Now** button.
2. Enter name and phone number and fill in the details in the other fields and click **Next**.
3. Select a payment method, for example, card, and complete the payment.
4. The payment success screen is displayed and a confirmation email is sent to you.

![Customer Interaction GIF](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-customerpayment.gif)

## Post Payment Actions

After the customer has successfully completed the payment, you can:

#### Send Payment Receipt

#### Show Custom Message

#### Redirect Your Customers

#### Send Payment Receipt

You can ensure that your customers receive payment receipts via email once they complete the payment. Know how to [send and download automated or manual payment receipts](/razorpay-docs-md/payment-button/receipt.md).

If you are an NGO, you can [send and download payment receipts with 80-G information](/razorpay-docs-md/payment-button/80g-receipt.md).

#### Show Custom Message

You can show a custom message to your customers once they complete a payment.

To show custom messages:

1. On the **Button Created Successfully** pop-up page, click **Configure** against **Redirect URL and Custom Message**.
2. On the pop-up page, enable **Show a custom message**.
3. Add the custom message in the field.
4. Click **Save**.

![Button Settings custom message](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-message.jpg)

#### Add a Redirect URL

You can redirect your customers to another page after they complete a payment.

To redirect your customers:

1. On the **Button Created Successfully** pop-up page, click **Configure** against **Redirect URL and Custom Message**.
2. On the pop-up page, enable **Redirect URL**.
3. Add the redirect URL in the field.
4. Click **Save**.

![Button Settings redirect URL](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-redirect.jpg)

## View Transaction Details on Dashboard

You can view the payments as and when they are made in the [Transactions Details View](/razorpay-docs-md/payment-button/view-reports.md) of the page.

![Transaction details on Dasboard](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-button-custom-transaction-detail.jpg)

## Export Report

You can also export the report data into a CSV file.

To export report:

1. Log in to the Dashboard and navigate to **Payment Button**.
2. Select the relevant Payment Button. The Transactions Details View appears.
3. Click **Export All (CSV)** button.

A .csv file is downloaded, where you can find a monthly report of all the payments made using your button.

## Settlement

You will receive the payments in your bank account as per the settlement cycle agreed upon at the time of Razorpay account setup. Usually, this is T+2 days. In case of international payments, the settlement cycle is T+7 days.

### Related Information

- [Payment Button](/razorpay-docs-md/payment-button.md)
- [How Payment Button Works](/razorpay-docs-md/payment-button/how-it-works.md)
- [Payment Button States](/razorpay-docs-md/payment-button/states.md)
- [Quick Pay Button](/razorpay-docs-md/payment-button/quick-pay.md)
- [Buy Now Button](/razorpay-docs-md/payment-button/buy-now.md)
- [Donations Button](/razorpay-docs-md/payment-button/donations.md)
- [Manage Payment Button](/razorpay-docs-md/payment-button/manage.md)
- [Prefill Amount Fields](/razorpay-docs-md/payment-button/manage/prefill-amount-fields.md)
- [Search for a Payment Button](/razorpay-docs-md/payment-button/search.md)
- [View Reports](/razorpay-docs-md/payment-button/view-reports.md)
