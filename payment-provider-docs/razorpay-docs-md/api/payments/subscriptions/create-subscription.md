<!-- Source: https://razorpay.com/docs/api/payments/subscriptions/create-subscription -->

# Create a Subscription

Copy for AI

View as Markdown

`POST`

`/v1/subscriptions`

Use this endpoint to create a Subscription.

Sample Code

Request Parameters

Response Parameters

Errors

Curl

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

Success

Failure

```json
{
  "id": "sub_00000000000001",
  "entity": "subscription",
  "plan_id": "plan_00000000000001",
  "customer_email": null,
  "status": "created",
  "current_start": null,
  "current_end": null,
  "ended_at": null,
  "quantity": 1,
  "notes": {
      "notes_key_1": "Tea, Earl Grey, Hot",
      "notes_key_2": "Tea, Earl Grey… decaf."
  },
  "charge_at": 1773461489,
  "start_at": 1773461489,
  "end_at": 1776450600,
  "auth_attempts": 0,
  "total_count": 6,
  "paid_count": 0,
  "customer_notify": true,
  "created_at": 1773394958,
  "expire_by": 1773547889,
  "short_url": "https://rzp.io/rzp/Dqdqx3h",
  "has_scheduled_changes": false,
  "change_scheduled_at": null,
  "source": "api",
  "remaining_count": 6
}
```

###### Request Parameters

`plan_id`

\*

`string`

The unique identifier of a plan that should be linked to the Subscription. For example, `plan_00000000000001`.

`total_count`

\*

`integer`

The number of billing cycles for which the customer should be charged. For example, if a customer is buying a 1-year subscription billed on a bi-monthly basis, this value should be `6`.

`quantity`

`integer`

The number of times the customer should be charged the plan amount per invoice. For example, a customer subscribes to use software. The charges are ₹100 /month/license. The customer wants 5 licenses. You should pass `5` as the quantity. The customer is charged ₹500 (5 x ₹100) monthly. By default, this value is set to `1`.

`start_at`

`integer`

Unix timestamp that indicates from when the Subscription should start. If not passed, the Subscription starts immediately after the authorisation payment. For example, `1581013800`. For Subscriptions with a future start\_date, frequency is considered `as_presented`.

`expire_by`

`integer`

Unix timestamp that indicates till when the customer can make the authorisation payment. For example, `1581013800`. The default value is 30 years. Do not pass any value if you do not want to set an expiry date.

`customer_notify`

`boolean`

Indicates whether the communication to the customer would be handled by businesses or Razorpay. Possible values:

- `true` (default): Communication handled by Razorpay.
- `false`: Communication handled by businesses.

`addons`

`object`

Array that contains details of any upfront amount you want to collect as part of the authorisation transaction.

Show child parameters (1)

`offer_id`

`string`

The unique identifier of the offer that is linked to the Subscription. You can obtain this from the Dashboard. For example, `offer_JHD834hjbxzhd38d`.

`notes`

`object`

Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

###### Response Parameters

`id`

`string`

The unique identifier of the subscription created. For example, `sub_00000000000001`.

`entity`

`string`

The entity being created. Here, it will be `subscription`.

`plan_id`

`string`

The unique identifier for a plan that is linked to the created subscription. For example, `plan_00000000000001`.

`customer_id`

`string`

The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, `cust_00000000000001`.

`status`

`string`

Status of the subscription. Refer to the [life cycle section](/razorpay-docs-md/subscriptions/states.md) for more details. Possible values:

- `created`
- `authenticated`
- `active`
- `pending`
- `halted`
- `cancelled`
- `completed`
- `expired`

`current_start`

`integer`

Unix timestamp. The start time of the current billing cycle of the subscription. For example, `1581013800`.

`current_end`

`integer`

Unix timestamp. The end time of the current billing cycle of the subscription. For example, `1581013800`.

`ended_at`

`integer`

The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, `1581013800`.

`quantity`

`integer`

The number of times the plan should be linked to the subscription. For example, if the plan is ₹100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged ₹500 (5 x ₹100) monthly. By default, this value is set to 1.

`notes`

`object`

Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

`charge_at`

`integer`

Unix timestamp. This indicates when the next charge on the subscription should be made. For example, `1581013800`.

`offer_id`

`string`

The unique identifier of the offer that should be linked to the subscription. For example, `offer_JHD834hjbxzhd38d`.

`start_at`

`integer`

The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, `1581013800`.

`end_at`

`integer`

The timestamp, in Unix format, when the subscription should end. For example, `1581013800`.

`auth_attempts`

`integer`

The number of times that the charge for the current billing cycle has been attempted on the card. For example, `2`.

`total_count`

`integer`

The number of billing cycles for which the customer should be charged. For example, `2`. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

`paid_count`

`integer`

This indicates the number of billing cycles for which the customer has already been charged. For example, `2`.

`customer_notify`

`boolean`

Indicates whether the communication to the customer would be handled by businesses or Razorpay.

- `true`: Communication handled by Razorpay. Defaults to `true`.
- `false`: Communication handled by businesses.

`created_at`

`integer`

The timestamp, in Unix format, when the subscription was created. For example, `1581013800`.

`expire_by`

`integer`

The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, `1581013800`.

`short_url`

`string`

URL that can be used to make the authorisation payment. For example, `https://rzp.io/i/PWtAiEo`.

`has_scheduled_changes`

`boolean`

Indicates if the subscription has any scheduled changes. Possible values:

- `true`: Subscription has scheduled changes.
- `false`: Subscription does not have scheduled changes.

`schedule_change_at`

`string`

Represents when the subscription should be updated. Possible values:

- `now` (default): Updates the subscription immediately.
- `cycle_end`: Updates the subscription at the end of the current billing cycle.

`remaining_count`

`integer`

This indicates the number of billing cycles remaining on the subscription. For example, `2`.

###### Errors

The requested URL was not found on the server.

Error Status: 400

This error occurs when the Subscriptions feature is not enabled.

Solution

The id provided does not exist

Error Status: 400

This error occurs when passing an incorrect `plan_id`.

Solution

Offer Not Found

Error Status: 400

This error occurs when you are linking an invalid/expired offer to a Subscription.

Solution

Offer not applicable for this Subscription

Error Status: 400

This error occurs when you are linking/passing an `offer_id` to a Subscription on which the offer doesn't apply.

Solution

# Create a Subscription

Copy for AI

View as Markdown

`POST`

`/v1/subscriptions`

Use this endpoint to create a Subscription.

Request Parameters

Response Parameters

Errors

###### Request Parameters

`plan_id`

\*

`string`

The unique identifier of a plan that should be linked to the Subscription. For example, `plan_00000000000001`.

`total_count`

\*

`integer`

The number of billing cycles for which the customer should be charged. For example, if a customer is buying a 1-year subscription billed on a bi-monthly basis, this value should be `6`.

`quantity`

`integer`

The number of times the customer should be charged the plan amount per invoice. For example, a customer subscribes to use software. The charges are ₹100 /month/license. The customer wants 5 licenses. You should pass `5` as the quantity. The customer is charged ₹500 (5 x ₹100) monthly. By default, this value is set to `1`.

`start_at`

`integer`

Unix timestamp that indicates from when the Subscription should start. If not passed, the Subscription starts immediately after the authorisation payment. For example, `1581013800`. For Subscriptions with a future start\_date, frequency is considered `as_presented`.

`expire_by`

`integer`

Unix timestamp that indicates till when the customer can make the authorisation payment. For example, `1581013800`. The default value is 30 years. Do not pass any value if you do not want to set an expiry date.

`customer_notify`

`boolean`

Indicates whether the communication to the customer would be handled by businesses or Razorpay. Possible values:

- `true` (default): Communication handled by Razorpay.
- `false`: Communication handled by businesses.

`addons`

`object`

Array that contains details of any upfront amount you want to collect as part of the authorisation transaction.

Show child parameters (1)

`offer_id`

`string`

The unique identifier of the offer that is linked to the Subscription. You can obtain this from the Dashboard. For example, `offer_JHD834hjbxzhd38d`.

`notes`

`object`

Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

###### Response Parameters

`id`

`string`

The unique identifier of the subscription created. For example, `sub_00000000000001`.

`entity`

`string`

The entity being created. Here, it will be `subscription`.

`plan_id`

`string`

The unique identifier for a plan that is linked to the created subscription. For example, `plan_00000000000001`.

`customer_id`

`string`

The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, `cust_00000000000001`.

`status`

`string`

Status of the subscription. Refer to the [life cycle section](/razorpay-docs-md/subscriptions/states.md) for more details. Possible values:

- `created`
- `authenticated`
- `active`
- `pending`
- `halted`
- `cancelled`
- `completed`
- `expired`

`current_start`

`integer`

Unix timestamp. The start time of the current billing cycle of the subscription. For example, `1581013800`.

`current_end`

`integer`

Unix timestamp. The end time of the current billing cycle of the subscription. For example, `1581013800`.

`ended_at`

`integer`

The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, `1581013800`.

`quantity`

`integer`

The number of times the plan should be linked to the subscription. For example, if the plan is ₹100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged ₹500 (5 x ₹100) monthly. By default, this value is set to 1.

`notes`

`object`

Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

`charge_at`

`integer`

Unix timestamp. This indicates when the next charge on the subscription should be made. For example, `1581013800`.

`offer_id`

`string`

The unique identifier of the offer that should be linked to the subscription. For example, `offer_JHD834hjbxzhd38d`.

`start_at`

`integer`

The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, `1581013800`.

`end_at`

`integer`

The timestamp, in Unix format, when the subscription should end. For example, `1581013800`.

`auth_attempts`

`integer`

The number of times that the charge for the current billing cycle has been attempted on the card. For example, `2`.

`total_count`

`integer`

The number of billing cycles for which the customer should be charged. For example, `2`. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

`paid_count`

`integer`

This indicates the number of billing cycles for which the customer has already been charged. For example, `2`.

`customer_notify`

`boolean`

Indicates whether the communication to the customer would be handled by businesses or Razorpay.

- `true`: Communication handled by Razorpay. Defaults to `true`.
- `false`: Communication handled by businesses.

`created_at`

`integer`

The timestamp, in Unix format, when the subscription was created. For example, `1581013800`.

`expire_by`

`integer`

The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, `1581013800`.

`short_url`

`string`

URL that can be used to make the authorisation payment. For example, `https://rzp.io/i/PWtAiEo`.

`has_scheduled_changes`

`boolean`

Indicates if the subscription has any scheduled changes. Possible values:

- `true`: Subscription has scheduled changes.
- `false`: Subscription does not have scheduled changes.

`schedule_change_at`

`string`

Represents when the subscription should be updated. Possible values:

- `now` (default): Updates the subscription immediately.
- `cycle_end`: Updates the subscription at the end of the current billing cycle.

`remaining_count`

`integer`

This indicates the number of billing cycles remaining on the subscription. For example, `2`.

###### Errors

The requested URL was not found on the server.

Error Status: 400

This error occurs when the Subscriptions feature is not enabled.

Solution

The id provided does not exist

Error Status: 400

This error occurs when passing an incorrect `plan_id`.

Solution

Offer Not Found

Error Status: 400

This error occurs when you are linking an invalid/expired offer to a Subscription.

Solution

Offer not applicable for this Subscription

Error Status: 400

This error occurs when you are linking/passing an `offer_id` to a Subscription on which the offer doesn't apply.

Solution

Curl

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

Success

Failure

```json
{
  "id": "sub_00000000000001",
  "entity": "subscription",
  "plan_id": "plan_00000000000001",
  "customer_email": null,
  "status": "created",
  "current_start": null,
  "current_end": null,
  "ended_at": null,
  "quantity": 1,
  "notes": {
      "notes_key_1": "Tea, Earl Grey, Hot",
      "notes_key_2": "Tea, Earl Grey… decaf."
  },
  "charge_at": 1773461489,
  "start_at": 1773461489,
  "end_at": 1776450600,
  "auth_attempts": 0,
  "total_count": 6,
  "paid_count": 0,
  "customer_notify": true,
  "created_at": 1773394958,
  "expire_by": 1773547889,
  "short_url": "https://rzp.io/rzp/Dqdqx3h",
  "has_scheduled_changes": false,
  "change_scheduled_at": null,
  "source": "api",
  "remaining_count": 6
}
```
