<!-- Source: https://razorpay.com/docs/payments/recurring-payments/upi/faqs -->

1. What is the maximum amount I can charge per transaction?

The maximum transaction amount allowed is ₹15,000 when using UPI as a recurring payment method. Any auto debit above ₹15,000 undergoes an additional authorisation from the customer.

2. Which banks and apps support UPI Autopay?

Refer to the [NPCI list of banks and apps supported for UPI Autopay](https://www.npci.org.in/product/autopay/all-members).

3. Which are the intent-supported PSP apps?

The below table gives information about the frequently used intent-supported PSP apps on different platforms and checkout integrations.

Standard Checkout Integration

Custom Checkout Integration

S2S Checkout Integration

**Watch Out!**

- You should contact our [Support team](https://razorpay.com/support/#request)

  to enable UPI Intent on standard checkout. Watch this video on how to get it enabled.

  ![Feature Request GIF](https://razorpay.com/docs/payments/recurring-payments/upi/build/browser/assets/images/feature-request.gif)
- UPI Intent is not supported for @okaxis handle.

4. Which are the intent-supported PSP apps for TPV?

The below table gives information about the frequently used intent-supported PSP apps for TPV on different platforms and checkout integrations.

Standard Checkout Integration

Custom Checkout Integration

S2S Checkout Integration

**Watch Out!**

- You should contact our [Support team](https://razorpay.com/support/#request)

  to enable PSP apps other than PhonePe and Paytm on Standard Checkout for UPI TPV. Watch this video on how to get it enabled.

![Feature Request GIF](https://razorpay.com/docs/payments/recurring-payments/upi/build/browser/assets/images/feature-request.gif)

- UPI Intent TPV is not supported for @okaxis handle.

5. How long does mandate registration take?

Mandate registrations occur in real time. Once the customer enters the MPIN, the mandate is authorised and a token is created on the customer. You can then use this token for subsequent debits on the customer's account.

5. Can I charge customer payments in international currencies via a UPI mandate?

No, you cannot charge customer payments in international currencies. UPI mandates only support `INR` payments.

6. For UPI mandates, how long does it take for the token status to move from the `initiated` state to the `confirmed` state?

For UPI mandates, the token status is updated from `initiated` state to the `confirmed` state in real-time.

7. For UPI mandates, how long does it take a subsequent charge to move from the `created` state to the `authorized` state?

For UPI mandates, subsequent charges are initiated **25 hours after the Pre Debit notification** is sent to the customer. Once initiated,

- For amount < ₹15,000: Authorisation is instant as the debit call is made directly to the customer’s bank.
- For amount > ₹15,000: An additional authorisation is requested of the customer. Once received, the amount is debited from the customer's bank.

8. What is pre-debit notification?

Pre-debit notifications are notifications sent to consumers 24 hours prior to the payment. These notices intimate the customer ahead of the actual debit, allowing them the option to pause or cancel the e-mandate.

9. Can I cancel a UPI mandate?

Yes, you can cancel a UPI mandate from the Dashboard.

10. Can I revoke a UPI mandate?

You can revoke a UPI mandate directly from the Dashboard. To do so, cancel the mandate first and then delete it.

11. Once registered, can I pause a UPI mandate?

No, you cannot pause a UPI mandate.

12. Once registered, can I modify a UPI mandate?

No, it is not possible to modify or update a UPI mandate. However, you can cancel the UPI mandate.

13. Once registered, can my customer cancel a UPI mandate?

Yes, your customers can cancel a UPI mandate from their UPI app.

14. Once registered, can my customer pause a UPI mandate?

Yes, your customers can pause a UPI mandate from their UPI app.

15. Once registered, can my customer modify a UPI mandate?

No, it is not possible to modify or update a UPI mandate. However, your customers can pause or cancel the UPI mandate from their UPI app.

16. What are some best practices I can follow when creating subsequent payments for UPI recurring payment?

For UPI, **do not** create subsequent payments on the last day of the cycle. This will cause the payment to fail.

17. What is the supported amount limit on PSP applications?

18. Is QR Code supported for UPI Autopay?

Yes, [QR Code](/razorpay-docs-md/recurring-payments/upi/qr-codes.md) is supported on Standard Checkout to collect Recurring Paymennts. The customers can scan the QR using any PSP app and make the payment.

19. Can I restrict my customers from pausing and cancelling the mandate?

Yes, you can restrict your customers from pausing and cancelling the mandate by enabling OC125 functionality. After enabling, the **Pause** and **Cancel** mandate buttons are not available on PSP apps as shown in the image below.

![Checkout with OC125 Enabled](https://razorpay.com/docs/payments/recurring-payments/upi/build/browser/assets/images/upi_oc125.jpg)

This functionality is supported only for lending businesses. Please contact our [Support team](https://razorpay.com/support/#request) for more information.
