<!-- Source: https://razorpay.com/docs/payments/payment-gateway/emi²/faqs -->

## Common

1. What are the issuers that Razorpay supports for each EMI² method?

2. What is the difference between Cardless EMI & Pay Later?

Cardless EMI

Pay Later [Cardless EMI](/razorpay-docs-md/payment-methods/emi/cardless-emi.md) is a digital EMI option that allows your customer to pay in installments without access to a credit or debit card. Usually, customers prefer this method for making high-value payments.

3. Is Instant Refund supported on any EMI² Payment Method?

No, instant refunds are not supported on EMI, Cardless EMI and Pay Later.

4. How can I disable Payment methods?

Raise a request with our [Support team](https://razorpay.com/support/) to disable payment methods.

## Pay Later

1. How can my customer pay using Pay Later?

Pay Later is available as a payment option at Razorpay checkout. To make a payment, customers must be registered with Razorpay's Pay Later partners - LazyPay and PayPal.

2. What are the standard interest rates charged by Pay Later providers?

The standard interest rates charged by the providers for Pay Later are given below:

\* Interest rates are determined on a case-to-case basis. [Contact support](https://razorpay.com/support/#request) for more information.

**Watch Out!**

All interest rates mentioned above are per annum.

## EMI

### Common

1. Can my customers avail Offers for EMI payments at Checkout?

Yes, they can avail offers for EMI payments at checkout. Know more about [creating EMI Offers](/razorpay-docs-md/offers.md).

2. If a customer chooses EMI as the payment method, do I get the full amount upfront?

Yes, you receive the full amount at once and the provider/bank converts it into EMI for the customer.

3. What happens when the customer fails to pay the EMI?

The loss is borne by the provider/bank. You would have already gotten the full amount.

### Debit Card EMI

1. How do banks perform the EMI eligibility check during the transaction flow?

Eligibility is checked using the card number and registered phone number. Therefore, customers should always use the phone number registered with the bank while making a payment.

2. What is the minimum balance required in the customer's account to avail Debit Card EMI?

None. Customers need not have any minimum balance in their accounts while placing the order. However, they need to ensure that their accounts have sufficient funds to pay the EMI due every month.

3. How will the customers know that they are eligible for Debit Card EMI?

Customers can check their eligibility by sending the SMS

`DCEMI last 4 digits of Debit Card number` to `56767`, from their registered mobile number.

4. What is the criteria to avail Debit Card EMI?

To avail [Debit Card EMI](/razorpay-docs-md/payment-methods/emi/debit-card-emi.md), your customers should pass the eligibility criteria set by their banks. The minimum order amount on the Checkout should be ₹5000 (for HDFC and IndusInd debit cards).

5. Can you provide a list of the EMI plans and interest rates of different banks that support Debit card EMI?

The interest rates applied by each bank for Debit Card EMIs is provided below.

- The minimum transaction amount for which EMIs can be availed on debit cards can vary for each bank.
- The maximum transaction amount depends upon the available pre-approved limit for the customer.

For **HDFC Bank (HDFC)**:

For **ICICI Bank (ICIC)**:

6. Can the customers change the EMI plan after placing the order?

No, EMI plans cannot be changed after an order is placed.

7. Do customers need to pay any down-payment to avail Debit Card EMI?

No, the customers need not pay any down-payment amount to avail the Debit Card EMI option.

8. Is there a possibility to foreclose EMIs availed on Debit Cards?

Yes, Debit Card EMIs can be foreclosed after clearing the first three EMIs.

9. Which are the business categories for which Debit Card EMI is not allowed?

The Debit Card EMI payment method is not allowed for certain business categories. Check the relevant Category section below for the list of sub-categories and support status. Debit Card EMI is not allowed for categories with **N** as the status.

**Watch Out!**

Due to our partner bank restrictions, the Debit Card EMI payment methods may not be available to all the Merchant Categories and Subcategories.

Financial Services

Education

Healthcare

Utilities

Government

Logistics

Tours and Travel

Transport

Ecommerce

Food and Beverages

IT and Software

Gaming

Media and Entertainment

Services

Housing and Real Estate

Not-for-Profit

Social

### Credit Card EMI

1. What are the standard credit card interest rates charged by the banks for EMI?

The interest rates charged by various banks for each of the tenures are provided for your reference. The minimum transaction amount for which EMIs are applicable can vary for each bank. The maximum amount is dependent on the card limit set by the issuing bank.

**American Express (AMEX)**:

**Bank of Baroda (BARB)**:

**Citibank (CITI)**:

**Federal Bank (FDRL)**:

**HDFC Bank (HDFC)**:

**HSBC Bank (HSBC)**:

**ICICI Bank (ICIC)**:

**IDFB Bank (IDFB)**:

**IndusInd Bank (INDB)**:

**Kotak Mahindra Bank (KKBK)**:

**RBL Bank (RATN)**:

**State Bank of India (SBIN)**:

**Standard Chartered (SCBL)**:

**Axis Bank (UTIB)**:

**Yes Bank (YESB)**:

2. What are the interest rates charged by other credit cards for EMI?

The interest rates charged by other cards for EMI is given below.

**OneCard**:

### Cardless EMI

1. What are the standard interest rates charged by the banks for cardless EMI?

The standard interest rates charged by various banks for cardless EMI are provided for your reference.

2. What are the standard interest rates charged by Pay Later providers for cardless EMI?

The standard interest rates charged by the providers for Pay Later providers are given below:

\* Interest rates are determined on a case-to-case basis. [Contact support](https://razorpay.com/support/#request) for more information.

**Watch Out!**

All interest rates mentioned above are per annum.

## Eligibility Check

1. How does eligibility check work?

Razorpay has partnered with various Debit Card EMI, Cardless EMI, and Pay Later providers. The providers determine customer eligibility for payment instruments based on their respective pre-defined criteria. Razorpay aggregates the information and presents customers with eligible payment options on checkout.

The customer proceeds with the selected payment option on Razorpay checkout if eligible. If ineligible, alternate options are presented.

2. What is the pre-defined criteria to determine customer eligibility?

The pre-defined criteria are specific factors each provider uses, such as repayment history, digital footprint, and bureau score, to assess a customer's creditworthiness.

3. What parameters are required during the eligibility check process?

The providers determine customer eligibility based on their mobile number and order amount for the requested transaction.

4. If a customer is ineligible for payment, what should they do next?

The customer can view the reason for ineligibility and choose to:

- Use a different mobile number for the chosen payment instrument and try again.
- Opt for a different payment instrument/method.

5. What are the reasons for ineligibility?

You can view the [list of reasons for ineligibility](/razorpay-docs-md/payment-gateway/emi-/eligibility-check/standard.md#reasons-for-ineligibility) and their descriptions.

6. Where can I find the minimum and maximum order amount eligible for a specific payment method/instrument?

You can view the minimum and maximum order amount for the following payment methods. However, ensure you [check the providers](/razorpay-docs-md/payment-gateway/emi-/eligibility-check/standard.md#list-of-payment-methods) on which eligibility check is performed.

- [Debit Card EMI](/razorpay-docs-md/payment-gateway/emi-/faqs.md#5-can-you-provide-a-list-of-the)
- [Cardless EMI](/razorpay-docs-md/payment-gateway/emi-/faqs.md#1-what-are-the-standard-interest-rates-charged)
- [Pay Later](/razorpay-docs-md/payment-gateway/emi-/faqs.md#2-what-are-the-standard-interest-rates-charged)

Please note that not all the providers listed under the above methods are applicable for an eligibility check.
