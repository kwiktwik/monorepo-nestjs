<!-- Source: https://razorpay.com/docs/api/orders/products/create-with-details -->

POST

/v1/orders

Use this endpoint to create an Order with the transaction details and the domain-specific product details.

**Handy Tips**

We have an optional feature called **Amount Check**, which will reject your order request if the sum of all the products is not equal to the amount passed in the order. To get this feature enabled, raise a request to our [Support team](https://razorpay.com/support/#request).

CurlJavaPythonGoPHPRubyNode.jsSuccess

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "content-type: application/json" \
-d '{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt#1",
  "products": [
    {
      "type": "mutual_fund",
      "plan": "GD",
      "folio": "9104927822",
      "amount": "1400",
      "option": "G",
      "scheme": "LT",
      "receipt": "77407",
      "mf_member_id": "123445",
      "mf_user_id": "77407",
      "mf_partner": "cams",
      "mf_investment_type": "L",
      "mf_amc_code": "UTB"
    },
    {
      "type": "mutual_fund",
      "plan": "SS",
      "folio": "414117335676",
      "amount": "2400",
      "option": "G",
      "scheme": "BP",
      "receipt": "77407",
      "mf_member_id": "990445",
      "mf_user_id": "99407",
      "mf_partner": "kfin",
      "mf_investment_type": "S",
      "mf_amc_code": "MIR"
    }
  ]
}'
```

Request Parameters

amount

mandatory

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`. Payment can only be made for this amount against the Order.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Can have a maximum length of 40 characters and has to be unique.

products

mandatory

`array` Details of the products.

type

mandatory

`string` The type of product. Currently, the only supported value is `mutual_fund`.

plan if type=mutual\_fund

optional

`string` The name of the mutual fund plan selected by the customer. For example, `GD`.

folio if type=mutual\_fund

optional

`string` Unique identifier of the customer's account with the mutual fund. For example, `9104927822`.

amount if type=mutual\_fund

mandatory

`string` The amount paid by the customer for the plan. Sum of the individual cart amount must be equal to total order amount. It must be in paise. For example, `1400`.

option if type=mutual\_fund

optional

`string` Mutual fund plan option. For example, `G`.

scheme if type=mutual\_fund

mandatory for RTA

`string` The type of mutual fund scheme you chose.
For example, `LT`, `BP`.

receipt if type=mutual\_fund

mandatory

`string` Unique reference number (Order Number) generated at the merchant’s name. For example, `77407`.

mf\_member\_id

mandatory

`string` Unique member id as issued by the mutual fund platform. Can have a maximum length of 20 characters.

mf\_user\_id

mandatory

`string` Unique user or client id as issued by the mutual fund platform. Can have a maximum length of 10 characters.

mf\_partner

mandatory

`string` The mutual fund platform being used to enable the purchase. Possible values are:

- `cams`
- `kfin`
- `bse`
- `nse`

Can have a maximum length of 4 characters.

**Watch Out!**

Do not use values apart from the ones given above. It will not be accepted.

mf\_investment\_type

mandatory

`string` The type of investment. Possible values are:

- `L`: Lump sum
- `S`: SIP

Can have a maximum length of 7 characters.

mf\_amc\_code

mandatory for RTA

`string` The AMC code for the mutual fund. Can have a maximum length of 5 characters. [List of possible values](/razorpay-docs-md/api/orders/products/appendix.md).

Response Parameters

id

`string` The unique identifier of the order.

amount

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

currency

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

products

mandatory

`array` Details of the products.

type

mandatory

`string` The type of product. Currently, the only supported value is `mutual_fund`.

plan if type=mutual\_fund

optional

`string` The name of the mutual fund plan selected by the customer. For example, `GD`.

folio if type=mutual\_fund

optional

`string` Unique identifier of the customer's account with the mutual fund. For example, `9104927822`.

amount if type=mutual\_fund

mandatory

`string` The amount paid by the customer for the plan. Sum of the individual cart amount must be equal to total order amount. It must be in paise. For example, `1400`.

option if type=mutual\_fund

optional

`string` Mutual fund plan option. For example, `G`.

scheme if type=mutual\_fund

mandatory for RTA

`string` The type of mutual fund scheme you chose.
For example, `LT`, `BP`.

receipt if type=mutual\_fund

mandatory

`string` Unique reference number (Order Number) generated at the merchant’s name. For example, `77407`.

mf\_member\_id

mandatory

`string` Unique member id as issued by the mutual fund platform. Can have a maximum length of 20 characters.

mf\_user\_id

mandatory

`string` Unique user or client id as issued by the mutual fund platform. Can have a maximum length of 10 characters.

mf\_partner

mandatory

`string` The mutual fund platform being used to enable the purchase. Possible values are:

- `cams`
- `kfin`
- `bse`
- `nse`

Can have a maximum length of 4 characters.

**Watch Out!**

Do not use values apart from the ones given above. It will not be accepted.

mf\_investment\_type

mandatory

`string` The type of investment. Possible values are:

- `L`: Lump sum
- `S`: SIP

Can have a maximum length of 7 characters.

mf\_amc\_code

mandatory for RTA

`string` The AMC code for the mutual fund. Can have a maximum length of 5 characters. [List of possible values](/razorpay-docs-md/api/orders/products/appendix.md)
