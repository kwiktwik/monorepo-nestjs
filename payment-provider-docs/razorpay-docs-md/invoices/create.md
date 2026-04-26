<!-- Source: https://razorpay.com/docs/payments/invoices/create -->

An Invoice is a digital document that summarises the details of an order or a transaction and allows customers to initiate payments. A typical invoice contains sale transaction information such as the name of the ordered products or services, quantities, price breakup, receipt number, customer information and so on.

### GST and Non-GST Invoices

You can generate both GST-compliant and non-GST invoices from the Dashboard.

**Handy Tips**

If GSTIN is not provided before creating an invoice, the option to display **Tax Rate** on the invoice as per the **HSN/SAC code** of each item is not available. However, you can create GST-compliant invoices at any time by clicking the **GST Details** button on the main menu.

![Add GSTIN](https://razorpay.com/docs/payments/invoices/build/browser/assets/images/invoices-gstin-add.gif)

### International Currency Support

You can create non-GST invoices in any of the supported international currencies from the Dashboard. You cannot add tax rates for invoices created using international currencies.

If the invoice is created using any of the supported international currencies, it is recommended to create the **Items** in the corresponding currency.

#### Change Currency

While creating an invoice, click **Change Currency** to select from the supported international currencies. On selecting the required currency, the rate of all the line items in the current invoice will be reset to 0.

Know more about [List of supported international currencies.](/razorpay-docs-md/international-payments.md#supported-currencies/)

## Create an Invoice From Dashboard

**Configure Invoices**

If you are using Razorpay Invoices for the first time, you need to set the Invoice Label as Step 1 and provide GSTIN number as Step 2 (for GST-compliant invoices) before you get started with creating your first invoice. You can create Non-GST compliant invoices if you do not provide GSTIN number.

While creating an invoice, you can change the Invoice Label or create GST Enabled Invoices on the **New Invoice** page.

Watch this video to know how to create an invoice.

To create an invoice:

1. Log in to the Dashboard.
2. Click **Invoices** → **+Create Invoice**.
3. A new invoice draft is displayed with your company name and logo.
4. Enter a unique **Invoice #**. Provide a brief description or summary of the invoice.
5. Under the **BILLING TO** field, select a customer by searching from the list of existing customers. You can also [create a new customer while creating an invoice](/razorpay-docs-md/invoices/create.md#create-a-new-customer-while-creating-invoice)
6. Enter the **ISSUE DATE** of the invoice. By default, it takes today's date. Use the calendar icon if you want to select a different date as Issue Date.
7. Click the calendar icon to select the **EXPIRY DATE** of the invoice.
   The Expiry Date is the date after which the customer cannot pay for the invoice. You can keep this field blank, in such a case, there will not be any Expiry Date for the invoice. You cannot select an Expiry Date in past.
8. Under **BILLING ADDRESS**, the Billing Address as specified for the selected customer is displayed. You can change or remove this address and add a new address.
9. Under **SHIPPING ADDRESS**, click **Add Shipping Address**. The Shipping Address that was added while creating the customer is displayed. You can select the existing Shipping Address or click **Add new Address** to add a new Shipping Address. The newly added address is added to the list of saved Shipping Addresses for the customer.
10. Enter the **PLACE OF SUPPLY**. The Place of Supply is auto-populated based on the Shipping Address.
    You can also select a different State or Union Territory from the drop-down list.
    This field is displayed for GST-compliant invoices. This is a mandatory field as this determines the GST to be levied on the items.

    **Watch Out!**

    If the **PLACE OF SUPPLY**/**SHIPPING ADDRESS** is of a different state from the **BILLING ADDRESS**, the tax is computed as **IGST**, or it is divided into **CGST** and **SGST**.
11. Under **DESCRIPTION**, select an item, add the rate/item and the quantity. Click **Add Line Item** to add multiple items to the invoice. You can also [create a new item while creating an invoice](/razorpay-docs-md/invoices/create.md#create-a-new-item-while-creating-invoice)
12. In the **Add Customer Notes (Optional)** field, you can enter additional details, if any. You can add a maximum of 2048 characters in this field.
13. In the **Add Terms and Conditions (Optional)** field, you can add terms, if any. You can add a maximum of 2048 characters in this field.
14. Select **Enable Partial Payments** to accept multiple payments for the invoice.
15. Click **Save Invoice** to save the invoice as `draft`. You can also click **Finalize and Issue** to save the invoice and `issue` it to the selected customer.

![Create invoice from Dashboard](https://razorpay.com/docs/payments/invoices/build/browser/assets/images/inv_cus_5.jpg)

Click **All Invoices** on the top ribbon to view the newly created invoice in the list of all the invoices. Know more about [invoice states](/razorpay-docs-md/invoices/states.md).

**Handy Tip**

The GST details will be visible only if the **PLACE OF SUPPLY** is added.

### Create a New Customer While Creating Invoice

You can also create a customer while creating an invoice. Click **+Create New Customer** which opens up a pop-up page.

1. Specify details of the customer, such as **Company/Individual Name**, **Email**,
   **Contact No.** and **GSTIN**.
2. Select the **Billing Address** check box to specify the Billing Address.
3. Next, specify the Shipping Address. If the Shipping Address is the same as Billing Address, select the **Same as Billing Address** check box.
4. Click **Create Customer**.

The details of the newly created customer are auto-populated on the invoice draft. You can also click **Edit Customer** to make changes to the customer details. This customer will now be available to you for creating more invoices for this customer in future. This customer name is also displayed under the **Customers** menu.

**Read More**: Know more about [customers](/razorpay-docs-md/customers.md).

![](https://razorpay.com/docs/payments/invoices/build/browser/assets/images/invoices-inv_gst_1.jpg)

### Create a New Item While Creating Invoice

You can also create a new item while creating an invoice. Click **+Create new Item** on the draft invoice which opens up a pop-up page. Specify details of the item, such as **Name**, **Rate per unit** and **Description**.

For GST-compliant invoices, specify additional details:

1. Select the applicable **Tax Rate** for the item from the drop-down list. You cannot add tax rates for items created using international currencies.
2. **Add Cess** to the order amount.
3. Select **Tax Inclusive** if the item rate per unit includes the tax amount. Select **Tax Exclusive** if the taxes are in addition to the item rate per unit.
4. Enter the 6-8 characters **HSN** or 2-6 characters **SAC** code of the item.
5. Click **Add Item**.

![](https://razorpay.com/docs/payments/invoices/build/browser/assets/images/invoices-inv_gst_4.jpg)

**Watch Out!**

When an item's attributes are modified while creating an invoice, the modified item cannot be reused. The item will then be referred as a **Line item**. In other words, a **Line Item** is created when an **Item** is used as a template, in order to customise its attributes.

## Create an Invoice Using API

You can create an invoice for the items ordered on your website or app by a customer using [this](/razorpay-docs-md/api/payments/invoices.md#create-an-invoice/)

API.
However, you can create only non-GST invoices using this API.

## What Next

If you have saved the invoice as `draft`, you should next [issue it](/razorpay-docs-md/invoices/issue.md) to the selected customer to receive payments. You can also choose to do any one of the following actions:

- [Update invoice](/razorpay-docs-md/invoices/update.md)
- [Duplicate invoice](/razorpay-docs-md/invoices/duplicate.md)
- [Delete invoice](/razorpay-docs-md/invoices/delete.md)

### Related information

- [Invoices](/razorpay-docs-md/invoices.md)
- [Invoice States](/razorpay-docs-md/invoices/states.md)
- [How Invoices Work](/razorpay-docs-md/invoices/how-it-works.md)
- [Download or Print an Invoice](/razorpay-docs-md/invoices/download-print.md)
- [Update an Invoice](/razorpay-docs-md/invoices/update.md)
- [Issue an Invoice](/razorpay-docs-md/invoices/issue.md)
- [Search an Invoice](/razorpay-docs-md/invoices/search.md)
- [Duplicate an Invoice](/razorpay-docs-md/invoices/duplicate.md)
- [Cancel an Invoice](/razorpay-docs-md/invoices/cancel.md)
- [Delete an Invoice](/razorpay-docs-md/invoices/delete.md)
