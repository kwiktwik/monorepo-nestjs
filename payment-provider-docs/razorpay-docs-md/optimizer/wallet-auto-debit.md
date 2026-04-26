<!-- Source: https://razorpay.com/docs/payments/optimizer/wallet-auto-debit -->

Wallet Auto-Debit streamlines the payment process and significantly boosts success rates, delivering an exceptional payment experience to your customers. The customers can complete wallet transactions with unparalleled speed and simplicity.

![select Paytm one click pay final](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-one-click-sufficient-balance.jpg)

**Watch Out!**

Razorpay supports wallet auto-debit only for **Paytm**.

## Prerequisites

1. You need to have an active Razorpay account with Optimizer enabled.
2. You need to have an active Paytm PG account.
3. Write to your Razorpay Relationship Manager to enable Wallet Auto-Debit feature on your Optimizer account.
4. Write to your Paytm Relationship Manager to enable the Paytm wallet auto debit feature and provide the client key and secret.

**Handy Tips**

The Paytm auto-debit feature is supported on Razorpay Standard Checkout.

## Add Paytm as a Payment Provider

1. Log in to your Dashboard.
2. Go to the **PAYMENT PRODUCTS** section and click **Optimizer**.
3. In the top-right section, click **Add Provider**.
4. Select **PayTm** in the list of gateways available and click **Next**.

   ![Add Paytm one click pay](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-one-click-paytm-add.jpg)
5. Select **Server-to-Server** and click **Next**.

   ![Select Paytm server-to-server](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-paytm-select-s2s.jpg)
6. Enter the provider name and description and click **Next**.

   ![Add Paytm provider details](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-paytm-add-provider.jpg)
7. Enter your **INDUSTRY\_TYPE\_ID**, **KEY**, **MID** (merchant ID) and **WEBSITE** details.
8. Enable the **Wallet auto-debit** button, enter your **Client Key and Secret** and click **Submit**.

   ![Add Paytm one click pay final](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-one-click-paytm-add-final.jpg)

## Razorpay Wallet Auto-Debit (Customer Flow)

Below is a complete end-to-end flow about how Razorpay Wallet Auto-Debit works:

1. The customer clicks Pay Now on your website and is redirected to the Razorpay Standard Checkout.

   ![pay now standard checkout screen](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-one-click-paytm-pay-now.jpg)
2. The customer selects **Wallet** and **Paytm**.

   ![select Paytm one click pay final](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-one-click-paytm-wallet.jpg)

   - If the customer is a first-time user, they will be asked to enter the mobile number and the OTP to link their wallet and complete the payment.

     ![select Paytm one click pay final](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-one-click-first-user.jpg)
   - If the customer has sufficient balance in their wallet, they can pay directly with a single click.

     ![select Paytm one click pay final](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-one-click-sufficient-balance.jpg)
   - If the customer does not have sufficient balance in their wallet, they will be redirected to a Paytm page where they can add money to their balance and complete the payment.

     ![select Paytm one click pay final](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-one-click-insufficient-balance.gif)
