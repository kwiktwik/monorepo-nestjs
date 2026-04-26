<!-- Source: https://razorpay.com/docs/api/bills/update -->

# Update a Bill

`PATCH`

`/v1/bills/:bill_id`

Use this endpoint to update a Bill.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X PATCH https://api.razorpay.com/v1/bills/bill_4a5e9ulyzk1mk2
-d '{
  "store_code": "",
  "customer": {
    "contact": "9000090001",
    "email": "saurav.kumar@example.com"
  },
  "receipt_type": "tax_invoice",
  "receipt_timestamp": 1907416999,
  "receipt_delivery": "digital",
  "line_items": [
    {
      "name": "T-Shirt",
      "quantity": 1,
      "employee_id": "1234",
      "total_amount": 100000
    }
  ],
  "receipt_summary": {
    "total_quantity": 1,
    "sub_total_amount": 100000,
    "currency": "INR",
    "net_payable_amount": 124000,
    "additional_charges": [
      {
        "description": "alteration charge",
        "amount": 2000
      },
      {
        "description": "cash on delivery",
        "amount": 2000
      },
    ],
    "payment_status": "paid"
  },
  "taxes": [
    {
      "name": "cgst",
      "percentage": 1200,
      "amount": 12000
    },
    {
      "name": "sgst",
      "percentage": 1200,
      "amount": 12000
    }
  ],
  "payments": [
    {
      "method": "Bank Transfer",
      "amount": 124000,
      "currency": "INR"
    }
  ]
}'
```

Success

```json
{
  "id": "bill_PYy4RWJWiNcPyE",
  "business_type": "retail",
  "business_category": "events",
  "customer": {
    "contact": "9000090001",
    "name": "d",
    "email": "saurav.kumar@example.com",
    "customer_id": "",
    "age": 2,
    "date_of_birth": "",
    "profession": "",
    "company_name": "",
    "marital_status": "",
    "spouse_name": "",
    "anniversary_date": "",
    "gender": "",
    "gstin": "",
    "billing_address": {
      "address_line_1": "",
      "address_line_2": "",
      "landmark": "",
      "city": "",
      "province": "",
      "pin_code": "",
      "country": ""
    },
    "shipping_address": {
      "address_line_1": "",
      "address_line_2": "",
      "landmark": "",
      "city": "",
      "province": "",
      "pin_code": "",
      "country": ""
    }
  },
  "loyalty": {
    "type": "",
    "card_num": "",
    "card_holder_name": "",
    "points_redeemed": 1
  },
  "store_code": "JK-001",
  "receipt_timestamp": 1907416999,
  "receipt_number": "INV00124992",
  "receipt_type": "tax_invoice",
  "receipt_delivery": "digital",
  "bar_code_number": "",
  "qr_code_number": "T2322 00000009291",
  "billing_pos_number": "bn",
  "pos_category": "traditional_pos",
  "order_number": "",
  "order_service_type": "",
  "delivery_status_url": "",
  "line_items": [
    {
      "name": "T-Shirt",
      "quantity": 1,
      "unit": "",
      "employee_id": "1234",
      "description": "",
      "hsn_code": "",
      "product_code": "",
      "product_uid": "",
      "image_url": "",
      "total_amount": 100000,
      "brand": "",
      "style": "",
      "colour": "",
      "size": "",
      "financier_data": null,
      "taxes": [],
      "tags": [],
      "sub_items": []
    }
  ],
  "receipt_summary": {
    "total_quantity": 1,
    "sub_total_amount": 100000,
    "currency": "INR",
    "net_payable_amount": 124000,
    "additional_charges": [
      {
        "description": "alteration charge",
        "amount": 2000
      },
      {
        "description": "cash on delivery",
        "amount": 2000
      },
    ],
    "payment_status": "paid",
    "discounts": []
  },
  "taxes": [
    {
      "name": "cgst",
      "percentage": 1200,
      "amount": 120
    },
    {
      "name": "sgst",
      "percentage": 1200,
      "amount": 120
    }
  ],
  "payments": [
    {
      "method": "Bank Transfer",
      "currency": "INR",
      "amount": 124000,
      "payment_reference_id": "",
      "financier_data": null
    }
  ],
  "event": {
    "name": "My Party",
    "start_timestamp": 1722911400,
    "end_timestamp": 1722924000,
    "location": "B-wing",
    "room": "Auditorium 1",
    "seats": [
      "gold b1",
      "gold b2",
      "gold b3"
    ]
  },
  "receipt_url": "yourbill.me/PYy4RWJWiNcPyE",
  "created_at": 1907416999,
  "tags": [
    "party1",
    "graduation"
  ]
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Bill.

###### Request Parameters

`store_code`

`string`

Associated store code for the receipt. Required if you have a multi-store setup where you have a single integration and have multiple stores under you.

`customer`

`object`

Details of the customer. Required if receipt mode is `digital` or `digital_and_print`.

Show child parameters (16)

`employee`

`object`

This is an array of objects containing details of the employees associated with the receipt.

Show child parameters (3)

`loyalty`

`object`

Customer loyalty details.

Show child parameters (9)

`receipt_type`

\*

`string`

The type of receipt. Possible values:

- `tax_invoice`
- `sales_invoice`
- `sales_return_invoice`
- `proforma_invoice`
- `credit_invoice`
- `purchase_invoice`
- `debit_invoice`

`receipt_timestamp`

\*

`integer`

UNIX timestamp of the date and time when the receipt was generated.

`receipt_delivery`

\*

`string`

Indicates the delivery type of the receipt. Possible values:

- `digital`
- `print`
- `digital_and_print`

`tags`

`string`

An array of strings representing relevant tags associated with the invoice.

`pos_category`

`string`

The type of POS machine. This is applicable if `business_type` is `retail`. Possible values:

- `traditional_pos`
- `kiosk_pos`

`line_items`

`object`

This is an array of objects containing the product data of the bill. Required if `receipt_type` is not `credit_invoice` or `debit_invoice`.

Show child parameters (22)

`receipt_summary`

\*

`object`

Details of the receipt.

Show child parameters (14)

`taxes`

`object`

This is an array of objects containing the details of the taxes incurred.

Show child parameters (3)

`payments`

\*

`object`

This is an array of objects containing the details of the payment.

Show child parameters (3)

`irn`

`object`

This object contains IRN ( Invoice Reference Number ) related details. If `irn` is present,
qr\_code and irn\_number are required.

Show child parameters (4)

###### Response Parameters

`id`

\*

`string`

Unique id of the bill generated.

`business_type`

\*

`string`

The type of business. Possible values:

- `ecommerce`
- `retail`

`business_category`

\*

`string`

The category the business falls under. Possible values:

- `events`
- `food_and_beverages`
- `retail_and_consumer_goods`
- `other_services`

`customer`

`object`

Details of the customer. Required if receipt mode is `digital` or `digital_and_print`.

Show child parameters (16)

`loyalty`

`object`

Customer loyalty details.

Show child parameters (9)

`store_code`

`string`

Associated store code for the receipt. Required if you have a multi-store setup where you have a single integration and have multiple stores under you.

`receipt_timestamp`

\*

`integer`

UNIX timestamp of the date and time when the receipt was generated.

`receipt_number`

\*

`string`

Unique receipt number generated for the bill.

`receipt_type`

\*

`string`

The type of receipt. Possible values:

- `tax_invoice`
- `sales_invoice`
- `sales_return_invoice`
- `proforma_invoice`
- `credit_invoice`
- `purchase_invoice`
- `debit_invoice`

`receipt_delivery`

\*

`string`

Indicates the delivery type of the receipt. Possible values:

- `digital`
- `print`
- `digital_and_print`

`tags`

`string`

An array of strings representing relevant tags associated with the invoice.

`bar_code_number`

`integer`

Bar code generated after the transaction. This will be displayed on the digital bill only.

`qr_code_number`

`integer`

QR code generated after the transaction. This will be displayed on the digital bill only.

`billing_pos_number`

`string`

POS number of the machine that generated the bill. This is applicable if `business_type` is `retail`.

`pos_category`

`string`

The type of POS machine. This is applicable if `business_type` is `retail`. Possible values:

- `traditional_pos`
- `kiosk_pos`

`order_number`

`string`

Incremental order number of the generated bill.

`order_service_type`

`string`

Order service type of the generated bill. This is applicable if `business_category` is `food_and_beverages`. Possible values:

- `dine_in`
- `take_away`

`delivery_status_url`

`string`

Order delivery status. This is applicable if `business_type` is `ecommerce`.

`line_items`

`object`

This is an array of objects containing the product data of the bill. Required if `receipt_type` is not `credit_invoice` or `debit_invoice`.

Show child parameters (18)

`receipt_summary`

\*

`object`

Details of the receipt.

Show child parameters (14)

`taxes`

`object`

This is an array of objects containing the details of the taxes applied. Required if `receipt_type` is `tax_inovice`, `purchase_invoice` or `sales_invoice`.

Show child parameters (3)

`payments`

\*

`object`

Details of the payment.

Show child parameters (5)

`event`

`object`

Details of the event booking. Required if `business_category` is `events`.

Show child parameters (6)

`receipt_url`

`string`

The link to the receipt.

`created_at`

`integer`

UNIX timestamp of the date when the bill was generated.

###### Errors

client not authorised to update

Error Status: 401

The client credentials are unauthorised to make changes to this bill.

Solution

The quantity must be an integer

Error Status: 400

The quantity of the product was not written in integer format.

Solution

Operation failed

Error Status: 400

There is an internal server error.

Solution

Bill not found for given receipt\_number

Error Status: 400

The bill id is incorrect or deleted.

Solution

# Update a Bill

`PATCH`

`/v1/bills/:bill_id`

Use this endpoint to update a Bill.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Bill.

###### Request Parameters

`store_code`

`string`

Associated store code for the receipt. Required if you have a multi-store setup where you have a single integration and have multiple stores under you.

`customer`

`object`

Details of the customer. Required if receipt mode is `digital` or `digital_and_print`.

Show child parameters (16)

`employee`

`object`

This is an array of objects containing details of the employees associated with the receipt.

Show child parameters (3)

`loyalty`

`object`

Customer loyalty details.

Show child parameters (9)

`receipt_type`

\*

`string`

The type of receipt. Possible values:

- `tax_invoice`
- `sales_invoice`
- `sales_return_invoice`
- `proforma_invoice`
- `credit_invoice`
- `purchase_invoice`
- `debit_invoice`

`receipt_timestamp`

\*

`integer`

UNIX timestamp of the date and time when the receipt was generated.

`receipt_delivery`

\*

`string`

Indicates the delivery type of the receipt. Possible values:

- `digital`
- `print`
- `digital_and_print`

`tags`

`string`

An array of strings representing relevant tags associated with the invoice.

`pos_category`

`string`

The type of POS machine. This is applicable if `business_type` is `retail`. Possible values:

- `traditional_pos`
- `kiosk_pos`

`line_items`

`object`

This is an array of objects containing the product data of the bill. Required if `receipt_type` is not `credit_invoice` or `debit_invoice`.

Show child parameters (22)

`receipt_summary`

\*

`object`

Details of the receipt.

Show child parameters (14)

`taxes`

`object`

This is an array of objects containing the details of the taxes incurred.

Show child parameters (3)

`payments`

\*

`object`

This is an array of objects containing the details of the payment.

Show child parameters (3)

`irn`

`object`

This object contains IRN ( Invoice Reference Number ) related details. If `irn` is present,
qr\_code and irn\_number are required.

Show child parameters (4)

###### Response Parameters

`id`

\*

`string`

Unique id of the bill generated.

`business_type`

\*

`string`

The type of business. Possible values:

- `ecommerce`
- `retail`

`business_category`

\*

`string`

The category the business falls under. Possible values:

- `events`
- `food_and_beverages`
- `retail_and_consumer_goods`
- `other_services`

`customer`

`object`

Details of the customer. Required if receipt mode is `digital` or `digital_and_print`.

Show child parameters (16)

`loyalty`

`object`

Customer loyalty details.

Show child parameters (9)

`store_code`

`string`

Associated store code for the receipt. Required if you have a multi-store setup where you have a single integration and have multiple stores under you.

`receipt_timestamp`

\*

`integer`

UNIX timestamp of the date and time when the receipt was generated.

`receipt_number`

\*

`string`

Unique receipt number generated for the bill.

`receipt_type`

\*

`string`

The type of receipt. Possible values:

- `tax_invoice`
- `sales_invoice`
- `sales_return_invoice`
- `proforma_invoice`
- `credit_invoice`
- `purchase_invoice`
- `debit_invoice`

`receipt_delivery`

\*

`string`

Indicates the delivery type of the receipt. Possible values:

- `digital`
- `print`
- `digital_and_print`

`tags`

`string`

An array of strings representing relevant tags associated with the invoice.

`bar_code_number`

`integer`

Bar code generated after the transaction. This will be displayed on the digital bill only.

`qr_code_number`

`integer`

QR code generated after the transaction. This will be displayed on the digital bill only.

`billing_pos_number`

`string`

POS number of the machine that generated the bill. This is applicable if `business_type` is `retail`.

`pos_category`

`string`

The type of POS machine. This is applicable if `business_type` is `retail`. Possible values:

- `traditional_pos`
- `kiosk_pos`

`order_number`

`string`

Incremental order number of the generated bill.

`order_service_type`

`string`

Order service type of the generated bill. This is applicable if `business_category` is `food_and_beverages`. Possible values:

- `dine_in`
- `take_away`

`delivery_status_url`

`string`

Order delivery status. This is applicable if `business_type` is `ecommerce`.

`line_items`

`object`

This is an array of objects containing the product data of the bill. Required if `receipt_type` is not `credit_invoice` or `debit_invoice`.

Show child parameters (18)

`receipt_summary`

\*

`object`

Details of the receipt.

Show child parameters (14)

`taxes`

`object`

This is an array of objects containing the details of the taxes applied. Required if `receipt_type` is `tax_inovice`, `purchase_invoice` or `sales_invoice`.

Show child parameters (3)

`payments`

\*

`object`

Details of the payment.

Show child parameters (5)

`event`

`object`

Details of the event booking. Required if `business_category` is `events`.

Show child parameters (6)

`receipt_url`

`string`

The link to the receipt.

`created_at`

`integer`

UNIX timestamp of the date when the bill was generated.

###### Errors

client not authorised to update

Error Status: 401

The client credentials are unauthorised to make changes to this bill.

Solution

The quantity must be an integer

Error Status: 400

The quantity of the product was not written in integer format.

Solution

Operation failed

Error Status: 400

There is an internal server error.

Solution

Bill not found for given receipt\_number

Error Status: 400

The bill id is incorrect or deleted.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X PATCH https://api.razorpay.com/v1/bills/bill_4a5e9ulyzk1mk2
-d '{
  "store_code": "",
  "customer": {
    "contact": "9000090001",
    "email": "saurav.kumar@example.com"
  },
  "receipt_type": "tax_invoice",
  "receipt_timestamp": 1907416999,
  "receipt_delivery": "digital",
  "line_items": [
    {
      "name": "T-Shirt",
      "quantity": 1,
      "employee_id": "1234",
      "total_amount": 100000
    }
  ],
  "receipt_summary": {
    "total_quantity": 1,
    "sub_total_amount": 100000,
    "currency": "INR",
    "net_payable_amount": 124000,
    "additional_charges": [
      {
        "description": "alteration charge",
        "amount": 2000
      },
      {
        "description": "cash on delivery",
        "amount": 2000
      },
    ],
    "payment_status": "paid"
  },
  "taxes": [
    {
      "name": "cgst",
      "percentage": 1200,
      "amount": 12000
    },
    {
      "name": "sgst",
      "percentage": 1200,
      "amount": 12000
    }
  ],
  "payments": [
    {
      "method": "Bank Transfer",
      "amount": 124000,
      "currency": "INR"
    }
  ]
}'
```

Success

```json
{
  "id": "bill_PYy4RWJWiNcPyE",
  "business_type": "retail",
  "business_category": "events",
  "customer": {
    "contact": "9000090001",
    "name": "d",
    "email": "saurav.kumar@example.com",
    "customer_id": "",
    "age": 2,
    "date_of_birth": "",
    "profession": "",
    "company_name": "",
    "marital_status": "",
    "spouse_name": "",
    "anniversary_date": "",
    "gender": "",
    "gstin": "",
    "billing_address": {
      "address_line_1": "",
      "address_line_2": "",
      "landmark": "",
      "city": "",
      "province": "",
      "pin_code": "",
      "country": ""
    },
    "shipping_address": {
      "address_line_1": "",
      "address_line_2": "",
      "landmark": "",
      "city": "",
      "province": "",
      "pin_code": "",
      "country": ""
    }
  },
  "loyalty": {
    "type": "",
    "card_num": "",
    "card_holder_name": "",
    "points_redeemed": 1
  },
  "store_code": "JK-001",
  "receipt_timestamp": 1907416999,
  "receipt_number": "INV00124992",
  "receipt_type": "tax_invoice",
  "receipt_delivery": "digital",
  "bar_code_number": "",
  "qr_code_number": "T2322 00000009291",
  "billing_pos_number": "bn",
  "pos_category": "traditional_pos",
  "order_number": "",
  "order_service_type": "",
  "delivery_status_url": "",
  "line_items": [
    {
      "name": "T-Shirt",
      "quantity": 1,
      "unit": "",
      "employee_id": "1234",
      "description": "",
      "hsn_code": "",
      "product_code": "",
      "product_uid": "",
      "image_url": "",
      "total_amount": 100000,
      "brand": "",
      "style": "",
      "colour": "",
      "size": "",
      "financier_data": null,
      "taxes": [],
      "tags": [],
      "sub_items": []
    }
  ],
  "receipt_summary": {
    "total_quantity": 1,
    "sub_total_amount": 100000,
    "currency": "INR",
    "net_payable_amount": 124000,
    "additional_charges": [
      {
        "description": "alteration charge",
        "amount": 2000
      },
      {
        "description": "cash on delivery",
        "amount": 2000
      },
    ],
    "payment_status": "paid",
    "discounts": []
  },
  "taxes": [
    {
      "name": "cgst",
      "percentage": 1200,
      "amount": 120
    },
    {
      "name": "sgst",
      "percentage": 1200,
      "amount": 120
    }
  ],
  "payments": [
    {
      "method": "Bank Transfer",
      "currency": "INR",
      "amount": 124000,
      "payment_reference_id": "",
      "financier_data": null
    }
  ],
  "event": {
    "name": "My Party",
    "start_timestamp": 1722911400,
    "end_timestamp": 1722924000,
    "location": "B-wing",
    "room": "Auditorium 1",
    "seats": [
      "gold b1",
      "gold b2",
      "gold b3"
    ]
  },
  "receipt_url": "yourbill.me/PYy4RWJWiNcPyE",
  "created_at": 1907416999,
  "tags": [
    "party1",
    "graduation"
  ]
}
```
