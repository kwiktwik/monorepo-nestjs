<!-- Source: https://razorpay.com/docs/payments/settlements/dashboard -->

## View Settlements Using Dashboard

You can view details of settlements made to you from the Dashboard.

- View a detailed break-down of the amount settled to you from the Dashboard.
- View details, such as the total settlement amount (credit + debit amount), applicable service fees, service tax, adjustments, and so on.

Watch this video to see how to view settlements from the Dashboard.

To view settlement details:

1. Log in to the Dashboard.
2. Navigate to **Settlements**.
3. Click on the **details** of the settlement ID that you wish to refer to.

### View Channel-Wise Settlements

Benefits of Channel-Wise Settlements

- **Zero cross-channel failures**: POS settlements will not fail due to online refunds.
- **Clear fund visibility**: Know exactly how much you have in each channel.

If you are an omni-channel business (Online (Domestic transactions + International Cards)) or cross-border business (Alternate Payment Method (International)), your settlements are processed separately for each channel type. This provides complete fund isolation and eliminates cross-channel settlement failures.

### Understand Segregated Settlements

With balance segregation, settlements are organised by channel type:

![razorpay settlements details](https://razorpay.com/docs/payments/settlements/build/browser/assets/images/account-settings-settlements-details-segg-bal.jpg)

Each channel type has its own settlement schedule and settlement history.

#### View Settlements by Channel

To view channel-wise settlements:

1. Log in to the Dashboard.
2. Navigate to **Settlements**.
3. Use the **Balance Type** filter to select the channel you want to view:

   - **Online (Domestic transactions + International Cards)**
   - **In-Person**
   - **Alternate Payment Method (International)**

The settlements list will display only settlements for the selected channel.

#### Settlement Cards on Home Page

On the Dashboard home page, you will see separate settlement cards for each active balance:

- Each card shows the current balance, last settlement amount and next settlement date.
- Click on any card to view detailed settlement history for that channel.

**Handy Tips**

With segregated balances, you can now enable Instant Settlements for your PG Online balance even if you have POS or Cross-Border enabled. Previously, Instant setting were restricted for cross-border and omni-channel businesses.

### View Settlements Using API

You can view settlement details using the [Settlements API](/razorpay-docs-md/api/settlements.md).

### Settlements Break-Up Description

The following screenshot displays the settlement break-up:

![Settlement break-up description image](https://razorpay.com/docs/payments/settlements/build/browser/assets/images/settlements-2.jpg)

A settlement has the following components:

Payment

The total payment amount that is being settled before deductions.

Adjustment

Adjustments to transactions, if any.

Tax

Tax deducted on the payment.

Fee

Fees deducted by Razorpay for the transactions.

Transfer

Transfers made if any, Transfers are payouts made to your [linked accounts](/razorpay-docs-md/route/linked-account.md).

Linked accounts are accounts created for third-party sellers by you after onboarding them onto the Razorpay platform.

Refunds

Refunds made if any, are refunds you have issued to your customer.

Example

In this example, the amount settled to your account = Payment - Adjustment - Tax - Fee - Transfer + Refunds

Example: Gross Settelements and Deductions Calculations

Following is an example of gross settlements and deductions calculations of your settlement:

![settlement components detail view](https://razorpay.com/docs/payments/settlements/build/browser/assets/images/settlement-components-view.jpg)

The gross settlements and deductions calculations only apply to merchants on the prepaid model.

## View Settlement Timeline on Dashboard

You can view the settlement timeline to check when the settlement for a particular payment will be credited.

To view the settlement timeline:

1. Log in to the Dashboard.
2. Navigate to **Settlements**.
3. Click on the **details** of the settlement id for which you want to view the timeline.
4. You will be able to see the settlement timeline for that particular settlement id.

![Razorpay Dashboard - View settlement timeline](https://razorpay.com/docs/payments/settlements/build/browser/assets/images/settlements-details-timeline.jpg)

## Enable Settlements Placed On Hold

Your settlement can be placed on hold if we detect some risk with your payments or with your Razorpay account. You are notified about this on your Dashboard.

Contact the [support team](https://razorpay.com/support) to enable settlements that are placed on hold.

![Settlements placed on hold](https://razorpay.com/docs/payments/settlements/build/browser/assets/images/settlements-risk-soh-notice.jpg)

To enable settlements when they are put on hold:

1. Log in to the Dashboard.
2. Navigate to **Home**.
3. Click **Resolve** on the notification as shown above..

## Reports

Detailed insights can be gained using reports and real-time data on the Dashboard. These reports can then be used for accounting and reconciliation purposes. Know more about [reports.](/razorpay-docs-md/dashboard/reports.md)

### Channel-Wise Settlement Reports

For businesses with segregated balances, settlement reports include:

- **Channel Type**: Identifies whether the transaction was from Online (Domestic transactions + International Cards), In-person and Alternate Payment Method (International).
- **Balance Account id**: Unique identifier for the specific balance account.

You can filter reports by channel type to reconcile settlements for each balance separately.

### Related Information

- [About Settlements](/razorpay-docs-md/settlements.md)
- [Settlements API](/razorpay-docs-md/settlements/apis.md)
- [Settlement FAQs](/razorpay-docs-md/settlements/faqs.md)
