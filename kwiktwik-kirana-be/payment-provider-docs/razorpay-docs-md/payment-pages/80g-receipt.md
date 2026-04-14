<!-- Source: https://razorpay.com/docs/payments/payment-pages/80g-receipt -->

If you are an NGO using Payment Pages to accept donations, you can share payment receipts with 80G details to your customers via email once they make the payment.

## Set Up Payment Receipt

Payment Receipts can be generated and shared using **Automated Rececipts** or **Manual Receipts**.

Watch this video on how to configure 80G-enabled Payment Receipts.

Automated Receipt

Manual Receipt

You can automatically share the payment receipt with customers via email and SMS. An auto-generated reference number is added by Razorpay.

To configure automated Payment Page receipts:

1. While creating or editing the Payment Page, select **Payment Receipts** from the top menu ribbon.

   ![Edit an 80G-enabled Payment Page](https://razorpay.com/docs/payments/payment-pages/build/browser/assets/images/payment-pages-receipt-pp-receipt.jpg)
2. On the **Payment Receipts Settings** pop-up page, select **Send Automated Receipts**.
3. To show an input field such as `Name`, `Address` and its associated value on the receipt:
   1. Enable the **Show an Input Field on Receipt** option.
   2. In the drop-down list, select one of the custom input fields such as `Name`, `Address` or `Landmark`, used on the Payment Page. For example, if you selected `Name`, the patron's name `Gaurav Kumar` will appear on the payment receipt.

   ![Send automated receipts from 80G-enabled Payment Pages](https://razorpay.com/docs/payments/payment-pages/build/browser/assets/images/payment-pages-receipt-pp-receipt-80g-setting.gif)
4. To issue receipts with 80G details, enable the **Show 80G Details** option.
5. Use the **Click here** link to add relevant 80-G text to be displayed in the payment receipt. This opens the **Manage 80-G** pop-up page where you can add a description and upload the signature of the authorised signatory.
   1. Enter the description. For example:
      `Donation eligible for exemption under 80-G under IT Act 1861 .. with ID DIT(E)/2009-2010/W-110/15XX dated 24.09.2009`
   2. Upload an image of the **Signature of Authorized Signatory** field and click **Save**.

   ![Resend payment receipt from Razorpay Dashboard](https://razorpay.com/docs/payments/payment-pages/build/browser/assets/images/payment-pages-receipt-pp-receipt-80g-sign.gif)
6. Click **Save**.

Resend and Download Payment Receipt

To resend the receipt to a customer:

1. Navigate to the page's **Transactions Details** screen. All the payments made using the Payment Page are listed here.
2. Click on the Payment id to view the payment details.
3. In the **Payment Receipt** field, click the **Send** button. This will resend the receipt to the customer. [

download payment receipt

](/razorpay-docs-md/payment-pages/build/browser/assets/images/payment-pages-invoice.md)

You can download the payment receipt using the **Download** button.

Email Notification to Customers

After your customers complete the payment using the Payment Page, the payment receipt is sent to them via email as a PDF attachment. The details entered by the customer on the Payment Page appear on the email body as shown below:

![80G Payment receipt sent via email notification to a customer](https://razorpay.com/docs/payments/payment-pages/build/browser/assets/images/payment-pages-receipt-email.jpg)

PDF Receipt to Customers

Here is a sample PDF of the payment receipt.

![PDF of 80G payment receipt sent to a customer](https://razorpay.com/docs/payments/payment-pages/build/browser/assets/images/payment-pages-receipt-receipt-80g-example.jpg)

### Related Information [Configure Payment Pages Receipt](/razorpay-docs-md/payment-pages/receipt.md)
