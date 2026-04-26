<!-- Source: https://razorpay.com/docs/api/orders/products/create-pl-with-details -->

POST

/v1/payment\_links

Use this endpoint to create a Payment Link and store additional information about the products purchased by customers while accepting payments using Payment Links Third-Party Validation.

**Watch Out!**

- SEBI guidelines require Razorpay to report for all investments on Stock Brokers and Mutual Funds Distributors, because of which some of the details are mandatory. However, if you are an Asset Management Company (AMC) or an Exchange platform yourself, all the below parameters are optional.
- Ensure that you pass **all the mandatory parameters** in the report format mentioned by the receiving entity (Exchanges/RTAs). Razorpay will not validate the mandatory parameters sent. If these parameters are missed, the receiving entity will reject the transactions.

CurlResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payment_links \
H 'content-type: application/json'
-d '{
  "amount": 1000,
  "currency": "INR",
  "accept_partial": true,
  "first_min_partial_amount": 100,
  "description": "Payment for policy no #23456",
  "customer": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gaurav.kumar@example.com"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "reminder_enable": true,
  "options": {
    "order": {
      "method": "netbanking",
      "bank_account": {
        "account_number": "04300040049999",
        "name": "Gaurav Kumar",
        "ifsc": "KKBK0000430"
      },
      "products": [
        {
          "type": "mutual_fund",
          "plan": "GD",
          "folio": "9104927822",
          "amount": "1400",
          "option": "G",
          "scheme": "LT",
          "receipt": "77407",
          "mf_member_id": "0612",
          "mf_user_id": "123",
          "mf_partner": "bse",
          "mf_investment_type": "L",
          "mf_amc_code": "ABC"
        }
      ]
    }
  }
}'
```

Request Parameters

amount

mandatory

`integer` Amount to be paid using the Payment Link. Must be in the smallest unit of the currency. For example, if you want to receive a payment of ₹300, you must enter the value `30000`.

currency

optional

`string` A three-letter ISO code for the currency in which you want to accept the payment. For example, INR. Refer to the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

accept\_partial

optional

`boolean` Indicates whether customers can make [partial payments](/razorpay-docs-md/payment-links/partial-payments.md) using the Payment Link. Possible values:

- `true`: Customer can make partial payments.
- `false` (default): Customer cannot make partial payments.

first\_min\_partial\_amount

conditionally mandatory

`integer` Minimum amount, in currency subunits, that must be paid by the customer as the first partial payment. Default value is `100`. Default currency is `INR`. For example, if an amount of ₹700 is to be received from the customer in two installments of #1 - ₹500, #2 - ₹200, then you can set this value as `500000`. Must be passed along with `accept_partial` parameter.

description

optional

`string` A brief description of the Payment Link. The maximum character limit supported is 2048.

customer

optional

`string` Customer details

name

optional

`string` The customer's name.

email

optional

`string` The customer's email address.

contact

optional

`string` The customer's phone number.

notify

optional

`array` Defines who handles Payment Link notification.

sms

optional

`boolean` Defines who handles the SMS notification. Possible values:

- `true`: Razorpay handles the notification.
- `false`: You handle the notification.

email

optional

`boolean` Defines who handles the email notification. Possible values:

- `true`: Razorpay handles the notification.
- `false`: You handle the notification.

reminder\_enable

optional

`boolean` Used to send [reminders](/razorpay-docs-md/payment-links/reminders.md) for the Payment Link. Possible values:

- `true`: To send reminders.
- `false`: To disable reminders.

options

mandatory

`string` Contains the configurations and preferences related to the payment process.

order

mandatory

`string` Indicates the details related to how the payment should be processed.

method

mandatory

`string` Indicates the payment method being used. In this case, it is `netbanking`.

bank\_account

mandatory

`string` Details of the bank account.

account\_number

mandatory

`string` The bank account number.

name

mandatory

`string` Name of the bank account holder.

ifsc

mandatory

`string` The IFSC code of the bank.

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

Response Parameters

accept\_partial

`boolean` Indicates whether customers can make [partial payments](/razorpay-docs-md/payment-links/partial-payments.md) using the Payment Link. Possible values:

- `true`: Customer can make partial payments.
- `false` (default): Customer cannot make partial payments.

amount

`integer` Amount to be paid using the Payment Link. Must be in the smallest unit of the currency. For example, if you want to receive a payment of ₹300, you must enter the value `30000`.

amount\_paid

`integer` Amount paid by the customer.

cancelled\_at

`integer` Timestamp, in Unix, at which the Payment Link was cancelled by you.

created\_at

`integer` Timestamp, in Unix, indicating when the Payment Link was created.

currency

`string` Defaults to INR. We accept payments in [international currencies.](/razorpay-docs-md/international-payments.md#supported-currencies) customer

`string` Customer details

name

`string` The customer's name.

email

`string` The customer's email address.

contact

`string` The customer's phone number.

description

`string` A brief description of the Payment Link.

expire\_by

`integer` Timestamp, in Unix, when the Payment Link will expire. By default, a Payment Link will be valid for six months from the date of creation. Please note that the expire by date cannot exceed more than six months from the date of creation.

expired\_at

`integer` Timestamp, in Unix, at which the Payment Link expired.

first\_min\_partial\_amount

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹700 is to be received from the customer in two installments of #1 - ₹500, #2 - ₹200, then you can set this value as `500000`.

id

`string` Unique identifier of the Payment Link. For example, `plink_ERgihyaAAC0VNW`.

upi\_link

`boolean` Indicates whether the Payment Link is a UPI Payment Link.

- `true`: A UPI Payment Link has been created.
- `false`: It is a Standard Payment Link.

notes

`object` Set of key-value pairs that you can use to store additional information. You (Businesses) can enter a maximum of 15 key-value pairs, with each value having a maximum limit of 256 characters.

notify

`array` Defines who handles Payment Link notification.

sms

`boolean` Defines who handles the SMS notification.

- `true`: Razorpay handles the notification.
- `false`: Businesses handle the notification.

email

`boolean` Defines who handles the email notification.

- `true`: Razorpay handles the notification.
- `false`: Businesses handle the notification.

payments

`array` Payment details such as amount, payment id, Payment Link id and more. This array gets populated only after the customer makes a payment. Until then, the value is `null`.

updated\_at

`integer` Timestamp, in Unix, indicating when the payment was updated.

reference\_id

`string` Reference number tagged to a Payment Link. Must be a unique number for each Payment Link. The maximum character limit supported is 40.

short\_url

`string` The unique short URL generated for the Payment Link.

status

`string` Displays the current state of the Payment Link. Possible values:

- `created`
- `partially_paid`
- `expired`
- `cancelled`
- `paid`

updated\_at

`integer` Timestamp, in Unix, indicating when the Payment Link was updated.

reminder\_enable

`boolean` Used to send [reminders](/razorpay-docs-md/payment-links/reminders.md) for the Payment Link. Possible values:

- `true`: To send reminders.
- `false`: To disable reminders.

user\_id

`string` A unique identifier for the user role through which the Payment Link was created. For example, `HD1JAKCCPGDfRx`.
