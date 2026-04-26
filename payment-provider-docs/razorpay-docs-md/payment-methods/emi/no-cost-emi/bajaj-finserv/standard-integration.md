<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/no-cost-emi/bajaj-finserv/standard-integration -->

Let your customers avail No Cost EMIs offered by Bajaj Finserv on Razorpay Standard Checkout.

## Integration Flow

If you want to display the No Cost EMI offered by Bajaj Finserv on the Checkout, you must associate the offer with an order. The details of the integration are listed below.

### Step 1: Create No Cost EMI Offers

Raise a request with the [Razorpay Support team](https://razorpay.com/support/#request) to create the relevant No Cost EMIs you want to display on the Checkout. Get the appropriate `offer_id` created for each EMI plan.

### Step 2: Create an Order

Obtain the `offer_id`. Let us say, `offer_ANZoaxsOww2X53`, from our Support team. Create an order for the transaction amount for which the created offer should be applied.

POST

/orders

amount

mandatory

`integer` Amount, in currency subunits, for which the order is created. For example, if the order is to be created for ₹30,000, enter the value 3000000 (in paise).

currency

mandatory

`string` ISO code of the currency associated with the order amount.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

offers

mandatory

`array` Unique identifier of the Offer.
 Pass the `offer_id` obtained from Razorpay Support team.

discount

optional

`boolean` Indicate if a discount is to be applied by Razorpay or not. Possible values are:

- `true`: Discount is applied.
- `false`: Discount is not applied.

CurlJavaPythonGoPHPRubyNode.jsResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 1000000,
  "currency": "INR",
  "discount": true,
  "offers": [
    "offer_ANZoaxsOww2X53"
  ]
}'
```

### Step 3: Trigger the Checkout

The `order_id` obtained in the previous step can be passed to Checkout form as follows:

JavaScript

copy

```javascript
<form action="https://www.example.com/payment/success/" method="POST">
<script
    src="https://checkout.razorpay.com/v1/checkout.js"
    data-key="YOUR_KEY_ID" // Enter the Key ID generated from the Dashboard
    data-amount="3000000" // Amount is in paise
    data-currency="INR"
    data-order_id="order_CjyoZFRpB8r0AH"//Obtain from Step 2 response body
    data-buttontext="Pay with Razorpay"
    data-name="Acme Corp"
    data-description="Zero Interest EMIs from BFL!"
    data-image="https://example.com/your_logo.jpg"
></script>
<input type="hidden" custom="Hidden Element" name="hidden"/>
</form>
```

### Next Steps

Once the customer has successfully made the payment after availing the desired Offer, you can check the status of the payment from the Dashboard.
