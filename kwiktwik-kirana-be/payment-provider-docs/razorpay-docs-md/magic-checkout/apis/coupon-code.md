<!-- Source: https://razorpay.com/docs/payments/magic-checkout/apis/coupon-code -->

Use the Coupon Code APIs to send coupon details to Razorpay. Razorpay will create the coupon codes, which you can then apply to transactions.

**Handy Tips**

Use your webhook URL as the API endpoint for the Coupon Code APIs.

## Sample Code

Fetch the list of coupons available using this API.

POST

your-webhook-url

### Request Parameters

order\_id

mandatory

`string` The unique identifier of the order created in the previous step.

email

optional

`string` The customer's email address.

contact

optional

`string` The customer's phone number.

### Response Parameters

coupons

`array` Details of the coupons created.

code

`string` The unique identifier of the coupon.

summary

`string` A summary about the coupon.

description

`string` A brief description of the coupon.

tnc

`array` Terms and conditions about the coupon.

## Apply Coupons API

Apply a coupon on a transaction using this API.

POST

your-webhook-url

### Request Parameters

order\_id

mandatory

`string` The unique identifier of the order created in the previous step.

email

optional

`string` The customer's email address.

contact

optional

`string` The customer's phone number.

cart\_value

mandatory

`integer` The customer's cart value.

shipping\_charge

optional

`integer` The shipping charge levied on the customer.

cod\_charge

optional

`integer` The cash-on-delivery charge levied on the customer.

coupon\_code

mandatory

`string` The coupon code to be applied on the transaction.

### Response Parameters

order\_id

`string` The unique identifier of the order created in the previous step.

status

`boolean` Indicates whether the coupon got applied successfully to the transaction. Possible values:

- `true`: The coupon was successfully applied.
- `false`: The coupon was not successfully applied.

methods

`array` The supported payment methods.

new\_cart\_value

`integer` The net cart value (original value minus coupon discount).

discount

`integer` The discount amount.

new\_shipping\_charge

`integer` The net shipping charge.

items

`object` Details of the items.

cost

`integer` The item cost.

item

`string` The unique identifier of the item.

cod\_charge

`integer` The cash-on-delivery charge levied.

failure\_reason

`string` The reason why the coupon did not get applied successfully. For example, `Coupon Code has expired`.
