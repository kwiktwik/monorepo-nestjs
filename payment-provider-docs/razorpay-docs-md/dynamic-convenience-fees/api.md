<!-- Source: https://razorpay.com/docs/payments/dynamic-convenience-fees/api -->

You can send the convenience fee split details in the Orders API to override any pre-configured settings.

**Handy Tips**

You can configure the convenience fee based on:

- Fixed amount/Percentage
- From a customer/business perspective

For example, the business can create a configuration wherein, if the total platform fee is ₹10, then the business will pay ₹5, and the customer will pay ₹5.

Alternatively, the business can create a configuration wherein the customer will bear 20% of the total platform fee, and the business will bear the rest.

You can perform this configuration at the method level.

## Orders API

Order is an essential step in the payment process. For every payment, you should create an order. You can create an order using Orders API and pass the convenience fee details. The order\_id received in the response should be then passed to checkout.

### Request Parameters

amount

mandatory

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters. For example, `INR`. Dynamic convenience fee feature is supported only on `INR` transactions.

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. It can have a maximum length of 40 characters and has to be unique.

notes

optional

`json object` Key-value pair used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: Customers can make a partial payment.
- `false`: Customers cannot make partial payments.

convenience\_fee\_config

optional

`json object` This parameter will contain information about the convenience fee split for the given order.

message

optional

`string` Message displayed at the checkout in case convenience fee is applicable. The maximum character limit is `120`.

label

optional

`string` Label shown at the checkout in case convenience fee is applicable. The maximum character limit is `20`. The default value is `Convenience Fee`.

rules

mandatory

`array` Conditions to determine the fee split for different payment methods.

method

mandatory

`string` Payment method for which the given rule will be applicable. Possible values:

- `card`
- `netbanking`
- `upi`
- `wallet`

card.type

optional

`array` Applicable only when the `method=card`. Possible values:

- `debit`
- `credit`
- `prepaid`

fee

mandatory

`json object` Contains information about the convenience fee split and payee details for the given order.

payee

mandatory

`string` The party that will be bearing the convenience fee. Possible values:

- `customer`
- `business`

percentage\_value

optional

`string` The percentage of convenience fee that the customer or business will pay. Up to two decimal places are supported. Pass either `percentage_value` or `flat_value` to decide the final fee split.

flat\_value

optional

`integer` Convenience fee value, in paisa, that the customer or business will pay. If this value exceeds the total platform fee, then the minimum amount will be considered. Pass either `percentage_value` or `flat_value` to decide the final fee split.

## Error Responses

Given below are some of the error responses:

1. When the dynamic convenience fee feature is not enabled for your Razorpay account.
2. When an invalid value is sent for the `convenience_fee_config.rules.method` or `convenience_fee_config.rules.card.type` field in the request.
3. When the percentage value is not passed in string format.
