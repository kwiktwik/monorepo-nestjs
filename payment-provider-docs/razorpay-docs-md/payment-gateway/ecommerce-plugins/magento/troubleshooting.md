<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/troubleshooting -->

Know how to troubleshoot some of the common error messages for Magento 1.x and 2.x extensions.

## Troubleshooting for Magento 1.x Extension

Below are some common error messages and the possible reasons and fixes:

## Troubleshooting for Magento 2.x Extension

Below are some common error messages and the possible reasons and fixes:

## FAQs

1. What troubleshooting procedures should be carried out prior to initiating a support ticket?

Follow the troubleshooting steps given below:

1. Ensure that your system meets all the requirements mentioned [here](/razorpay-docs-md/payment-gateway/ecommerce-plugins/magento.md)   .
2. We recommend you to keep your Magento and Razorpay plugins up to date. You can find the latest versions [here](https://github.com/razorpay/razorpay-magento/releases)   .
3. If the issue persists after following these steps, contact our [Support team](https://razorpay.com/support/)   . Provide the following information while creating a ticket:
   - Magento version (1.x/2.x)
   - Razorpay Magento plugin version
   - PHP version
   - Steps to reproduce the issue (Screen recording/Screenshots)
   - Error logs, if any
   - Magento staging website credentials (login URL, login id, and password)
   - SSH/FTP access to the staging server

2. Is PWA (Progressive Web Apps) supported for Magento Plugin?

Yes, Magento Plugin supports Progressive Web Apps (PWA) through GraphQL.

3. If you initiate a refund on the Razorpay Dashboard, will the same status reflect on the Magento Dashboard?

Initiating a refund on the Razorpay Dashboard does not automatically update the status on Magento. The refund process is typically managed through the Magento Dashboard. The status changes made on the Magento Dashboard are then reflected on the Razorpay Dashboard.

4. How can I create a Custom Order Status in Razorpay Magento?

Below are the steps to create a Custom Order Status in Razorpay Magento:

**Step 1: Create a customer order status.**

1. Go to **Stores** → **Order Status** (under Settings) on the Magento Admin Dashboard.

   ![Magento Admin Dashboard order status](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-order-status-new.jpg)
2. On **Order Status** page, click **Create New Status**.

   ![Magento Create new status on Admin Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-create-new-status-new.jpg)
3. On the **Create New Order Status** page:

   - Insert a **Status Code** under the **Order Status Information** section for internal reference.

   **Handy Tips**

   This field must contain letters (a-z), numbers (0-9), and the underscore. You must use letters at the first character. The rest can be a combination of letters and numbers.

   - Set the **Status Label** for Admin and storefront.
   - Set the **Default Store View** under **Store View Specific Labels** for each store view.

   ![Magento order status information](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-order-status-information-new.jpg)
4. Click **Save Status** to complete.

   ![Magento order status information save](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-order-status-save-new.jpg)

**Step 2: Un-assign existing status.**

1. Un-assign the existing status code that is in use.

   - If State Code and Title is `processing[Processing]`, the `processing` status is already in use for state `processing`.
   - Un-assign this status from the existing state code `processing`, so the state will be available for your custom status code.

   **Watch Out!**

   If you get the following error "The status can't be unassigned because the status is currently used by an order.", directly move to step 3.

**Step 3: Assign an order status to a state.**

1. Go to the **Order Status** page, and click **Assign Status to State**.

   ![Magento assign status to state](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-assign-status-to-state-new.jpg)
2. On the **Assign Order Status to State** page:
   - Select the **Order Status** to assign from the existing order status list.
   - Select the **Order State** as `processing` to include the order status you have just assigned.
   - Select the **Use Order Status As Default** checkbox to accept the Order Status as a default.
   - Select the **Visible On Storefront** checkbox to enable the order status on the storefront.

   ![Magento assignment information](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-assignment-information-new.jpg)
3. Click **Save Status Assignment** to complete.

   ![Magento save status information](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-save-status-assignment-new.jpg)

**Step 4: Using custom order status for Razorpay Magento.**

1. On the Magento Admin Dashboard, open Razorpay payment method settings.
2. On the **Configuration** page:
   - At **Enable Custom Paid Order Status** field, select **Yes** to enable custom order status, and select **No** to disable custom order status.
   - Insert **Custom Paid Order Status** value in the input field, providing the same value as the Status Code while creating custom status.

   ![Magento configuration](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-configuration-new.jpg)
3. Click **Save Config** and refresh the cache.

   ![Magento save configuration](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-save-confi-new.jpg)

5. I am getting the following error message "Column not found: 1054 Unknown column 'main\_table.rzp\_webhook\_notified\_at' in 'field list', query was: SELECT main\_table.entity\_id, main\_table.rzp\_webhook\_notified\_at FROM sales\_order AS main\_table."

If you encounter this error message, [update](/razorpay-docs-md/payment-gateway/ecommerce-plugins/magento/integration-steps.md#step-1-download-and-install-extension) the plugin to the latest version to resolve the issue.

6. Does the Magento plugin support 3 or 0 decimal unit currencies?

The Magento plugin currently supports only currencies that use 2 decimal units. For example: USD, EUR, INR. It does not support currencies with 0 decimal (for example, JPY) or 3 decimal units (for example, BHD).
