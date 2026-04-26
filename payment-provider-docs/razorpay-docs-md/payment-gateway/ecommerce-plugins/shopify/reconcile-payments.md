<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/reconcile-payments -->

Reconciling payments made on your Shopify store with the data available on your Dashboard is a simple process.

![Reconciliation Process Flow](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/ecommerce-plugins-shopify-reconciliation-process-flow.jpg)

Reconcile a Payment

Follow the steps below to reconcile a payment:

1. Log in to the [Shopify Dashboard](https://accounts.shopify.com/)

   and open the **Orders** tab. Click the drop-down to view the 1 Razorpay payment details.

   ![View 1 Razorpay details](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-rzp-secure-details.jpg)
2. Make a note of the payment id.

   ![Shopify payment details](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-payment-details.jpg)
3. Log in to the Dashboard and navigate to **Transactions** → **Payments**. The payment appears on the list of payments. The payment id appears under the **Order Id** column.

   ![View payments on Razorpay Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-rzp-payment-track.jpg)
4. Match the payment id (on the Shopify Dashboard) with the Order id (on the Razorpay Dashboard) to map the payments.

Reconcile Multiple Payments

Follow the steps below to reconcile multiple payments:

1. Log in to the [Shopify Dashboard](https://accounts.shopify.com/)

   and open the **Orders** tab.
2. Select the required orders or time period.
3. Click **Export** to export the data. The **Payment References** column in the file contains the payment ids.

   ![Export Shopify order data](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-select-orders.jpg)
4. Log in to the Dashboard and navigate to **Reports**.
5. Select **Shopify Payments Report** in the **Select Report Type** drop-down.
6. Select the period and format.
7. Click **Generate Report**.

   ![Download the Shopify Payments Report from Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-payments-report.jpg)
8. Once the report is generated, click **Download**. The **Order ID** column in the file contains the payment ids.
9. Match the **Payment References** column in the Shopify export with the **Order ID** column in the **Shopify Payments Report** to map the payments.

### Related Information

- [Integrate with Shopify Plugin](/razorpay-docs-md/payment-gateway/ecommerce-plugins/shopify.md)
- [Shopify FAQs](/razorpay-docs-md/payment-gateway/ecommerce-plugins/shopify/faqs.md)
