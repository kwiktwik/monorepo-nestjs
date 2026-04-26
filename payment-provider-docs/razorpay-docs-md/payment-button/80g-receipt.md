<!-- Source: https://razorpay.com/docs/payments/payment-button/80g-receipt -->

If you are an NGO and using Razorpay Payment Button to accept donations from patrons, you can share payment receipts with 80G details for your customer after they make the payments. The payment receipts can be generated and shared [Automatically](/razorpay-docs-md/payment-button/80g-receipt.md#automated-receipt) or [Manually](/razorpay-docs-md/payment-button/80g-receipt.md#manual-receipt).

Here is a sample PDF of the payment receipt.

![Example Receipt](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-pages-receipt-receipt-80g-example.jpg)

## Automated Receipt

Automatically generate payment receipts and send them to the customers through email and SMS using the details they provided at the time of payment. An auto-generated reference number is be added by Razorpay.

Watch this video to see how to configure automated payment receipts.

To configure automated payment receipts:

1. While creating or editing the Payment Button, select the **Payment Receipts** feature available on the top menu ribbon.
2. On the **Payment Receipts Settings** pop-up page, select **Send Automated Receipts**.
3. You can show an input field such as `Name`, `Address` and its associated value on the Receipt.
   1. Enable the **Show an Input Field on Receipt** feature.
   2. In the drop-down list, select one of the custom input fields such as `Name`, `Address` or `Landmark`, used on the Payment Button. For example, if you have selected `Name`, the patron's name `Gaurav Kumar` will appear on the payment receipt.
4. To issue receipts with 80-G details, enable the **Issue 80-G Receipts** option.
5. Use the **Click here** link to add relevant 80-G text to be displayed in the payment receipt. This opens the **Manage 80-G** pop-up page where you can add a description and upload the signature of the authorized signatory.
   1. Enter the description. For example:
      Donation eligible for exemption under 80-G under IT Act 1861 .. with ID DIT(E)/2009-2010/W-110/15XX dated 24.09.2009
   2. Upload an image of the signature in the **Authorized Signatory** field and click **Save**.
6. Click **Save**.

## Manual Receipt

You can choose to send payment receipts to your customers manually. In this case, you must manually add a reference number to the receipt and share it with your customers.

To configure manual payment receipts:

1. On the Payment Button creation pop-up page, select the **Payment Receipts** feature available on the top menu ribbon.
2. On the **Payment Receipts Settings** pop-up page, select **Send Manual Receipts**.
3. You can show an input field such as `Name`, `Address` and its associated value on the Receipt.
   1. Enable the **Show an Input Field on Receipt** feature.
   2. In the drop-down list, select one of the custom input fields such as `Name`, `Address` or `Landmark`, used on the Payment Button. For example, if you have selected `Name`, the patron's name `Gaurav Kumar` will appear on the payment receipt.
4. To issue receipts with 80-G details, enable the **Issue 80-G Receipts** option.
5. Use the **Click here** link to add relevant 80-G text to be displayed in the payment receipt. This opens the **Manage 80-G** modal where you can add a description and upload the signature of the authorized signatory.
   1. Enter the description. For example:
      Donation eligible for exemption under 80-G under IT Act 1861 .. with ID DIT(E)/2009-2010/W-110/15XX dated 24.09.2009
   2. Upload an image of the signature in the **Authorized Signatory** field and click **Save**.
6. Click **Done**.
7. Navigate to the page's **Transactions Details** section. All the payments made using the Payment Button are listed here.

   ![Transaction Details section with list of payments](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-pages-receipt-pp-transactions-send.jpg)
8. Click the Payment ID to view the payment details.
9. In the **Payment Receipt** field, click the **Send** button.
10. Enter a reference number for the receipt as per your business requirements.

    ![Enter reference number for manual receipt](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-pages-receipt-pp-manual-ref.jpg)
11. Click **Send**.

Resend and Download Payment Receipt

Watch this video to see how to resend and download a payment receipt.

To resend and download a payment receipt:

1. Navigate to the button's **Transactions Details** page. All the payments made using the Payment Button are listed here.
2. Click on the Payment ID to view the payment details.
3. In the **Payment Receipt** field, click the **Send** button. This will resend the receipt to the customer.
4. You can download the payment receipt using the **Download** button.

Email Notification to Customers

Payment receipts are sent to customers via email as a PDF attachment. The details entered by the customer while making the payment also appear on the email body.

![](https://razorpay.com/docs/payments/payment-button/build/browser/assets/images/payment-pages-receipt-email.jpg)

### Related Information [Configure Generic Payment Button Receipt](/razorpay-docs-md/payment-button/receipt.md)
