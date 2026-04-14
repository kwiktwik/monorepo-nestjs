<!-- Source: https://razorpay.com/docs/payments/ecommerce-plugins/ghost-integration/zapier-integration -->

Zapier Integration consists of 2 sets of steps - **Trigger** and **Action**.

- A successful payment through the Razorpay Payment Button initiates the `payment.captured` webhook, which acts as the **Trigger** for Zapier.
- **Action** is the member creation done by Zapier in Ghost, following the **Trigger**.

Follow these steps to integrate Zapier with your Payment Button and Ghost:

### Trigger

To create the trigger:

1. Log in to your [Zapier account](https://zapier.com)

   and click **+ Create** button on the top-left of the Zapier Dashboard page.

   **Handy Tips**

   A Zap is an automated workflow that connects your apps and services together. Every Zap consists of a trigger step and one or more action steps. When you turn your Zap on, it will run the action steps every time the trigger event occurs.
2. Select **Zaps** from the dropdown menu to create a new automated workflow.

   ![Create and Zap](https://razorpay.com/docs/payments/ecommerce-plugins/ghost-integration/build/browser/assets/images/create-zap.jpg)
3. Name your Zap as per your preference by clicking on **Untitled Zap** at the top of the editor and selecting **Rename**.

   ![Rename zap](https://razorpay.com/docs/payments/ecommerce-plugins/ghost-integration/build/browser/assets/images/rename-zap.jpg)
4. Click **Trigger** step box to configure the trigger event.
5. In the app selection panel, search for and select **Webhooks by Zapier** under **Popular built-in tools**.

   **Note**

   Webhooks by Zapier is a Premium feature. Ensure your Zapier plan supports Premium apps.

   ![select webhooks by zapier](https://razorpay.com/docs/payments/ecommerce-plugins/ghost-integration/build/browser/assets/images/zap-webhook-premium.jpg)
6. Choose **Catch Hook** as the Trigger Event from the available options and click **Continue** to proceed with the setup.

   ![select catch hook on trigger](https://razorpay.com/docs/payments/ecommerce-plugins/ghost-integration/build/browser/assets/images/trigger-catchhook.jpg)
7. (Optional) Configure the **Pick off a Child Key** field if you want Zapier to extract only a specific key from the webhook payload. Leave this blank to receive the entire payload.

   **Handy Tips**

   By default, Zapier gives you the entire payload of the webhook. If you specify a child key, Zapier will only grab that key from the object(s) sent to Zapier. For example, given `{"contact": {"name": "Gaurav"}}`, add "contact" here to only return `{"name": "Gaurav"}`.
8. Click **Continue** to proceed to the Test step.
9. Zapier generates a **Custom Webhook URL**. Copy and save this URL for later use. You will need this URL while creating the [Razorpay Webhook](/docs/webhooks/setup-edit-payments/)   .

   **Important**

   Configure your Razorpay Dashboard to send the `payment.captured` webhook to this Zapier URL. Refer to [Razorpay Webhook Setup](/docs/webhooks/setup-edit-payments/)

   for detailed instructions.
10. Click **Test trigger** to verify the webhook connection. Once a test payment is captured, Zapier will display the received data.

    ![Test Trigger](https://razorpay.com/docs/payments/ecommerce-plugins/ghost-integration/build/browser/assets/images/test-trigger.jpg)

### Action

To set up the action:

1. In your Zapier Zap, click on the **Action** step box or the **+** button to add an Action Step.
2. Search for and select **Webhooks by Zapier** again from the app selection panel.
3. Choose **Custom Request** as the **Action Event** and click **Continue**.

   ![Action select custom request](https://razorpay.com/docs/payments/ecommerce-plugins/ghost-integration/build/browser/assets/images/custom-request-action.jpg)
4. Configure the Custom Request to **Find Member**:

   Follow the steps in Zapier to fetch the customer email from Ghost. Here, you pass the customer email from Razorpay Webhook to check if it exists in your Ghost database.

   ![configure custom request](https://razorpay.com/docs/payments/ecommerce-plugins/ghost-integration/build/browser/assets/images/configure-custom-request.jpg)

   - **Method**: Select `GET` from the dropdown options (GET, PUT, POST, PATCH and DELETE).
   - **URL**: Your Ghost Admin API URL. Replace `email` with the email field from your Razorpay webhook data (for example, `payload__payment__entity__email`).
     URL example: `https://your-ghost-site.com/ghost/api/admin/members/?search=test@example.com`
   - **Data Pass-Through?**: Select `True`.
   - **Headers**:
     - Authorisation: Ghost-Admin. Replace `your_admin_api_key` with the Ghost Admin API credentials you got while [setting up Ghost](/razorpay-docs-md/ecommerce-plugins/ghost-integration.md#integration-steps)

       (refer #3 under Integrations).
     - Content-Type: application/json
     - Accept-Version: v6.0 (or v5.0 depending on your Ghost version)
   - **Data**: Enter the JSON structure as shown below:
5. Click **Continue** and then **Test step** to verify the configuration.
6. Copy the member id from the response, if the array is not empty. Follow the steps in the **Update Existing Member** tab to check for existing members and update the details in Ghost.
7. **Add Path/Filter**

   Check if the customer (member) already exists using email as a filter. For this, we recommend using **Paths by Zapier**, which enables you to apply conditional logic by defining **Path A** (update member, if already exists) and **Path B** (create new member, if non-existent).

   You will use the output from the **Find Member** steps for this.

   Update Existing Member (Path A)

   Create New Member (Path B)

   Define **Path A** to update an existing member.

   - Conditions:
     - Select the members array output from the steps in **Find Member** tab.
     - `Does not exactly match []` (empty array). This means if the members array is not empty, the member exists.
   - Action - Update Existing Member
     - Choose App & Event: **Webhooks by Zapier** → **Custom Request**.
     - Method: `PUT`
     - URL: Your Ghost Admin API URL. Get the id from the **Find Member** step's output (for example, `members__0__id`). URL example: `https://your-ghost-site.com/ghost/api/admin/members/60f7e6f0a0b0c0d0e0f0g0h0`
     - Headers:

       - Authorisation: Ghost-Admin. Replace `your_admin_api_key` with the Ghost Admin API credentials you got while [setting up Ghost](/razorpay-docs-md/ecommerce-plugins/ghost-integration.md#integration-steps)

         (refer #3 under [Integrations](/razorpay-docs-md/ecommerce-plugins/ghost-integration.md#integration-steps)

         ).
     - Data Pass-Through: Yes
     - Data: As given below:
   - Ensure to map `id` and `email` correctly from your Razorpay data.
   - You can add specific labels to categorise members (for example, `Razorpay Paid`).
   - Click **Continue** and **Test Action**.
8. Once all steps are configured and tested, click **Publish** in the top-right corner to activate your Zap.

### Related Information

- [Ghost Integration](/razorpay-docs-md/ecommerce-plugins/ghost-integration.md)
- [Integrate a Payment Button with Ghost](/razorpay-docs-md/ecommerce-plugins/ghost-integration/add-payment-button.md)
- [Razorpay Payment Button](/razorpay-docs-md/payment-button.md)
- [Razorpay Webhook](/docs/webhooks/setup-edit-payments/)
