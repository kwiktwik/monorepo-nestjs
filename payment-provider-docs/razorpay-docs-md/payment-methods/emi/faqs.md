<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/faqs -->

## Common

1. If a customer chooses EMI as the payment method, do I get the full amount upfront?

Yes, you receive the full amount at once and the provider/bank converts it into EMI for the customer.

2. What happens when the customer fails to pay the EMI?

The loss is borne by the provider/bank. You receive the full payment upfront.

3. Can my customers avail Offers for EMI payments at Checkout?

Yes, they can avail offer on debit and credit card EMIs. Know more about [creating EMI Offers](/razorpay-docs-md/offers.md).

## Debit Card EMI

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

## Credit Card EMI

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

## Cardless EMI

1. What are the standard interest rates charged by the banks for cardless EMI?

The standard interest rates charged by various banks for cardless EMI are provided for your reference.

2. What are the standard interest rates charged by Pay Later providers for cardless EMI?

The standard interest rates charged by the providers for Pay Later providers are given below:

\* Interest rates are determined on a case-to-case basis. [Contact support](https://razorpay.com/support/#request) for more information.

**Watch Out!**

All interest rates mentioned above are per annum.

## No Cost EMI

1. Who bears the cost for the discount given in No Cost EMI?

You, as a merchant, would bear the cost of No Cost EMI. It will be given as an upfront discount on the product cost to the end consumer. The discount percentage will vary by the bank and period of EMI.

2. Which payment methods can be used for No Cost EMI?

No Cost EMI is available on all credit card and debit card EMI banks.

3. Will the customers' banks continue to charge them interest?

Yes, the customers' banks will continue to charge them interest. However, this interest charge has been provided to the customer as an upfront discount at the time of purchase, effectively giving them the benefit of a No Cost EMI.

4. Can I enable No Cost EMIs at the Checkout?

Yes. Razorpay enables you to display No Cost EMIs at the Checkout. Know more about [No Cost EMIs](/razorpay-docs-md/offers/no-cost-emi.md).

5. How can I know about the percentage discount of the No Cost EMI that I bear?

**Handy Tips**

The banks charge GST to end consumers on the interest paid over and above the following amount.

Calculations on the cost incurred by the merchant at all standard plan and tenures are listed below:

6. How does the No Cost EMI settlement work?

The order amount minus the entire interest subvented by you as a discount is settled in your bank account as per your [settlement cycle](/razorpay-docs-md/settlements.md#settlement-cycle).

**Watch Out!**

However, Razorpay pricing is not included in this settlement, it will be applied in addition to the above amount.

7. Can I create No Cost EMI offers on Cardless EMI?

No, we do not support No Cost EMI offers on Cardless EMI.

## Low Cost EMI

1. Why should I run Low Cost EMI Offers?

Running Low Cost EMI Offers helps you attract a wider customer base by reducing the upfront cost barrier. This leads to increased sales and higher average order values.

Additionally, offering discount on interest for longer tenures sets you apart in a competitive market and opens opportunities for upselling, contributing to overall business growth and financial stability.

2. Who bears the cost for the discount given in Low Cost EMI?

As a business, you would bear the partial cost of Low Cost EMI, which appears as an upfront discount on the product cost to the end consumer.

You can decide the cost to subvent for each tenure and the customer bears the remaining cost. The interest percentage will vary by the bank and the EMI tenure. Know more about the [EMI Calculation](/razorpay-docs-md/offers/low-cost-emi.md#calculation-of-emi).

3. Which payment methods can be used for Low Cost EMI?

Low Cost EMI is available on all credit and debit card EMIs.

4. Will the customers' banks continue to charge them interest?

Yes, the customers' banks will continue to charge them interest. However, partial interest subvented by you appears as an upfront discount to the customers at the time of purchase.

5. Can I enable Low Cost EMIs at the Checkout?

Yes. Razorpay enables you to display Low Cost EMIs at the Checkout. Know more about [Low Cost EMIs](/razorpay-docs-md/offers/low-cost-emi.md).

6. How can I know about the percentage discount of the Low Cost EMI that I bear?

You can decide how much percentage of the total interest you want to subvent during offer creation. This appears as an upfront discount on the product cost and the customer bears the remaining cost.

7. How does the Low Cost EMI settlement work?

The order amount minus the discount subvented by you is settled in your bank account as per your [settlement cycle](/razorpay-docs-md/settlements.md#settlement-cycle).

**Watch Out!**

Razorpay pricing is not included in this settlement, it will be applied in addition to the above amount.

8. Can I create Low Cost EMI offers on Cardless EMI?

No, we do not support Low Cost EMI offers on Cardless EMI.
