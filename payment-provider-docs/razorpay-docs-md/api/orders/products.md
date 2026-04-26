<!-- Source: https://razorpay.com/docs/api/orders/products -->

You can now store additional information on the products that customers add to their cart while shopping on your website or app, using the Products API.

The Products API is based on the Orders API and uses the same endpoint. Along with the existing Orders parameters, you must use the `products` array to pass additional, domain-specific product information such as type, price, and so on.

## List of Endpoints

## Product Entity

The product parameters vary based on its `type`. Right now, only `mutual_fund` is supported.

### Type: Mutual Funds

Businesses in this sector can use the `products` array to detail mutual fund investments in one order.

**Watch Out!**

- SEBI mandates Razorpay to report investments for Stock Brokers and Mutual Fund Distributors. Some details are thus mandatory. But for AMCs or Exchange platforms, these parameters are optional.
- Always include mandatory parameters as required by the receiving entity. Razorpay won't validate them, and missing parameters can lead to transaction rejection.

### Other Product Types

The `products` array allows businesses to detail customer purchases in one order.

**Handy Tips**

Currently, only `mutual_funds` is supported. To request other types, contact our [Support team](https://razorpay.com/support/#request).

The `products` array has the following parameters:

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

`string` Unique Member ID as issued by the mutual fund platform. Can have a maximum length of 20 characters.

mf\_user\_id

mandatory

`string` Unique User or Client ID as issued by the mutual fund platform. Can have a maximum length of 10 characters.

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
