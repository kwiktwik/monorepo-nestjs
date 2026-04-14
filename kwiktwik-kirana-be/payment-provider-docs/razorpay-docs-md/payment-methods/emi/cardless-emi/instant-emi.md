<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/instant-emi -->

Instant EMI is an innovative EMI² solution and checkout option designed by Razorpay to cater to customers without access to credit or debit cards. Boost your average order value and conversion rates by providing credit options at checkout, especially targeting customers without access to EMI options on their credit/debit cards.

This feature enables customers to avail EMIs on purchases in under 10 minutes through a fully automated, digital process with multiple lending partners. Instant EMI fully complies with the Reserve Bank of India's Digital Lending Guidelines, ensuring a secure and transparent transaction experience for the customer.

**Handy Tips**

To use Instant EMI for checkout, customers must place an order with a minimum value of ₹1,000 and a maximum value of ₹50,000.

## Advantages

- **On-the-fly Registration:** Customers can easily sign up for Instant EMI directly from Razorpay Checkout by providing their PAN, date of birth, and Aadhaar number for KYC verification. Depending on the lender's preferences, additional steps may be required to set up repayments via EMandate and E-Sign of loan/credit sanction agreements.
- **Zero Integration Effort:** Instant EMI seamlessly integrates with Standard Checkout, eliminating the need for additional integrations.
- **One Instrument, One Journey, Multiple Options:** Instant EMI integrates with multiple lenders at the backend to avoid the need for you to integrate with various lenders directly. This simplifies the lending process for customers during checkout.
- **Transparent Pricing:** Instant EMI ensures transparency by clearly displaying all relevant details, including interest rates, processing fees, down payments, and other customer penalties.

## Payment Flow for Standard Checkout

Customers select the products on your website or app and proceed to Checkout. On the Checkout page, the customers:

1. Enter their **Phone Number** and click **Proceed**.
2. Select **EMI** as the payment method and click **Continue**.

   ![Payment methods](https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/build/browser/assets/images/emi-continue.jpg)
3. Select **Instant EMI** and click **Continue**.

   ![Instant cardless emi](https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/build/browser/assets/images/instant-emi-continue.jpg)
4. On the **Instant EMI** page, click **Get started**. An OTP is sent to their registered mobile number to authenticate the customer account. They enter the OTP and click **Submit OTP**.

   ![Instant EMI Submit OTP](https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/build/browser/assets/images/instant-emi-submit-otp2.jpg)
5. To complete the KYC verification, they enter their PAN details and click **Submit PAN**. Verify PAN and personal information and click **Explore EMI Offers**.

   ![Instant EMI PAN and DOB details](https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/build/browser/assets/images/instant-emi-enter-otp.jpg)
6. The EMI options are displayed to the customers. They can select the tenure and click **Continue**. Depending on the customer's status, additional steps such as KYC, E-Mandate, and E-Sign of loan agreements may be necessary.

   ![Flash select EMI plan](https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/build/browser/assets/images/instant-emi-offers1.jpg)
7. Once the setup is complete, customers authorise the loan/credit drawdown via OTP confirmation. They can also view the Key Fact Statement for their reference.

You receive settlements for the entire transaction amount as per your [settlement cycle](/razorpay-docs-md/settlements.md#settlement-cycle). Customers repay the total order amount and any applicable interest as EMIs to you.

Know more about the various [schemes](/razorpay-docs-md/payment-methods/emi/cardless-emi/instant-emi/faqs.md#4-what-are-the-different-schemes-supported-under) supported under Instant EMI. For more information on No cost EMI schemes, please contact [instantemi@razorpay.com](mailto:instantemi@razorpay.com).
