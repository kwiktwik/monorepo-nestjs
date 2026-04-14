<!-- Source: https://razorpay.com/docs/payments/payment-button/manage/prefill-amount-fields -->

You can prefill the amount fields present in your Payment Button. This provides a better user experience for your customers.

## Prefill Item Quantity

You can set a particular item quantity for a product.

Example

Let us assume you want to sell `smartphone cases` for ₹99. You create a Payment Button titled `Cool Smartphone Cases` to sell the product. You can ensure that when the customer clicks the Payment Button, the quantity to be purchased appears pre-selected as `1`.

Steps

Watch this video to see how to add Prefilled Item Quantity.

To add prefilled item quantity field:

1. Log in to the Dashboard and create a Payment Button titled **Cool Smartphone Cases**. Ensure you select the `Buy Now` button type.
2. In the **Amount Details** section, create an amount field called `Smartphone Case` using `Item with Quantity` as the field type.
3. Configure the **Customer Details** section as required.
4. **Create** the Payment Button.
5. Here is a sample embed code. Copy the embed code to add the Payment Button.

   Button Embed Code

   copy

   ```xml
<form><script src="https://checkout.razorpay.com/v1/payment-button.js"
data-payment_button_id="pl_GE9RTzFzrOTdSj"></script> </form>
```
6. When you embed the button code on your website, add the following parameter:

   Amount Field Parameter

   copy

   ```javascript
data-prefill.amount.smartphone_case="1"
```

   The parameter structure is explained below:

   **Handy Tips**

   - Ensure that the field-level validations are in place. If you enter a character in the `amount` field, say `100` or `Hundred`, the field will not get populated.
   - If the amount field label consists of two words, add an underscore as a separator of two words. For example, the two words in the **Smartphone Case** field should be separated by an underscore. That is, `smartphone_case`.
   - If the item is out of stock or has less quantity available, though the field will appear prefilled, the customer will not be able to purchase the product.

   The updated embed code looks like this:

   Updated Button Embed Code

   copy

   ```xml
<form><script src="https://checkout.razorpay.com/v1/payment-button.js"
data-payment_button_id="pl_GE9RTzFzrOTdSj" data-prefill.amount.smartphone_case="1">
</script> </form>
```

   This ensures that the `Smartphone Case` item quantity will always appear prefilled as `1`.

   #### [Test the Code](/razorpay-docs-md/payment-button/manage/prefill-amount-fields.md#Test the Code)

   Click the button below to open the Embed Code testing tool and test the code. [Test Embed Code](https://cdn.razorpay.com/static/widget/test-payment-button.html)

   The following screenshot shows the preselected quantity:

   ![Prefill Quantity of an Item](https://razorpay.com/docs/payments/payment-button/manage/build/browser/assets/images/payment-button-prefill-prefilled-quantity.jpg)

## Pre-select Fixed Amount Field

You can add a fixed amount field which gets added during checkout when the user selects a product.

Example

Let us continue with the smartphone case example. Assume you also provide gift wrapping services at a fixed cost of ₹30. You want to ensure that this field appears pre-selected during Checkout.

Steps

Watch this video to see how to add a Fixed Amount Field.

To pre-select Fixed Amount field:

1. Log in to the Dashboard and create a Payment Button titled **Cool Smartphone Cases**. Ensure you select the `Buy Now` button type.
2. In the **Amount Details** section, create an amount field called `Gift Wrap` using `Fixed Amount` as the field type. This should be an **optional** field.
3. Configure the **Customer Details** section as required.
4. **Update** the Payment Button.
5. Here is a sample embed code. Copy the embed code.

   Button Embed Code

   copy

   ```xml
<form><script src="https://checkout.razorpay.com/v1/payment-button.js"
data-payment_button_id="pl_GE9RTzFzrOTdSj">
</script> </form>
```
6. When you embed the button code on your website, add the following parameter:

   Amount Field Parameter

   copy

   ```javascript
data-prefill.amount.gift_wrap="1"
```

   The parameter structure is explained below:

   **Handy Tips**

   - Ensure that the field-level validations are in place. If you enter a character in the `amount` field, say `100` or `Hundred`, the field will not get populated.
   - If the amount field label consists of two words, add an underscore as a separator of two words. For example, the two words in the **Gift Wrap** field should be separated by an underscore. That is, `gift_wrap`.
   - Ensure that the field is marked optional.
   - If the item is out of stock or has less quantity available, though the field will appear prefilled, the customer will not be able to purchase the product.

   The updated embed code looks like this:

   Updated Button Embed Code

   copy

   ```xml
<form><script src="https://checkout.razorpay.com/v1/payment-button.js"
data-payment_button_id="pl_GE9RTzFzrOTdSj" data-prefill.amount.gift_wrap="1">
</script> </form>
```

   This ensures that the `Gift Wrap` amount field will appear pre-selected when customer opens Checkout.

   #### [Test the Code](/razorpay-docs-md/payment-button/manage/prefill-amount-fields.md#Test the Code)

   Click the button below to open the Embed Code testing tool and test the code. [Test Embed Code](https://cdn.razorpay.com/static/widget/test-payment-button.html)

   The following screenshot shows the preselected fixed amount field:

   ![Prefill Fixed Amount Field](https://razorpay.com/docs/payments/payment-button/manage/build/browser/assets/images/payment-button-prefill-prefilled-fixed-amount.jpg)

## Prefill Customer Decides Amount Field

You can add a field with a pre-filled amount value which the customer can also edit.

Example

Suppose you are the director of an NGO that is raising funds for flood relief. Apart from the relief packages such as sanitation kits (worth ₹750) and dry ration kits (worth ₹1000), you are adding a field to collect cash.

You want to prefill the `Cash` field for donors. And, you want to show ₹500 as a suggested donation amount. Donors can donate this amount, ₹500, or change the amount and then pay.

Steps

Watch this video to see how to add a Prefilled amount value which the customer can edit.

1. Log in to the Dashboard and create a Payment Button titled **Contribute to Assam Flood Relief**. Select the `Donations` button type.
2. In the **Donation Amount** section, create an amount field called `Cash`.
3. Configure the **Customer Details** section as required.
4. **Publish** the Payment Button.
5. Here is a sample embed code. Copy the embed code.

   Button Embed Code

   copy

   ```xml
<form><script src="https://checkout.razorpay.com/v1/payment-button.js"
data-payment_button_id="pl_GENk7eNBLg6ukw">
</script> </form>
```
6. When you embed the button code on your website, add the following parameter:

   Amount Field Parameter

   copy

   ```javascript
data-prefill.amount.cash="500"
```

   The parameter structure is explained below:

   **Handy Tips**

   - Ensure that the field-level validations are in place. If you enter a character in the `amount` field, say `100` or `Hundred`, the field will not get populated.
   - If you are using a custom field name for amount, ensure that the field name is entered in lowercase and is separated by an underscore. For example, if the amount field name is `Cash Funds`, enter the suffix as `cash_funds`.
   - Pre-population of the amount field is subject to the Minimum and Maximum Input Price set for the amount field. For example, if the Maximum Input Price has been set as ₹1,000, the Cash field cannot be prefilled with a value higher than ₹500.

   The updated embed code looks like this:

   Updated Button Embed Code

   copy

   ```xml
<form><script src="https://checkout.razorpay.com/v1/payment-button.js"
data-payment_button_id="pl_GENk7eNBLg6ukw" data-prefill.amount.cash="500">
</script> </form>
```

   This ensures that the `Cash` amount field will appear prefilled with an amount of ₹500 when the customer opens Checkout.

   #### [Test the Code](/razorpay-docs-md/payment-button/manage/prefill-amount-fields.md#Test the Code)

   Click the button below to open the Embed Code testing tool and test the code. [Test Embed Code](https://cdn.razorpay.com/static/widget/test-payment-button.html)

   The following screenshot shows the prefilled editable amount field:

   ![Prefill Fixed Amount Field](https://razorpay.com/docs/payments/payment-button/manage/build/browser/assets/images/payment-button-prefill-prefilled-donations-amount.jpg)

### Related Information

- [Payment Button](/razorpay-docs-md/payment-button.md)
- [How Payment Button Works](/razorpay-docs-md/payment-button/how-it-works.md)
- [Payment Button States](/razorpay-docs-md/payment-button/states.md)
- [Quick Pay Button](/razorpay-docs-md/payment-button/quick-pay.md)
- [Buy Now Button](/razorpay-docs-md/payment-button/buy-now.md)
- [Donations Button](/razorpay-docs-md/payment-button/donations.md)
- [Custom Payment Button](/razorpay-docs-md/payment-button/custom.md)
- [Manage Payment Button](/razorpay-docs-md/payment-button/manage.md)
- [Search for a Payment Button](/razorpay-docs-md/payment-button/search.md)
