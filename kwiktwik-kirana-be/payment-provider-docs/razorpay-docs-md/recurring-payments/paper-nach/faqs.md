<!-- Source: https://razorpay.com/docs/payments/recurring-payments/paper-nach/faqs -->

## Registration

1. How can I create physical mandates?

You can generate and submit physical mandates from the [Dashboard](/razorpay-docs-md/recurring-payments/create.md) or [using our APIs](/razorpay-docs-md/api/payments/recurring-payments.md).

2. How does the NACH registration process work?

Following is the registration flow of the NACH:

![](https://razorpay.com/docs/payments/recurring-payments/paper-nach/build/browser/assets/images/nach-registration.jpg)

3. Which account types are supported for Paper NACH registrations?

Following are the account types supported for Paper NACH:

- `savings` (default)
- `current`
- `cc` (Cash Credit)
- `nre` (SB-NRE)
- `nro` (SB-NRO)

4. What formats are supported when uploading the NACH form?

The signed NACH form can only be uploaded as an image. We support the following file formats:

- .JPG
- .JPEG
- .PNG

5. What do I do if I get an error when uploading the NACH form?

If you get an error while uploading the NACH form, you can try to upload the form again. You can retry the upload as many times as you want, until a successful upload.

**Handy Tips**

A few things to keep in mind when uploading the signed NACH form:

- Do not change or write over any of the fields on the form.
- Do not crop the border.
- Review the information, sign and upload the form.

Below is a sample NACH form.

![Nach Form Sample](https://razorpay.com/docs/payments/recurring-payments/paper-nach/build/browser/assets/images/recurring-payments-sample-nach-form.jpg)

6. Are there any additional requirements to set up recurring payments via Paper NACH for a current account?

If you want to set up recurring payments on a current account via Paper NACH, you might be required to add your company seal on the NACH form. Use the blank space available for the 2nd and 3rd signatory to add the seal.

7. For physical mandates, how long does it take for the token status to move from the `initiated` state to the `confirmed` state?

The following table indicates the time required to update the token status from `initiated` state to the `confirmed` state for the physical mandates:

**Handy Tips**

The registration token confirmation can take up to 5 to 7 days in some cases.

8. Which banks support Recurring Payments through Paper NACH?

All banks support Recurring Payments through Paper NACH. You can get the exhaustive list of banks [here](https://www.npci.org.in/what-we-do/nach/live-members/live-banks).

9. How can I get access to the NACH form which the customer has signed?

You can raise a ticket with our support team by mentioning the registered mandate's `token id` or the `payment id` used for registration. Our team will share the corresponding signed copies with you.

10. What should I do if I have not received an update on my customer’s NACH registration for more than 30 days?

If you do not receive an update for more than 30 days, the mandate registration has most likely failed. You can share the payment IDs with Razorpay support to enquire about these cases and we will get the payment status checked and updated.

11. What can I do to ensure the best user experience for physical mandate registrations?

To improve the Emandate registration user experience for your customers:

- Before customers proceed with the authorisation transaction, you can display a message asking your customers to keep their netbanking credentials handy. This will help prevent time-out at the checkout.
- Inform your customers that there might be a ₹1 or ₹2 deduction during the authorisation transaction. This amount will be refunded to your customer in 3-5 bank working days.

12. Can I cancel a physical Mandate?

Yes. You can use the cancel a physical mandate by deleting the token from the [Dashboard](/razorpay-docs-md/recurring-payments/create.md#delete-the-token) or [using APIs](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/tokens.md#24-delete-tokens).

13. What are the errors I get while uploading the NACH file?

The below table lists the errors that may appear while uploading the NACH file, the reason, explanation and next steps:

5. Is there a cooling period for Paper NACH mandates for initiating the first debit after completing the registration process?

Debits can be initiated once the token status changes to `confirmed`. There is no additional waiting or cooling period required.

## Debits Presentments

1. The payment status for debit presentment says `authorized` and I have not received a settlement for this payment yet. Why?

Payments have to be `captured` for the corresponding settlement to take place. You can manually capture the payment from the Dashboard.

Alternatively, to avoid manual dependency, you can enable Auto Capture for all your payments from the Dashboard.

2. How does the debit presentment work with NACH?

Following is the debit presentment flow of the NPCI ENACH:

![](https://razorpay.com/docs/payments/recurring-payments/paper-nach/build/browser/assets/images/debit_presentment_enach.jpg)

3. Is there a limit on the debit amount in physical NACH?

You can set the maximum amount while initiating registrations for your customers. The maximum limit you can set for NACH mandates is ₹1,00,00,000.

If you do not set a limit for the mandate, the maximum limit defaults to ₹1,00,00,000 for NACH.

4. What is the TAT to process the debit after creating the payment?

The following table indicates the time required to update the token status from `created` state to the `authorized` state for the physical mandates:

**Handy Tips**

To ensure same-day debit authorisation, Razorpay must receive the request by 8:59 am on a bank working day.

5. Will my debits get processed on holidays as well?

Customer account debits for Emandates registered with Paper NACH will be done on all days, including weekends and public holidays.

However, settlements for the debit payments captured on weekends and public holidays will only be made on the next working day as per your settlement schedule.
