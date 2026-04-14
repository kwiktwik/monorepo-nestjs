<!-- Source: https://razorpay.com/docs/payments/magic-checkout/web/analytics-event-reference -->

This page is a technical reference for all Magic Checkout analytics events. For setup instructions, see the [Magic Checkout Analytics Integration](/razorpay-docs-md/magic-checkout/web/analytics-integration.md) guide.

## Common Payload Fields

Every `mx-analytics` event payload contains the following base fields. Event-specific additional fields are documented under each event in the [Event Reference](/razorpay-docs-md/magic-checkout/web/analytics-event-reference.md#event-reference).

List of fields

event

`string` The event name (for example, `"initiate"`, `"payment_initiated"`).

paymentMode

`string` Payment mode. Currently it is always `"online"`.

lineItems

`LineItem[]` Cart items at the time the event fired. See [LineItem Schema](/razorpay-docs-md/magic-checkout/web/analytics-event-reference.md#lineitem-schema).

totalAmount

`number` Original cart total in paise (before shipping or discounts).

latestTotal

`number` Current order total in paise, reflecting any applied discounts and shipping.

shippingAmount

optional

`number` Shipping cost in paise. Undefined if not yet calculated.

couponDiscountValue

`number` Discount applied by an active coupon in paise. 0 if no coupon is active.

isScriptCouponApplied

`boolean` Whether an automatic/script-based discount is applied.

currency

`string` Transaction currency code (for example, `"INR"`).

phone

`string` Customer's phone number. Empty string if not yet available.

email

`string` Customer's email address. Empty string if not yet available.

first\_name

`string` Customer's first name. Empty string if not yet available.

last\_name

`string` Customer's last name. Empty string if not yet available.

state

`string` Customer's state. Empty string if address not yet selected.

city

`string` Customer's city. Empty string if address not yet selected.

**Important Payload Information**

- **Field Naming Conventions**: Payloads use mixed casing based on their source. Amount and mode fields (for example, `latestTotal`, `paymentMode`) use **camelCase** as they originate from JavaScript. Customer identity and address fields (for example, `first_name`, `state_code`) use **snake\_case** as they originate from backend API responses.
- **Currency Format**: All amounts are represented in paise (integers). To get the value in Rupees, divide by 100 (for example, 49900 = ₹499.00).
- **Progressive Data Population**: Customer fields are populated in stages. `phone` and `email` appear after contact entry. However, `first_name`, `last_name`, `state` and `city` remain empty strings until the `address_info_submitted` event fires.

  - After `address_info_submitted` fires, additional fields —`state_code`, `country_name`, `zipcode`, `line1` and `line2`— become available in all subsequent payloads.
  - The `country_name` field actually contains a 2-letter country code (for example, "in") rather than the full name of the country.

## LineItem Schema

Each object in the `lineItems` array reflects what was passed in `line_items` when creating the order. All fields are optional as not every integration populates every field.

List of Fields

name

optional

`string` Product name.

description

optional

`string` Product description. May be an empty string.

image\_url

optional

`string | null` Product image URL.

price

optional

`number` Original price in paise.

offer\_price

optional

`number` Effective/offer price in paise.

quantity

optional

`number` Quantity in cart.

tax\_amount

optional

`number` Tax amount in paise.

variant\_id

optional

`string` Product variant identifier.

sku

optional

`string` Product SKU.

title

optional

`string` Alternate product name (used by some integrations).

id

optional

`string | number` Generic product/item identifier.

product\_id

optional

`string | number` Product identifier.

discount

optional

`number` Discount amount in paise.

product\_url

optional

`string` Relative URL to the product page.

brand

optional

`string` Product brand.

vendor

optional

`string` Product vendor.

## Address Schema

The `address` object is present in `address_selected` and `address_added` events.

Fields for address\_selected (saved address)

id

`string` Unique address identifier.

entity\_id

`string` Internal Razorpay identifier.

entity\_type

`string` Internal Razorpay identifier.

type

`string` Address type, for example, `"shipping_address"`.

primary

`boolean` Indicates whether this is the customer's primary address.

name

`string` Full name on the address.

line1

`string` Address line 1.

line2

`string` Address line 2. May be empty.

zipcode

`string` Postal or ZIP code.

city

`string` City.

state

`string` State name.

country

`string` 2-letter country code, for example, `"in"` for India.

contact

`string` Phone number associated with this address.

tag

`string` Address label, for example, `"Home"` or `"Work"`.

landmark

`string` Landmark. Empty string if not provided.

Fields for address\_added (new address from form)

Server-assigned fields (`id`, `entity_id`, `entity_type`, `primary`, `type`) are absent because the address is not yet saved. Two additional form-specific fields are present:

name

`string` Full name on the address.

line1

`string` Address line 1.

line2

`string` Address line 2. May be empty.

zipcode

`string` Postal or ZIP code.

city

`string` City.

state

`string` State name.

country

`string` 2-letter country code, for example, `"in"` for India.

contact

`string` Phone number associated with this address.

tag

`string` Address label, for example, `"Home"` or `"Work"`.

landmark

`string` Landmark. Empty string if not provided.

save\_my\_address

`boolean` Indicates whether the customer opted to save this address.

new\_shipping\_address\_cta

`any` Internal form field.

## Event Reference

Events are listed in the order they typically occur during a customer journey.

Login and OTP Events

Address Events

Coupon Events

Payment Events

initiate

**When it fires:** The Magic Checkout modal opens.

**Additional fields:** None beyond common fields.

Example Payload

copy

```json
{
  "event": "initiate",
  "paymentMode": "online",
  "lineItems": [
    {
      "name": "Product Name",
      "description": "Product description",
      "image_url": "https://example.com/image.jpg",
      "price": 49900,
      "offer_price": 49900,
      "quantity": 1,
      "tax_amount": 0,
      "variant_id": "123456789",
      "sku": "SKU-001"
    }
  ],
  "totalAmount": 49900,
  "latestTotal": 49900,
  "couponDiscountValue": 0,
  "isScriptCouponApplied": false,
  "currency": "INR",
  "phone": "+91XXXXXXXXXX",
  "email": "customer@example.com",
  "state": "",
  "city": "",
  "first_name": "",
  "last_name": ""
}
```

contact\_input\_entered

**When it fires:** The customer enters their phone number or email address in the contact input field.

**Additional fields:** None beyond common fields. The `phone` or `email` fields in the common payload reflect what the customer entered.

otp\_initiated

**When it fires:** An OTP is sent to the customer's phone number.

**Additional fields:**

otp\_verified

`boolean` Always `false`. The OTP is sent but not yet verified.

Example Payload

copy

```json
{
  "event": "otp_initiated",
  "otp_verified": false,
  "paymentMode": "online",
  "phone": "+91XXXXXXXXXX",
  "email": "customer@example.com",
  "state": "",
  "city": "",
  "first_name": "",
  "last_name": "",
  "totalAmount": 49900,
  "latestTotal": 49900,
  "couponDiscountValue": 0,
  "isScriptCouponApplied": false,
  "currency": "INR"
}
```

otp\_submitted

**When it fires:** The customer submits an OTP and it is accepted. This event does not fire on a failed OTP attempt.

**Additional fields:**

otp\_verified

`boolean` Always `true`. This event fires only on successful verification.

Example Payload

copy

```json
{
  "event": "otp_submitted",
  "otp_verified": true,
  "paymentMode": "online",
  "phone": "+91XXXXXXXXXX",
  "email": "customer@example.com",
  "state": "",
  "city": "",
  "first_name": "",
  "last_name": "",
  "totalAmount": 49900,
  "latestTotal": 49900,
  "couponDiscountValue": 0,
  "isScriptCouponApplied": false,
  "currency": "INR"
}
```

otp\_skipped

**When it fires:** The customer skips the OTP verification step when the skip option is available.

**Additional fields:** None beyond common fields.

user\_data

**When it fires:** The customer's identity is confirmed and their profile data is available. This is the earliest event where `phone`, `email`, `first_name` and `last_name` are reliably populated.

This event fires multiple times in a session: at login completion, when the customer proceeds from the address step and when payment is initiated. Each emission reflects the most current customer data.

**Additional fields:** None beyond common fields.

Example Payload

copy

```json
{
  "event": "user_data",
  "paymentMode": "online",
  "phone": "+91XXXXXXXXXX",
  "email": "customer@example.com",
  "state": "West Bengal",
  "city": "Kolkata",
  "first_name": "Jane",
  "last_name": "Doe",
  "totalAmount": 49900,
  "latestTotal": 49900,
  "couponDiscountValue": 0,
  "isScriptCouponApplied": false,
  "currency": "INR"
}
```

## Event Behavior Notes

When do mx-analytics events fire?

These events only fire for Magic Checkout. If Magic Checkout features are not enabled on your account, `mx-analytics` events will not be emitted.

When are customer fields populated?

Customer fields start as empty strings and are populated progressively as the customer advances through the flow. `user_data` is the earliest event where all identity fields are reliably complete.

How often does user\_data fire?

`user_data` fires multiple times per session: at login confirmation, after address is confirmed and when payment is initiated.

Can payment events fire multiple times?

`payment_initiated` and `payment_failed` can fire multiple times in one session if the customer retries after a failure.

Is there an event for failed OTP attempts?

`otp_submitted` only fires on a successful OTP. There is no event for a failed OTP attempt.

Does address\_selected fire on every selection?

`address_selected` will not fire if the same address is selected twice. It only fires when the selection changes.

When does address\_info\_submitted fire?

`address_info_submitted` fires in three scenarios: new address submitted, existing address confirmed and automatically on checkout open for an already-logged-in customer with a saved address.

Are shipping\_selected fields always present?

`shipping_selected` fields (`name`, `shipping_fee`, `cod`, `cod_fee`, `id`) are absent in the quick-buy flow where the customer pays without going through an address step.

When does checkout\_abandoned fire?

`checkout_abandoned` fires only when checkout closes without a successful payment. If payment succeeds, the handler callback fires instead.
