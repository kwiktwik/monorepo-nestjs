<!-- Source: https://razorpay.com/docs/api/bills/entity -->

# Bills Entity

Copy for AI

View as Markdown

The Bills entity has the following parameters:

Entity

```json
{
  "id": "bill_PYamApGCFTAjkh",
  "business_type": "retail",
  "business_category": "retail_and_consumer_goods",
  "customer": {
    "contact": "9876543210",
    "name": "Gaurav Kumar",
    "email": "",
    "customer_id": "",
    "date_of_birth": "",
    "profession": "",
    "company_name": "",
    "marital_status": "",
    "spouse_name": "",
    "anniversary_date": "",
    "gender": "",
    "gstin": "",
    "billing_address": null,
    "shipping_address": null
  },
  "loyalty": null,
  "store_code": "JK-001",
  "receipt_timestamp": 1722664800,
  "receipt_number": "INV001250013",
  "receipt_type": "tax_invoice",
  "receipt_delivery": "digital",
  "bar_code_number": "3412",
  "qr_code_number": "T2322 00000009291",
  "billing_pos_number": "bn",
  "pos_category": "traditional_pos",
  "order_number": "ORD213",
  "order_service_type": "",
  "delivery_status_url": "",
  "line_items": [
    {
      "name": "Acme Soap",
      "quantity": 1,
      "unit_amount": 10000,
      "employee_id": "1234",
      "unit": "pc",
      "description": "",
      "hsn_code": "HC2000INCLT",
      "product_code": "DRCO38",
      "product_uid": "",
      "image_url": "",
      "total_amount": 10000,
      "brand": "",
      "style": "",
      "colour": "",
      "size": "",
      "financier_data": null,
      "taxes": [
        {
          "name": "CGST",
          "percentage": 10,
          "amount": 1000
        },
        {
          "name": "SGST",
          "percentage": 10,
          "amount": 1000
        }
      ],
      "tags": [
        "noise cancelling",
        "limited edition"
      ],
      "sub_items": [
        {
          "name": "Advanced Edition",
          "quantity": 1,
          "unit_amount": 0,
          "employee_id": "1234",
          "unit": "pc",
          "description": "",
          "hsn_code": "",
          "product_code": "",
          "product_uid": "",
          "image_url": "",
          "total_amount": 10,
          "brand": "",
          "style": "",
          "colour": "",
          "size": "",
          "taxes": [],
          "tags": []
        }
      ]
    },
    {
      "name": "Acme Earphones",
      "quantity": 1,
      "unit_amount": 80000,
      "employee_id": "1234",
      "unit": "pc",
      "description": "",
      "hsn_code": "HC2000INPPLT",
      "product_code": "POPLT281",
      "product_uid": "",
      "image_url": "",
      "total_amount": 80000,
      "brand": "",
      "style": "",
      "colour": "",
      "size": "",
      "financier_data": null,
      "taxes": [
        {
          "name": "CGST",
          "percentage": 10,
          "amount": 8000
        },
        {
          "name": "SGST",
          "percentage": 10,
          "amount": 8000
        }
      ],
      "tags": [],
      "sub_items": []
    }
  ],
  "receipt_summary": {
    "total_quantity": 2,
    "sub_total_amount": 150000,
    "currency": "INR",
    "net_payable_amount": 187500,
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
    "payment_status": "success",
    "change_amount": 0,
    "roundup_amount": 0,
    "total_discount_percent": 0,
    "total_discount_amount": 0,
    "discounts": [
      {
        "name": "none",
        "amount": 0,
        "percent": 10
      }
    ],
    "used_wallet_amount": 0,
    "total_tax_amount": 37500,
    "total_tax_percent": 25
  },
  "taxes": [
    {
      "name": "CGST",
      "percentage": 10,
      "amount": 150
    },
    {
      "name": "SGST",
      "percentage": 10,
      "amount": 150
    },
    {
      "name": "cess",
      "percentage": 5,
      "amount": 75
    }
  ],
  "payments": [
    {
      "method": "paytm",
      "currency": "INR",
      "amount": 90000,
      "payment_reference_id": "",
      "financier_data": {
        "reference": "",
        "name": "v"
      }
    }
  ],
  "event": null,
  "receipt_url": "yourbill.me/PYamApGCFTAjkh",
  "created_at": 1722664800,
  "tags": [
    "noise cancelling",
    "limited edition"
  ]
}
```

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

Show child parameters (17)

`employee`

`object`

This is an array of objects containing details of the employees associated with the receipt.

Show child parameters (3)

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
- `order_confirmation`

`receipt_delivery`

\*

`string`

Indicates the delivery type of the receipt. Possible values:

- `digital`
- `print`
- `digital_and_print`

`tags`

`array`

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

Show child parameters (21)

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

`irn`

`object`

This object contains IRN ( Invoice Reference Number ) related details. If `irn` is present,
qr\_code and irn\_number are required.

Show child parameters (4)

`receipt_url`

`string`

The link to the receipt.

`created_at`

`integer`

UNIX timestamp of the date when the bill was generated.

# Bills Entity

Copy for AI

View as Markdown

The Bills entity has the following parameters:

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

Show child parameters (17)

`employee`

`object`

This is an array of objects containing details of the employees associated with the receipt.

Show child parameters (3)

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
- `order_confirmation`

`receipt_delivery`

\*

`string`

Indicates the delivery type of the receipt. Possible values:

- `digital`
- `print`
- `digital_and_print`

`tags`

`array`

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

Show child parameters (21)

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

`irn`

`object`

This object contains IRN ( Invoice Reference Number ) related details. If `irn` is present,
qr\_code and irn\_number are required.

Show child parameters (4)

`receipt_url`

`string`

The link to the receipt.

`created_at`

`integer`

UNIX timestamp of the date when the bill was generated.

Entity

```json
{
  "id": "bill_PYamApGCFTAjkh",
  "business_type": "retail",
  "business_category": "retail_and_consumer_goods",
  "customer": {
    "contact": "9876543210",
    "name": "Gaurav Kumar",
    "email": "",
    "customer_id": "",
    "date_of_birth": "",
    "profession": "",
    "company_name": "",
    "marital_status": "",
    "spouse_name": "",
    "anniversary_date": "",
    "gender": "",
    "gstin": "",
    "billing_address": null,
    "shipping_address": null
  },
  "loyalty": null,
  "store_code": "JK-001",
  "receipt_timestamp": 1722664800,
  "receipt_number": "INV001250013",
  "receipt_type": "tax_invoice",
  "receipt_delivery": "digital",
  "bar_code_number": "3412",
  "qr_code_number": "T2322 00000009291",
  "billing_pos_number": "bn",
  "pos_category": "traditional_pos",
  "order_number": "ORD213",
  "order_service_type": "",
  "delivery_status_url": "",
  "line_items": [
    {
      "name": "Acme Soap",
      "quantity": 1,
      "unit_amount": 10000,
      "employee_id": "1234",
      "unit": "pc",
      "description": "",
      "hsn_code": "HC2000INCLT",
      "product_code": "DRCO38",
      "product_uid": "",
      "image_url": "",
      "total_amount": 10000,
      "brand": "",
      "style": "",
      "colour": "",
      "size": "",
      "financier_data": null,
      "taxes": [
        {
          "name": "CGST",
          "percentage": 10,
          "amount": 1000
        },
        {
          "name": "SGST",
          "percentage": 10,
          "amount": 1000
        }
      ],
      "tags": [
        "noise cancelling",
        "limited edition"
      ],
      "sub_items": [
        {
          "name": "Advanced Edition",
          "quantity": 1,
          "unit_amount": 0,
          "employee_id": "1234",
          "unit": "pc",
          "description": "",
          "hsn_code": "",
          "product_code": "",
          "product_uid": "",
          "image_url": "",
          "total_amount": 10,
          "brand": "",
          "style": "",
          "colour": "",
          "size": "",
          "taxes": [],
          "tags": []
        }
      ]
    },
    {
      "name": "Acme Earphones",
      "quantity": 1,
      "unit_amount": 80000,
      "employee_id": "1234",
      "unit": "pc",
      "description": "",
      "hsn_code": "HC2000INPPLT",
      "product_code": "POPLT281",
      "product_uid": "",
      "image_url": "",
      "total_amount": 80000,
      "brand": "",
      "style": "",
      "colour": "",
      "size": "",
      "financier_data": null,
      "taxes": [
        {
          "name": "CGST",
          "percentage": 10,
          "amount": 8000
        },
        {
          "name": "SGST",
          "percentage": 10,
          "amount": 8000
        }
      ],
      "tags": [],
      "sub_items": []
    }
  ],
  "receipt_summary": {
    "total_quantity": 2,
    "sub_total_amount": 150000,
    "currency": "INR",
    "net_payable_amount": 187500,
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
    "payment_status": "success",
    "change_amount": 0,
    "roundup_amount": 0,
    "total_discount_percent": 0,
    "total_discount_amount": 0,
    "discounts": [
      {
        "name": "none",
        "amount": 0,
        "percent": 10
      }
    ],
    "used_wallet_amount": 0,
    "total_tax_amount": 37500,
    "total_tax_percent": 25
  },
  "taxes": [
    {
      "name": "CGST",
      "percentage": 10,
      "amount": 150
    },
    {
      "name": "SGST",
      "percentage": 10,
      "amount": 150
    },
    {
      "name": "cess",
      "percentage": 5,
      "amount": 75
    }
  ],
  "payments": [
    {
      "method": "paytm",
      "currency": "INR",
      "amount": 90000,
      "payment_reference_id": "",
      "financier_data": {
        "reference": "",
        "name": "v"
      }
    }
  ],
  "event": null,
  "receipt_url": "yourbill.me/PYamApGCFTAjkh",
  "created_at": 1722664800,
  "tags": [
    "noise cancelling",
    "limited edition"
  ]
}
```
