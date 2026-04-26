<!-- Source: https://razorpay.com/docs/payments/settlements/instant -->

You can use the **Instant Settlement** feature in Razorpay to settle your available balance to your bank account instantly, 24x7, for a small fee.

- Settle your available balance to your bank account in full, or choose to settle a portion of it. Note that there is a **maximum daily withdrawable limit**.
- The **maximum daily withdrawable limit** is a limit set for every Razorpay merchant for instant settlements that resets automatically at the beginning of each business day.

- By default, the settlement cycle is **T+2 days for domestic payments** and for **international payments it is as per applicable law(s)**. **T** refers to the captured payment date. With Instant Settlements, you receive funds on a T+0 basis.
- You can use [Instant Settlements](/razorpay-docs-md/settlements/instant.md#initiate-instant-settlements)

  to settle amounts < ₹5 Cr and [Smart Settlements](/razorpay-docs-md/settlements/instant.md#initiate-smart-settlements)

  to settle amounts > ₹5 Cr and < ₹50 Cr.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

## How it Works

1. Amounts up to ₹5 Lakhs are settled instantly through Instant Settlements. Instant Settlements are routed through the IMPS channel.
2. Smart Settlements option also is enabled when the entered amount is between ₹5 Lakhs to ₹5 Crores. You can choose between Instant or Smart Settlements here.
   1. With Smart Settlements, the settlement amount will reflect as a single credit in your bank statement since it uses the RTGS channel.
   2. With Instant Settlement, the amount will show as multiple credits in your bank statement as IMPS channel has an upper limit of ₹5 Lakhs per transaction.
3. Amounts between ₹5 Crores to ₹50 Crores are settled only through Smart Settlements.

## Instant Vs Smart Settlements

Instant Settlement

Smart Settlements

Instant Settlement Vs Smart Settlements

Benefits of Instant Settlement are:

- Easy and instant access to your money.
- Increased cash flows enabling better payment cycles.
- Better management of inventory and stock.

## Initiate Instant Settlements

Settle amounts **up to ₹5 Crores** through **Instant Settlement** feature via Dashboard and API:

On the Dashboard

Using APIs

Create Instant Settlements from the Dashboard.

1. Log in to the Dashboard.
2. Navigate to **Settlements**.
3. Click **Settle Now** to go to the **Instant Settlements** window.
4. Your current balance, maximum daily withdrawal limit and the current withdrawable amount are displayed. Enter the amount you want to settle to your bank account.

   ![Instant Settlement](https://razorpay.com/docs/payments/settlements/build/browser/assets/images/IS1.jpg)
5. Click **Next**. A pop-up showing **Instant Settlement** opens.
   The fees + tax for the Instant Settlement and the net amount that will be credited to your account will be displayed in the pop up.
6. Click **Settle Now** to settle instantly.

## Initiate Smart Settlements

Use the **Smart Settlements** feature to settle amounts **between ₹5 Lakhs to ₹50 Crores** in a single shot within a time span of 1 hour.

1. Log in to the Dashboard.
2. Navigate to **Settlements**.
3. Click **Settle Now** to go to the **Instant Settlements** window.
4. Your current balance, maximum daily withdrawal limit and the current withdrawable amount are displayed. Enter the amount you want to settle to your bank account.
5. Click **Next**. A pop-up showing Instant Settlement and Smart Settlements opens.
   The pop-up displays the total fees plus tax for the Instant Settlement, along with the exact net amount that will be credited to your account.
6. For amounts more than ₹5 Lakhs, the recommended option is Smart Settlements.

   ![Smart Settlements](https://razorpay.com/docs/payments/settlements/build/browser/assets/images/SS1.jpg)
7. Click **Settle Now** after selecting **Smart Settlements**.

The Smart Settlements request is created. The requested amount will be settled to your bank account within 1 hour.

**Watch Out!**

- Smart Settlements can be used via Dashboard only.
- For amounts more than ₹5 Crores, only the Smart Settlements option is enabled in the pop-up.

You can check the Dashboard for latest updates on the limits and availability of instant settlements.
