<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/subscriptions -->

You can create, fetch, query or cancel plans, subscriptions and addons using the Subscriptions API. These operations can also be performed on the [Dashboard](/razorpay-docs-md/subscriptions.md).

## Plans

A plan is a foundation on which a Subscription is built. It acts as a reusable template and contains details of the goods or services offered, the amount to be charged and the frequency at which the customer should be charged (billing cycle). Depending upon your business, you can create multiple plans with different billing cycles and pricing.

You should create a plan using the Checkout or Subscription link before creating a Subscription.

### Create a Plan

Use the below endpoint to create a plan.

POST

/plans

#### Request Parameters

period

mandatory

`string` This, combined with `interval`, defines the frequency of the plan. Possible values:

- `daily`
- `weekly`
- `monthly`
- `quarterly`
- `yearly`

**Handy Tips**

You can create custom frequencies while creating a plan. For example, once in 3 weeks.

- For UPI, all undefined frequencies except `daily`, `weekly`, `monthly`, `quarterly` and `yearly` are considered `as-presented`.
- For domestic cards, all undefined frequencies except `weekly`, `monthly` and `yearly` are considered `as-presented` while registering the mandate with banks.
- For Emandate, all defined and undefined frequencies are considered `as-presented` while registering the mandate with banks.

interval

mandatory

`integer` This, combined with `period`, defines the frequency of the plan. If the billing cycle is 2 months, the value should be `2`. For daily plans, the minimum value should be `7`.

item

`object` Details of the plan.

name

mandatory

`string` Name of the plan. For example, `Test Plan`.

amount

mandatory

`integer` Amount for the plan that is to be charged to the subscription in the next billing cycle. For example, `69900` translates to ₹699.

currency

mandatory

`string` Currency for the payment. For example, `INR`. You can accept payment in any of the [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

description

optional

`string` Description for the plan. For example, `Description for the test plan`.

notes

optional

`object` Notes you can enter of the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Monthly gym membership"`.

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/plans \
-H "Content-Type: application/json" \
-d '{
  "period": "weekly",
  "interval": 1,
  "item": {
    "name": "Test plan - Weekly",
    "amount": 69900,
    "currency": "",
    "description": "Description for the test plan"
  },
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
```

Success ResponseFailure Response

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```

#### Response Parameters

id

`string` The unique identifier linked to a plan. For example, `plan_00000000000001`. This ID is used when creating a subscription for a customer.

entity

`string` The entity being created. Here, it is `plan`.

interval

`integer` Used together with `period` to define how often the customer should be charged.

period

`string` Used together with `interval` to define how often the customer should be charged. Possible values:

- `daily`
- `weekly`
- `monthly`
- `yearly`

item

`array` Details of the plan.

id

`string` The unique identifier linked to an item. For example, `item_00000000000001`.

name

`string` Name of the plan. For example, `Test Plan`.

amount

`integer` Amount for the plan. When you use this plan to create a subscription, the customer will be charged this amount periodically.

currency

`string` Currency for the payment. You can accept payment in any of the [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

description

`string` Description for the plan. For example, `Description for the test plan`.

notes

`object` Notes you can enter of the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Monthly Gym"`.

created\_at

`integer` The Unix timestamp at which the plan was created.

### Fetch all Plans

Use the below endpoint to fetch details of all plans.

GET

/plans

#### Query Parameters

from

optional

`integer` The Unix timestamp from when plans are to be fetched.

to

optional

`integer` The Unix timestamp till when plans are to be fetched.

count

optional

`integer` The number of plans to be fetched. Default value is 10. Maximum value is 100. This can be used for pagination in combination with `skip`.

skip

optional

`integer` The number of plans to be skipped. Default value is 0. This can be used for pagination in combination with `count`.

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/plans \
```

### Fetch a Plan by ID

Use the below endpoint to fetch details of a plan by its unique identifier.

GET

/plans/:id

#### Path Parameter

id

mandatory

`string` The unique identifier of the plan. For example, `plan_00000000000001`.

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/plans/plan_00000000000001 \
```

## Subscriptions

You can use Subscriptions to charge a customer periodically. A Subscription ties a customer to a particular plan you have created. It contains details like the plan, the start date, total number of billing cycles, free trial period (if any) and upfront amount to be collected.

### Create a Subscription

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/subscriptions \
-H "Content-Type: application/json" \
-d '{
   "plan_id":"plan_00000000000001",
   "total_count":6,
   "quantity":1,
   "customer_notify": true,
   "start_at":1773461489,
   "expire_by":1773547889,
   "addons":[
      {
         "item":{
            "name":"Delivery charges",
            "amount":3000,
            "currency":""
         }
      }
   ],
   "notes":{
      "notes_key_1":"Tea, Earl Grey, Hot",
      "notes_key_2":"Tea, Earl Grey… decaf."
   }
}'
```

**Handy Tips**

- In order to process subscription, customer card details will need to be secured/tokenised in accordance with the applicable laws. The merchant will be solely responsible for obtaining informed consent from customers for the processing of e-mandates and such consent shall be explicit and not by way of a forced/default/automatic selection of check box, radio button etc.
- When the merchant is sharing `plan_id : unique identifier`, it is for tokenising the card as per applicable rules for subscription mandate creation.
  If such consent is not shared during the payment flow, then Razorpay will not tokenise the card or process the e-mandate/ subscription transaction.

#### Request Parameters

plan\_id

mandatory

`string` The unique identifier of a plan that should be linked to the Subscription. For example, `plan_00000000000001`.

total\_count

mandatory

`integer` The number of billing cycles for which the customer should be charged. For example, if a customer is buying a 1-year subscription billed on a bi-monthly basis, this value should be `6`.

quantity

optional

`integer` The number of times the customer should be charged the plan amount per invoice. For example, a customer subscribes to use software. The charges are ₹100 /month/license. The customer wants 5 licenses. You should pass `5` as the quantity. The customer is charged ₹500 (5 x ₹100) monthly. By default, this value is set to `1`.

start\_at

optional

`integer` Unix timestamp that indicates from when the Subscription should start. If not passed, the Subscription starts immediately after the authorisation payment. For example, `1581013800`. For Subscriptions with a future start\_date, frequency is considered `as_presented`.

expire\_by

optional

`integer` Unix timestamp that indicates till when the customer can make the authorisation payment. For example, `1581013800`. The default value is 30 years. Do not pass any value if you do not want to set an expiry date.

customer\_notify

optional

`boolean` Indicates whether the communication to the customer would be handled by businesses or Razorpay. Possible values:

- `true` (default): Communication handled by Razorpay.
- `false`: Communication handled by businesses.

addons

`object` Array that contains details of any upfront amount you want to collect as part of the authorisation transaction.

item

`object` Details of the upfront amount you want to charge your customer.

name

optional

`string` A name for the upfront amount you want to charge the customer. For example, `Delivery Fee`.

amount

optional

`integer` The upfront amount in the currency subunit you want to charge the customer. For example ,`30000`.

currency

optional

`string` The currency in which you want to charge the customer. This has to match the plan currency. For example, `INR`.

offer\_id

optional

`string` The unique identifier of the offer that is linked to the Subscription. You can obtain this from the Dashboard. For example, `offer_JHD834hjbxzhd38d`.

notes

optional

`object` Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

#### Response Parameters

id

`string` The unique identifier of the subscription created. For example, `sub_00000000000001`.

entity

`string` The entity being created. Here, it will be `subscription`.

plan\_id

`string` The unique identifier for a plan that is linked to the created subscription. For example, `plan_00000000000001`.

customer\_id

`string` The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, `cust_00000000000001`.

status

`string` Status of the subscription. Refer to the [life cycle section](/razorpay-docs-md/subscriptions/states.md) for more details. Possible values:

- `created`
- `authenticated`
- `active`
- `pending`
- `halted`
- `cancelled`
- `completed`
- `expired`

current\_start

`integer` Unix timestamp. The start time of the current billing cycle of the subscription. For example, `1581013800`.

current\_end

`integer` Unix timestamp. The end time of the current billing cycle of the subscription. For example, `1581013800`.

ended\_at

`integer` The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, `1581013800`.

quantity

`integer` The number of times the plan should be linked to the subscription. For example, if the plan is ₹100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged ₹500 (5 x ₹100) monthly. By default, this value is set to 1.

notes

`object` Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

charge\_at

`integer` Unix timestamp. This indicates when the next charge on the subscription should be made. For example, `1581013800`.

offer\_id

`string` The unique identifier of the offer that should be linked to the subscription. For example, `offer_JHD834hjbxzhd38d`.

start\_at

`integer` The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, `1581013800`.

end\_at

`integer` The timestamp, in Unix format, when the subscription should end. For example, `1581013800`.

auth\_attempts

`integer` The number of times that the charge for the current billing cycle has been attempted on the card. For example, `2`.

total\_count

`integer` The number of billing cycles for which the customer should be charged. For example, `2`. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid\_count

`integer` This indicates the number of billing cycles for which the customer has already been charged. For example, `2`.

customer\_notify

`boolean` Indicates whether the communication to the customer would be handled by businesses or Razorpay.

- `true`: Communication handled by Razorpay. Defaults to `true`.
- `false`: Communication handled by businesses.

created\_at

`integer` The timestamp, in Unix format, when the subscription was created. For example, `1581013800`.

expire\_by

`integer` The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, `1581013800`.

short\_url

`string` URL that can be used to make the authorisation payment. For example, `https://rzp.io/i/PWtAiEo`.

has\_scheduled\_changes

`boolean` Indicates if the subscription has any scheduled changes. Possible values:

- `true`: Subscription has scheduled changes.
- `false`: Subscription does not have scheduled changes.

schedule\_change\_at

`string` Represents when the subscription should be updated. Possible values:

- `now` (default): Updates the subscription immediately.
- `cycle_end`: Updates the subscription at the end of the current billing cycle.

remaining\_count

`integer` This indicates the number of billing cycles remaining on the subscription. For example, `2`.

### Create a Subscription Link

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/subscriptions \
-H "Content-Type: application/json" \
-d '{
  "plan_id": "plan_00000000000001",
  "total_count": 12,
  "quantity": 1,
  "start_at": 1561852800,
  "expire_by": 1561939199,
  "customer_notify": true,
  "addons": [
    {
    "item": {
      "name": "Delivery charges",
      "amount": 30000,
      "currency": ""
      }
    }
  ],
  "offer_id":"offer_JHD834hjbxzhd38d",
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "notify_info":{
    "notify_phone": "+919876543210",
    "notify_email": "gaurav.kumar@example.com"
  }
}'
```

**Handy Tips**

- In order to process subscription, customer card details will need to be secured/tokenised in accordance with the applicable laws. The merchant will be solely responsible for obtaining informed consent from customers for the processing of e-mandates and such consent shall be explicit and not by way of a forced/default/automatic selection of check box, radio button etc.
- When the merchant is sharing `plan_id : unique identifier`, it is for tokenising the card as per applicable rules for subscription mandate creation.
  If such consent is not shared during the payment flow, then Razorpay will not tokenise the card or process the e-mandate/ subscription transaction.

#### Request Parameters

plan\_id

mandatory

`string` The unique identifier of a plan that should be linked to the Subscription. For example, `plan_00000000000001`.

total\_count

mandatory

`integer` The number of billing cycles for which the customer should be charged. For example, if a customer is buying a 1-year subscription billed on a bi-monthly basis, this value should be `6`.

quantity

optional

`integer` The number of times the customer should be charged the plan amount per invoice. For example, a customer subscribes to use software. The charges are ₹100 /month/license. The customer wants 5 licenses. You should pass `5` as the quantity. The customer is charged ₹500 (5 x ₹100) monthly. By default, this value is set to `1`.

start\_at

optional

`integer` Unix timestamp that indicates from when the Subscription should start. If not passed, the Subscription starts immediately after the authorisation payment. For example, `1581013800`. For Subscriptions with a future start\_date, frequency is considered `as_presented`.

expire\_by

optional

`integer` Unix timestamp that indicates till when the customer can make the authorisation payment. For example, `1581013800`. The default value is 30 years. Do not pass any value if you do not want to set an expiry date.

customer\_notify

optional

`boolean` Indicates whether the communication to the customer would be handled by businesses or Razorpay. Possible values:

- `true` (default): Communication handled by Razorpay.
- `false`: Communication handled by businesses.

addons

`object` Array that contains details of any upfront amount you want to collect as part of the authorisation transaction.

item

`object` Details of the upfront amount you want to charge your customer.

name

optional

`string` A name for the upfront amount you want to charge the customer. For example, `Delivery Fee`.

amount

optional

`integer` The upfront amount in the currency subunit you want to charge the customer. For example ,`30000`.

currency

optional

`string` The currency in which you want to charge the customer. This has to match the plan currency. For example, `INR`.

offer\_id

optional

`string` The unique identifier of the offer that is linked to the Subscription. You can obtain this from the Dashboard. For example, `offer_JHD834hjbxzhd38d`.

notes

optional

`object` Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

notify\_info

`object` The customer's email and phone number to which notifications are to be sent. Use this array only if you have set the `customer_notify` parameter to `true`. That is, Razorpay sends notifications to the customer. The customer details entered in the API request are only to notify the customer about the Subscription. The same will not be prefilled in the checkout as per the government guidelines.

notify\_phone

optional

`string` The customer's phone number.

notify\_email

optional

`string` The customer's email.

You can perform various actions related to Subscriptions using the Dashboard.

#### Response Parameters

id

`string` The unique identifier of the subscription created. For example, `sub_00000000000001`.

entity

`string` The entity being created. Here, it will be `subscription`.

plan\_id

`string` The unique identifier for a plan that is linked to the created subscription. For example, `plan_00000000000001`.

customer\_id

`string` The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, `cust_00000000000001`.

status

`string` Status of the subscription. Refer to the [life cycle section](/razorpay-docs-md/subscriptions/states.md) for more details. Possible values:

- `created`
- `authenticated`
- `active`
- `pending`
- `halted`
- `cancelled`
- `completed`
- `expired`

current\_start

`integer` Unix timestamp. The start time of the current billing cycle of the subscription. For example, `1581013800`.

current\_end

`integer` Unix timestamp. The end time of the current billing cycle of the subscription. For example, `1581013800`.

ended\_at

`integer` The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, `1581013800`.

quantity

`integer` The number of times the plan should be linked to the subscription. For example, if the plan is ₹100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged ₹500 (5 x ₹100) monthly. By default, this value is set to 1.

notes

`object` Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

charge\_at

`integer` Unix timestamp. This indicates when the next charge on the subscription should be made. For example, `1581013800`.

offer\_id

`string` The unique identifier of the offer that should be linked to the subscription. For example, `offer_JHD834hjbxzhd38d`.

start\_at

`integer` The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, `1581013800`.

end\_at

`integer` The timestamp, in Unix format, when the subscription should end. For example, `1581013800`.

auth\_attempts

`integer` The number of times that the charge for the current billing cycle has been attempted on the card. For example, `2`.

total\_count

`integer` The number of billing cycles for which the customer should be charged. For example, `2`. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid\_count

`integer` This indicates the number of billing cycles for which the customer has already been charged. For example, `2`.

customer\_notify

`boolean` Indicates whether the communication to the customer would be handled by businesses or Razorpay.

- `true`: Communication handled by Razorpay. Defaults to `true`.
- `false`: Communication handled by businesses.

created\_at

`integer` The timestamp, in Unix format, when the subscription was created. For example, `1581013800`.

expire\_by

`integer` The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, `1581013800`.

short\_url

`string` URL that can be used to make the authorisation payment. For example, `https://rzp.io/i/PWtAiEo`.

has\_scheduled\_changes

`boolean` Indicates if the subscription has any scheduled changes. Possible values:

- `true`: Subscription has scheduled changes.
- `false`: Subscription does not have scheduled changes.

schedule\_change\_at

`string` Represents when the subscription should be updated. Possible values:

- `now` (default): Updates the subscription immediately.
- `cycle_end`: Updates the subscription at the end of the current billing cycle.

remaining\_count

`integer` This indicates the number of billing cycles remaining on the subscription. For example, `2`.

### Fetch All Subscriptions

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/subscriptions \
```

#### Query Parameters

plan\_id

optional

`string` The unique identifier of the plan for which you want to retrieve all the Subscriptions.

from

optional

`integer` The Unix timestamp from when Subscriptions are to be fetched.

to

optional

`integer` The Unix timestamp till when Subscriptions are to be fetched.

count

optional

`integer` The number of Subscriptions to be fetched. Default value is `10`. Maximum value is 100. This can be used for pagination, in combination with `skip`.

skip

optional

`integer` The number of Subscriptions to be skipped. Default value is `0`. This can be used for pagination, in combination with `count`.

### Fetch Subscription by ID

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/subscriptions/sub_00000000000001 \
```

#### Path Parameters

id

mandatory

`string` The unique identifier linked to a Subscription. For example, `sub_00000000000001`.

### Cancel a Subscription

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/subscriptions/sub_00000000000001/cancel \
-H "Content-Type: application/json" \
-d '{
  "cancel_at_cycle_end": false
}'
```

#### Path Parameters

id

mandatory

`string` The unique identifier linked to a Subscription. For example, `sub_00000000000001`.

#### Request Parameter

cancel\_at\_cycle\_end

optional

`boolean` Use this parameter to cancel a Subscription at the end of a billing cycle. Possible values:

- `true`: Cancel the subscription at the end of the current billing cycle.
- `false` (default): Cancel the subscription immediately.

### Update a Subscription

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X PATCH https://api.razorpay.com/v1/subscriptions/sub_00000000000001 \
-H "Content-Type: application/json" \
-d '{
  "plan_id":"plan_00000000000002",
  "offer_id":"offer_JHD834hjbxzhd38d",
  "quantity":5,
  "remaining_count":5,
  "start_at":1496000432,
  "schedule_change_at":"now",
  "customer_notify": true
}'
```

#### Path Parameters

id

mandatory

`string` The unique identifier linked to a Subscription. For example, `sub_00000000000001`.

#### Request Parameters

plan\_id

optional

`string` The unique identifier of the new plan that should be linked to the Subscription. For example, `plan_00000000000001`.

offer\_id

optional

`string` The unique identifier of the offer that should be linked to the Subscription. You can obtain this from the Dashboard. For example, `offer_JHD834hjbxzhd38d`.

quantity

optional

`integer` The number of times the plan should be linked to the Subscription. For example, if the plan is ₹100/user/month and the customer has 5 users, you should pass `5` as the quantity to have the customer charged ₹500 (5 x ₹100) monthly. By default, this value is set to `1`.

remaining\_count

optional

`integer` This parameter is used to update the `total_count` for a Subscription. For example, let us consider a monthly Subscription with 12 billing cycles. The Subscription has been charged successfully 4 times and 3 more invoices have been issued, but have not been charged. The remaining count in such cases is 5. However, you can overwrite this value using this parameter.

start\_at

optional

`integer` Unix timestamp. The new start date for the Subscription.

schedule\_change\_at

optional

`string` Represents when the Subscription should be updated.

- `now` (default): Updates the Subscription immediately.
- `cycle_end`: Updates the Subscription at the end of the current billing cycle.

customer\_notify

optional

`boolean` Represents who sends notifications to the customer. Possible values:

- `true` (default): Notifications sent by Razorpay.
- `false`: Notifications sent by you.

### Fetch Details of a Pending Update

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```0

#### Path Parameters

id

mandatory

`string` The unique identifier linked to a Subscription. For example, `sub_00000000000001`.

### Cancel an Update

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```1

#### Path Parameters

id

mandatory

`string` The unique identifier linked to a Subscription. For example, `sub_00000000000001`.

### Pause a Subscription

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```2

#### Path Parameters

id

mandatory

`string` The unique identifier linked to a Subscription. For example, `sub_00000000000001`.

#### Request Parameters

pause\_at

optional

`string` The value should be `now` to pause a Subscription immediately.

### Resume a Subscription

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```3

#### Path Parameters

id

mandatory

`string` The unique identifier linked to a Subscription. For example, `sub_00000000000001`.

#### Request Parameters

resume\_at

optional

`string` The value should be `now` to resume a Subscription immediately.

### Fetch All Invoices for a Subscription

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```4

#### Query Parameter

subscription\_id

mandatory

`string` The unique identifier linked to the Subscription. For example, `sub_00000000000001`.

#### Response Parameters

count

`integer` The number of invoices generated for the Subscription.

item

`array` List of invoices generated for the Subscription.

id

`string` The unique identifier of the invoice issued for the Subscription.

entity

`string` The entity being created. Here, it is `invoice`.

receipt

`string` Here, it is `null`.

invoice\_number

`string` The invoice number. Here, it is `null`.

customer\_id

`string` The unique identifier of the customer linked to the Subscription.

customer\_details

`object` Details of the customer.

id

`string` The unique identifier of the customer linked to the Subscription.

name

`string` The customer's name. Know more [Customers API](/razorpay-docs-md/api/customers.md).

email

`string` The customer's email address.

contact

`string` The customer's contact number.

billing\_address

`string` The customer's billing address.

shipping\_address

`string` The customer's shipping address.

customer\_name

`string` The customer's name.

customer\_email

`string` The customer's email address.

customer\_contact

`string` The customer's contact number.

order\_id

`string` The unique identifier of the order associated with the invoice.

subscription\_id

`string` The unique identifier of the Subscription. For example, `sub_00000000000001`.

line\_items

`array` Details of the line item that is billed in the invoice. Number of arrays = number of line items billed in the invoice. For example, if the Subscription starts immediately and has an upfront fee attached to it, the number of line items = 2. One for the Subscription charge and one for the upfront fee.

id

`string` The unique identifier linked to the item billed in the invoice. For example, `li_00000000000001`.

item\_id

`string` Here, it is `null`.

name

`string` The item's name. For example, `Monthly Plan`.

description

`string` A brief description of the item. Here, it is `null`.

amount

`integer` The item's price, in currency subunits. For example, `99900`.

currency

`string` The currency for the amount charged for the item.

type

`string` The type of charge. Possible values:

- `plan`
- `addon`

quantity

`integer` The number of units of the item billed in the invoice. For example, `1`.

payment\_id

`string` Unique identifier of the payment made by the customer using this invoice. For example, `pay_00000000000001`.

status

`string` The status of the invoice. Possible values:

- `draft`
- `issued`
- `partially_paid`
- `paid`
- `expired`
- `cancelled`
- `deleted`

expire\_by

`integer` The Unix timestamp, indicates at which the invoice will expire. For example, `1593411509`

issued\_at

`integer` The Unix timestamp, indicates at which the invoice was issued to the customer. For example, `1593411209`

paid\_at

`integer` The Unix timestamp, indicates at which the payment was made. For example, `1593411325`

cancelled\_at

`integer` The Unix timestamp, indicates at which the invoice was canceled by you. For example, `1593411209`

expired\_at

`integer` The Unix timestamp, indicates at which the invoice has expired. For example, `1593411209`

sms\_status

`string` Indicates whether the SMS notification for the invoice was sent to the customer. Possible values:

- `pending`
- `sent`

email\_status

`string` Indicates whether the email notification for the invoice was sent to the customer. Possible values:

- `pending`
- `sent`

date

`integer` The Unix timestamp, that indicates the date of the invoice.

terms

`string` Any terms to be included in the invoice. Here, it is `null`.

partial\_payment

`boolean` Indicates whether the customer can make a partial payment on the invoice.

- `true`: Customer can make partial payments.
- `false`: Customer cannot make partial payments.

amount

`integer` Amount to be paid using the invoice. This should be in the smallest unit of the currency. For example, `29995`.

amount\_paid

`integer` Amount paid by the customer using the invoice. For example, `29995`.

amount\_due

`integer` The remaining amount to be paid by the customer for the issued invoice.

currency

`string` The currency associated with the item.

description

`string` A brief description of the invoice. Here, it is `null`.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

comment

`string` Any comments to be added in the invoice. Here, it is `null`.

short\_url

`string` The short URL that is generated. This is the link that can be shared with customers to accept payments. Once canceled, no payments can be accepted using the link. For example, `https://rzp.io/i/gb5827Hh`.

view\_less

`boolean` Used when the link description is lengthy and you want to make the text collapsible. The text can be expanded by the customer using the **Show More** link.

- `true` (default): Link description appears collapsed, with a **Show More** link.
- `false`: Link description appears expanded.

type

`string` Here, it is `invoice`.

created\_at

`integer` The Unix timestamp, that indicates when this invoice entity was created. For example, `1593411943`.

### Delete an Offer Linked to a Subscription

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```5

#### Path Parameters

sub\_id

mandatory

`string` The unique identifier of the Subscription from which you want to remove the offer. For example, `sub_00000000000001`.

offer\_id

mandatory

`string` The unique identifier of the offer you want remove from the Subscription. For example, `offer_JHD834hjbxzhd38d`.

## Authentication Transaction

### Create Authentication Transaction

After you create a plan and a subscription, you have to create an authentication transaction. This authenticates the customer's payment method and authorizes you to collect recurring payments via the authenticated payment method.

Use the below endpoint to create an authentication transaction with method `card`.

POST

/payments/create/json

#### Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For cards, the minimum value is `100` (₹1).

subscription\_id

mandatory

`string` The unique identifier of the subscription. For example, `sub_00000000000001`.

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support INR.

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's contact number. For example, `9123456780`.

method

mandatory

`string` The payment method selected by the customer. Here, the value must be `card`.

card

The attributes associated with a card.

number

mandatory

`integer` Unformatted card number. This field is required if value of `method` is `card`. Use one of our test cards to try out the payment flow.

name

mandatory

`string` The name of the cardholder.

expiry\_month

mandatory

`integer` The expiry month of the card in `MM` format. For example, `01` for January and `12` for December.

expiry\_year

mandatory

`integer` Expiry year for card in the `YY` format. For example, 2025 will be in format `25`.

cvv

mandatory

`integer` CVV printed on the back of the card.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

#### Response Parameters

If the payment request is valid, the response contains the following fields. Refer to the [S2S Json V2 integration document](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md#step-2-create-a-payment) for more details.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible values:

- `otp_generate` - Use this URL to allow the customer to generate OTP and complete the payment on your webpage.
- `redirect` - Use this URL to redirect the customer to submit the OTP on the bank page.

url

`string` URL to be used for the action indicated.

### Verify Payment

This is a mandatory step that allows you to confirm the authenticity of the card details returned to the Checkout form for successful payments.

**Handy Tips**

You should consider the payment as successful and Subscription as authorised only after the signature has been successfully verified.

To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:

   - `subscription_id`: Retrieve the `subscription_id` from your server. Do not use the `razorpay_subscription_id` returned by Checkout.
   - `razorpay_payment_id`: Returned by Checkout.
   - `key_secret`: Available in your server.
      The `key_secret` that was generated from the [Dashboard](/razorpay-docs-md/payment-gateway/web-integration/standard.md#prerequisites)     .
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `subscription_id` to construct a HMAC hex digest as shown below:

   copy

   ```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```6
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

## Add-ons

You can create add-ons to charge the customer an extra amount for a particular billing cycle. Once you create an add-on for a Subscription, it is added to the next invoice that is generated. On the next scheduled charge, the customer is charged the add-on amount in addition to their regular Subscription amount.

### Create an Add-on

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```7

#### Path Parameter

id

mandatory

`string` The subscription ID to which the add-on is being added.

#### Request Parameters

item

`object` Details of the add-on you want to create.

name

mandatory

`string` A name for the add-on. For example, `Extra appala (papadum)`.

amount

mandatory

`integer` The amount you want to charge the customer for the add-on, in the currency subunit. For example, `30000`.

currency

mandatory

`string` The currency in which the customer should be charged for the add-on. For example, `INR`.

description

optional

`string` Description for the add-on. For example, `1 extra oil fried appala with meals`.

quantity

optional

`integer` This specifies the number of units of the add-on to be charged to the customer. For example, `2`. Defaults to `1`. The total amount is calculated as `amount` \* `quantity`.

#### Response Parameters

id

`string` The unique identifier of the created add-on. For example, `ao_00000000000001`.

item

`object` Details of the add-on created.

id

`string` The unique identifier linked to the created item. For example, `item_00000000000001`.

active

`boolean` Here the value will be `true`.

name

`string` Name of the add-on. For example, `Extra appala (papadum)`.

description

`string` Description of the add-on. For example, `1 extra oil fried appala with meals`.

amount

`integer` Amount of the add-on that is to be charged to the subscription in the next billing cycle. For example, `30000`.

currency

`string` The currency in which the customer should be charged for the add-on. For example, `INR`. Know more about the [currencies we support](/razorpay-docs-md/international-payments.md#supported-currencies).

created\_at

`integer` The timestamp, in Unix format, when the item was created. For example, `1581597318`.

quantity

`integer` This specifies the number of units of the add-on to be charged to the customer. For example, `2`. The total amount is calculated as `amount` \* `quantity`.

created\_at

`integer` The timestamp, in Unix format, when the add-on was created. For example, `1581597318`.

subscription\_id

`string` The unique identifier of the subscription to which the add-on is being added. For example, `sub_00000000000001`.

invoice\_id

`string` The add-on is added to the **next** invoice that is generated after the add-on is created. This field is populated only after the invoice is generated. Until then, it is `null`. Once the add-on is linked to an invoice, it cannot be deleted.

### Fetch all Add-ons

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```8

#### Query Parameters

from

optional

`integer` The Unix timestamp from when add-ons are to be fetched.

to

optional

`integer` The Unix timestamp till when add-ons are to be fetched.

count

optional

`integer` The number of add-ons to be fetched. Default value is `10`. Maximum value is `100`. This can be used for pagination, in combination with `skip`.

skip

optional

`integer` The number of add-ons to be skipped. Default value is `0`. This can be used for pagination, in combination with `count`.

### Fetch an Add-on by ID

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id":"plan_00000000000001",
  "entity":"plan",
  "interval":1,
  "period":"weekly",
  "item":{
    "id":"item_00000000000001",
    "active":true,
    "name":"Test plan - Weekly",
    "description":"Description for the test plan - Weekly",
    "amount":69900,
    "unit_amount":69900,
    "currency":"",
    "type":"plan",
    "unit":null,
    "tax_inclusive":false,
    "hsn_code":null,
    "sac_code":null,
    "tax_rate":null,
    "tax_id":null,
    "tax_group_id":null,
    "created_at":1580219935,
    "updated_at":1580219935
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1580219935
}
```9

#### Path Parameter

id

mandatory

`string` The unique identifier of an add-on. For example, `ao_00000000000001`.

### Delete an Add-on

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/plans \
```0

#### Path Parameter

id

mandatory

`string` The unique identifier of an add-on. For example, `ao_00000000000001`.

## Webhooks

### Available Webhook Events

Refer to the Webhooks section for a list of [available webhook events for Subscriptions](/docs/webhooks/subscriptions/).

### Setup Webhooks

Refer to the Webhooks section [to learn how to setup webhooks](/docs/webhooks/#set-up-webhooks).

### Sample Payloads

Refer to the Webhooks section for [sample payloads](/docs/webhooks/subscriptions/).

### Related Information

- [API authentication](/razorpay-docs-md/api/index.md)
- [Subscription product documentation](/razorpay-docs-md/subscriptions.md)
