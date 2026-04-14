<!-- Source: https://razorpay.com/docs/payments/payment-pages/receipt -->

You can share payment receipts with customers via email once they complete payments using the Payment Page.

## Set Up Payment Receipt

Payment Page Receipts can be generated and shared using **Automated Rececipts** or **Manual Receipts**.

Automated Receipt

Manual Receipt

You can automatically share the payment receipt with customers via email and SMS. An auto-generated reference number is added by Razorpay.

To configure automated Payment Page receipts:

1. While creating or editing the Payment Page, select **Payment Receipts** from the top menu ribbon.

   ![Edit a Payment Pages](https://razorpay.com/docs/payments/payment-pages/build/browser/assets/images/payment-pages-receipt-pp-receipt-non-ngo.jpg)
2. On the **Payment Receipts Settings** pop-up page, select **Send Automated Receipts**.
3. To show an input field such as Name, Address and its associated value in the receipt:
   1. Enable the **Show an Input Field on Receipt** option.
   2. In the drop-down list, select one of the custom input fields such as `Name`, `Address` or `Landmark`, used on the Payment Page. For example, if you have selected `Name`, the customer's name `Gaurav Kumar` will appear on the Payment Page receipt.
4. Click **Save**.

![Send automated receipts from Payment Pages](https://razorpay.com/docs/payments/payment-pages/build/browser/assets/images/payment-pages-receipt-pp-receipt-auto-settings.gif)

Resend and Download Payment Receipt

To resend the receipt to a customer:

1. Navigate to the page's **Transactions Details** screen. All the payments made using the Payment Page are listed here.
2. Click on the Payment id to view the payment details.
3. In the **Payment Receipt** field, click the **Send** button. This will resend the receipt to the customer. [

download payment receipt

](/razorpay-docs-md/payment-pages/build/browser/assets/images/payment-pages-invoice.md)

You can download the payment receipt using the **Download** button.

Email Notification to Customers

After your customers complete the payment using the Payment Page, the payment receipt is sent to them via email as a PDF attachment. The details entered by the customer on the Payment Page appear on the email body.

![Payment receipt sent via email notification to a customer](https://razorpay.com/docs/payments/payment-pages/build/browser/assets/images/payment-pages-receipt-email-non80g.jpg)

PDF Receipt to Customers

Here is a sample PDF of the payment receipt.

![Sample PDF of the payment receipt](https://razorpay.com/docs/payments/payment-pages/build/browser/assets/images/payment-pages-receipt-receipt-example.jpg)

### Related Information [Configure 80G-Enabled Payment Pages Receipt](/razorpay-docs-md/payment-pages/80g-receipt.md)
