<!-- Source: https://razorpay.com/docs/payments/route/view-reports -->

You can export reports related to all fund movements between your account and your Linked Accounts using the Dashboard and APIs.

## Settlement Reports

The settlement recon API generates a detailed report of all the settlements made towards your account. You can use this report to verify transactions and reconcile payments. These reports can be exported for each Linked Account. You can also generate a consolidated report containing transactions for all the Linked Accounts.

Know more about [generating settlement reports using APIs.](/razorpay-docs-md/api/settlements.md#settlement-recon)

## Transfers and Reversals Reports

You can fetch reports of all transfer and reversal operations that occurred on your account.

#### Transfers Report

Watch this video to see how to generate the Transfers report.

#### Reversals Report

Watch this video to see how to generate the Reversals report.

To view the transfers report:

1. Log in to the Dashboard and click **Reports**.
2. Select **Transfers** from the **Select Report Type** drop-down list.
3. Select the relevant **Period** from the **Select Period** drop-down list. The following options are available:
   - **Today**
   - **Yesterday**
   - **Last 7 Days**
   - **Last Month**
   - **Daily** - Select a date.
   - **Monthly** - Select a month.
   - **Custom** - Select the start and end date. You can also select a time.
4. Select the file format from the **Select Format** drop-down list. You can choose CSV, XLSX or XLS formats.
5. Click **Generate Report** or get it emailed to your registered email address by selecting the **Email Report To** check box.

Following is a report sample:

![Sample Transfer Report](https://razorpay.com/docs/payments/route/build/browser/assets/images/route_transfers.jpg)

To view the reversals report:

1. Log in to the Dashboard and click **Reports** under **PAYMENT PRODUCTS**.
2. Select **Reversals** from the **Select Report Type** drop-down list.
3. Select the relevant **Period** from the **Select Period** drop-down list. The following options are available:
   - **Today**
   - **Yesterday**
   - **Last 7 Days**
   - **Last Month**
   - **Daily** - Select a date.
   - **Monthly** - Select a month.
   - **Custom** - Select a start and end date. You can also select a time.
4. Select the file format from **Select Format** drop-down list. You can choose CSV, XLSX or XLS formats.
5. Click **Generate Report** or get it emailed to your registered email address by selecting the **Email Report To** check box.

Following is a report sample:

![Sample Reversal Report](https://razorpay.com/docs/payments/route/build/browser/assets/images/route_reversals.jpg)

### Related Information

- [Route](/razorpay-docs-md/route.md)
- [Linked Accounts](/razorpay-docs-md/route/linked-account.md)
- [Transfer Funds to Linked Accounts](/razorpay-docs-md/route/transfer-funds-to-linked-accounts.md)
- [Initiate Refund](/razorpay-docs-md/route/linked-account/initiate-refund.md)
