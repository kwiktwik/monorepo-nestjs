<!-- Source: https://razorpay.com/docs/payments/route/batch-upload -->

Generate and process Linked Accounts and Transfers in bulk (batches) by uploading a batch file in the Dashboard. This simplifies the process of creating these individually.

## Create Batches

To create batches:

1. Download the sample file from the Dashboard.
2. Update the file with the required information.
3. Upload the file back to the Dashboard.

**Watch Out!**

The sample file should be in `.csv` or `.xlsx` format.

#### Actions Using Batches

You can perform the following actions using batch upload:

- [Create Linked Accounts](/razorpay-docs-md/route/batch-upload.md#create-linked-accounts-via-batch-upload)
- [Create Transfers](/razorpay-docs-md/route/batch-upload.md#create-transfers-via-batch-upload)

### Batch Upload Statuses

The following table lists the upload statuses and their description.

### Create Linked Accounts via Batch Upload

You can create multiple linked accounts in bulk by uploading a batch file on the Dashboard.

**Watch Out!**

For Mutual Funds Distributors (MFDs), Linked Accounts with their Asset Management Company (AMC) details are automatically created after they get access to the Route. MFDs do not need to create any Linked Accounts from the Dashboard. Please get in touch with our [support team](https://razorpay.com/support/) for any help on creating Linked Accounts.

Watch this video to see how to create Linked Accounts in bulk using a batch file.

To create Linked Accounts using batch upload:

1. Log in to the Dashboard and click **Route** under **PAYMENT PRODUCTS**.
2. Click **Batch Upload**.
3. Hover on **Upload New Batch** and click **Linked Accounts**. The **Batch Upload** pop-up page appears.
4. Click **download sample file** to download the sample file.
5. Update and save the file with the following details. Refer to the [Linked Accounts Batch Fields](/razorpay-docs-md/route/batch-upload.md#linked-account-batch-fields)

   section for more information.
   - `account_name`
   - `account_email`
   - `dashboard_access`
   - `customer_refunds`
   - `business_name`
   - `business_type`
   - `ifsc_code`
   - `account_number`
   - `beneficiary_name`
6. Upload the updated file to the **Dashboard** in the **Batch Upload** pop-up page.
7. Verify the details and enter the file name in the **BATCH FILE NAME** text box.
8. You can choose to process the file immediately or schedule it for later.
9. Click **Create**.

You can view the status and other details of the upload under the **Batch Upload** section on the Dashboard.

Linked Account Batch Fields

The following table lists the fields required to create linked accounts and their description. [Download](/razorpay-docs-md/route/build/browser/assets/images/sample_input_batch_linked_account.md) the sample input file of the Linked Account creation for reference.

Batch File After Processing

Once a batch file is processed, you can view and download the processed file from the Dashboard. Click the **Batch Id** to view the details and click **Download** to download the file. Information such as the uploaded rows, successfully processed and failed rows are displayed in the file.

![Route processed batch file after processing](https://razorpay.com/docs/payments/route/build/browser/assets/images/route-processed_batch_file.jpg)

The downloaded file has the following additional fields that provide information about the created linked accounts or the reason for failure.

### Create Transfers via Batch Upload

You can create transfers to Linked Accounts in bulk by uploading a batch file with the required details. Watch this video to see how to create transfers to linked accounts in bulk using a batch file.

To create Transfers in bulk:

1. Log in to the Dashboard and click **Route** under **PAYMENT PRODUCTS**.
2. Click **Batch Upload**.
3. Hover on **Upload New Batch** and click **Transfers**. The **Batch Upload** pop-up page appears.
4. Click **download sample file** to download the sample file.
5. Update and save the file with the following details. Refer to the Transfers Batch Fields section for more information.

   - `payment_id`
   - `account_id`
   - `amount`
   - `currency`
   - `transfer_notes`
   - `linked_account_notes`
   - `on_hold`
   - `on_hold_until`

   **Watch Out!**

   You should enter the amount in paise. For example, if you want to transfer ₹500, then you should enter 50000.
6. Upload the updated file to the **Dashboard** in the **Batch Upload** pop-up page.
7. Verify the details and enter the file name in the **BATCH FILE NAME** text box.
8. You can choose to process the file immediately or schedule it for later.
9. Click **Create**.

You have successfully created transfers in bulk.

Transfers Batch Fields

The following table lists the fields required to create transfers and their description. [Download](/razorpay-docs-md/route/build/browser/assets/images/sample_input_batch_payment_transfer.md) the sample input file of Transfers creation for reference.

Batch File After Processing

Once a batch file is processed, you can view and download the processed file from the Dashboard. Click the **Batch Id** to view the details and click **Download** to download the file. Information such as the uploaded rows, successfully processed and failed rows are displayed in the file.

![Route transfers Batch Upload report](https://razorpay.com/docs/payments/route/build/browser/assets/images/route-transfers_Bu_report.jpg)

The downloaded file has the following additional fields that provide information about the created transfers or the reason for failure.

## View all Batches

The Batch Upload section in the Dashboard displays the following fields:

You can also search for the required batch file using the following search options:

- Batch Upload Id: This option allows you to search using the upload ID.
- Batch Type: This option lets you search using batch type. Select the required type from the **Batch Type** list.
- Count: This option allows you to search using the number of rows uploaded.

## Schedule a Batch

You can choose to process the batch upload immediately or schedule it for later.

To schedule a batch:

1. Log in to the Dashboard and click **Route** under **PAYMENT PRODUCTS**.
2. Click **Batch Upload**.
3. Hover on **Upload New Batch** and click the required batch type. The **Batch Upload** pop-up page appears.
4. Click **download sample file** to download the sample file.
5. Update the file with the required details.
6. Upload the updated file to the **Dashboard** in the **Batch Upload** pop-up page.
7. Select **Schedule for Later** and select the date and time you want to start the batch upload.

   **Watch Out!**

   Ensure the scheduled time is at least 1 hour from the current time.
8. Click **Create**.

The batch upload starts at the scheduled time.

## Errors During and After Batch Upload

Errors During Upload

If any error happens in the data rows during the upload step, it will be displayed on the screen. You can also download the report from the Dashboard that contains errors and their reasons. This helps you to fix the errors and upload the file.

Some of the common errors during upload are:

- Same file uploaded multiple times
- Uploaded file type not supported

You can fix the errors by making the required changes in the file and re-upload it in the Dashboard.

Errors After Upload

A processed batch file does not necessarily mean that all linked accounts and transfers were created successfully. Few rows may not get created because of certain issues in the entered data.

Download the Batch Report that contains the following additional fields to help you check if a link was issued for a row or not.

### Related Information [Route FAQs](/razorpay-docs-md/route/faqs.md)
