<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/standard-integration -->

After creating [No Cost EMI Offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/create.md) from the Dashboard, you must integrate them with the Razorpay Standard Checkout so your customers can avail of them while making payments.

**Integrate Offers with Orders API**

Using our JS, SDK files, or other Ecommerce plugins, you **should** integrate offers with the Orders API.

## Exception

You need **not** integrate offers with Orders API if you use any of the following Razorpay products or plugins to accept payments:

- Plugins: Razorpay Magento, Shopify, or WooCommerce.
- Products: Payment Links, Payment Buttons, Payment Pages and Invoices.

This is because Razorpay automatically creates orders for these products or plugins when customers initiate payment at the Checkout.

## Validation Criteria

Only those No Cost EMI offers that pass the following validations are displayed at the Checkout:

## Display No Cost EMI Offers at Checkout

There are two ways in which you can display No Cost EMI offers at the Razorpay Checkout:

- [Display No Cost EMI Offers by Default](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/standard-integration.md#method-1-display-no-cost-emi-offers-by-default)
- [Display Limited No Cost EMI Offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/standard-integration.md#method-2-display-limited-no-cost-emi-offers)

### Method 1: Display No Cost EMI Offers by Default

This is the easiest way to display No Cost EMI offers at the Checkout. While [creating the No Cost EMI offer](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/create.md) from the Dashboard, enable the **Show Offer on Checkout** option.

![Enable the Show Offer on Checkout option](https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/build/browser/assets/images/offers-no-cost-emi-offer-validity.jpg)

### Method 2: Display Limited No Cost EMI offers

To display a specific No Cost EMI offer at the Checkout, you should associate the offer with an order. You can pass the `offers` array as a request attribute in the Create Orders API.

Some use cases:

- If you have multiple product lines running on the same account and have certain business logic for displaying No Cost EMI offers.
- The discount has already been applied, and you would like to restrict the payment method to avail the offer.

To display offers:

1. [Create an Offer](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/standard-integration.md#step-1-create-an-offer-from-the-dashboard)

   .
2. [Pass offer\_id in Orders API](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/standard-integration.md#step-2-pass-offer-id-in-orders-api)

   .
3. [Pass order\_id and Trigger Checkout](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/standard-integration.md#step-3-pass-order-id-and-trigger-the)

   .

### Step 1: Create an Offer from the Dashboard

You can [create No Cost EMI offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/create.md#create-offers) from the Dashboard.

Let us say you have created a No Cost EMI offer `offer_ANZoaxsOww2X53`, such that a discount of ₹200 is applicable on all transactions done through AXIS netbanking only.

### Step 2: Pass offer\_id in Orders API

Create an order using the Orders API and pass the `offer_id` as a request parameter.

#### Sample Code

CurlJavaPythonGoPHPRubyNode.jsResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 1000000,
  "currency": "INR",
  "offers": [
    "offer_ANZoaxsOww2X53"
  ]
}'
```

#### Request Parameters

amount

mandatory

`integer` Enter the amount for which the order is to be created in currency subunits. For example, for an amount of ₹10000, enter `1000000`.

currency

mandatory

`string` ISO code of the currency associated with the order amount. Here, it is `INR`.

offers

mandatory

`array` Unique identifier of the offer. Pass the `offer_id` obtained from the response of the previous step.

### Step 3: Pass Order\_id and Trigger the Checkout

The `order_id` obtained in the previous step can be passed to the Checkout form as follows:

Checkout

copy

```javascript
<button id="rzp-button1">Pay</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var options = {
    "key": "[YOUR_KEY_ID]",
    "amount": "1000000",
    "currency": "INR",
    "order_id":"order_FIL1vBOsWFllnO",
    "name": "Acme Corp",
    "description": "Test Transaction",
    "image": "https://cdn.razorpay.com/logos/F9Yhfb7ZXjXmIQ_medium.jpg",
    "handler": function (response){
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature)
    },
    "prefill": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9999988999"
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
};
var rzp1 = new Razorpay(options);
document.getElementById('rzp-button1').onclick = function(e){
    rzp1.open();
    e.preventDefault();
}
</script>
```

Know more about [Standard Checkout](/razorpay-docs-md/payment-gateway/web-integration/standard.md).

## Next Steps

After the customer has availed the offers and made the payment at the Checkout, you can track the status of the payments:

- From the Dashboard.
- By [configuring webhooks](/docs/webhooks/)  .
- By polling our [payment APIs](/razorpay-docs-md/api/payments.md)  .

### Related Information

- [About No Cost EMI Offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi.md)
- [Create No Cost EMI Offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/create.md)
- [Tutorial - How to Create No Cost EMI Offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/tutorial.md)
- [No Cost EMI FAQs](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/low-cost-emi/faqs.md)
- [Disable Offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/no-cost-emi/create.md#disabling-no-cost-emi-offers)
