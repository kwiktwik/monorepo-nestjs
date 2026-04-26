<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/python-be-sdk/sdk-reference-python/initiate-payment -->

# Initiate Payment with Python SDK

---

The Initiate Payment step allows you to start a payment transaction by creating a payment request with essential details like order ID, amount, and redirect URL. This request prepares the transaction on PhonePeâs platform and generates a redirect URL where users complete their payment securely.

## Request

Use `StandardCheckoutPayRequest.build_request()` to create the payment request. Below are the key attributes you can set:

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Mandatory** **(Yes/No)** | **Description** | **Constraints** |
| `merchantOrderId` | String | Yes | Unique order ID assigned by you | Max length: 63 characters, no special characters except â\_â and â-â |
| `amount` | Long | Yes | Order amount in paisa | Minimum value: 100 (in paisa) |
| `metaInfo` | Object | No | Meta information is defined by you to store additional information. The same data will be returned in status and callback response. |  |
| `metaInfo.udf1-`15 | String | No | Optional details you can add for more information. | Maximum length = 256 charactersÂ |
| paymentModeConfig | Object | No | Used to dynamically enable only specific instruments on the checkout page. | PaymentModeConstraint |
| `redirectUrl` | String | No | URL to which the user will be redirected after the payment (success or failure) |  |
| message | String | No | Payment message shown in APP for collect requests. |  |
| expireAfter | Long | No | Set a orders expiry time in seconds |  |
| disablePaymentRetry | Boolean | No | Setting this field to true willÂ disableÂ retries on standard checkoutÂ paymentÂ page. |  |

Sample Request with Default Instruments

```
from uuid import uuid4
from phonepe.sdk.pg.payments.v2.standard_checkout_client import StandardCheckoutClient
from phonepe.sdk.pg.payments.v2.models.request.standard_checkout_pay_request import StandardCheckoutPayRequest
from phonepe.sdk.pg.common.models.request.meta_info import MetaInfo
from phonepe.sdk.pg.env import Env
from phonepe.sdk.pg.payments.v2.models.request.prefill_user_login_details import PrefillUserLoginDetails
 
client_id = "<YOUR_CLIENT_ID>"
client_secret = "<YOUR_CLIENT_SECRET>"
client_version = <CLIENT_VERSION>  # Insert your client version here
env = Env.SANDBOX  # Change to Env.PRODUCTION when you go live
should_publish_events = False
 
client = StandardCheckoutClient.get_instance(client_id=client_id,
                                                              client_secret=client_secret,
                                                              client_version=client_version,
                                                              env=env,
                                                              should_publish_events=should_publish_events)
 
unique_order_id = str(uuid4())
ui_redirect_url = "https://www.merchant.com/redirect"
amount = 100
prefill_user_login_details = PrefillUserLoginDetails(phone_number="<PhonepeNumber>")
meta_info = MetaInfo(udf1="udf1", udf2="udf2", udf3="udf3") #upto 15 udf's can be passed here 
standard_pay_request = StandardCheckoutPayRequest.build_request(merchant_order_id=unique_order_id,
                                                                amount=amount,
                                                                redirect_url=ui_redirect_url,
                                                                meta_info=meta_info,
                                                                message="Message that will be shown for UPI collect transaction",
                                                                expire_after=3600,
                                                                disable_payment_retry=True,
                                                                prefill_user_login_details=prefill_user_login_details)
standard_pay_response = client.pay(standard_pay_request)
checkout_page_url = standard_pay_response.redirect_url
```

Sample Request with Selected Instruments

```
from uuid import uuid4
from phonepe.sdk.pg.payments.v2.standard_checkout_client import StandardCheckoutClient
from phonepe.sdk.pg.payments.v2.models.request.standard_checkout_pay_request import StandardCheckoutPayRequest
from phonepe.sdk.pg.common.models.request.meta_info import MetaInfo
from phonepe.sdk.pg.env import Env

# The below imports are for Selected Instruments

from phonepe.sdk.pg.common.models.request.payment_mode_constraints.net_banking_payment_mode import NetBankingPaymentModeConstraint
from phonepe.sdk.pg.common.models.request.payment_mode_constraints.upi_intent_payment_mode import UpiIntentPaymentModeConstraint
from phonepe.sdk.pg.common.models.request.payment_mode_constraints.card_payment_mode import CardPaymentModeConstraint
from phonepe.sdk.pg.common.models.request.pg_v2_instrument_type import PgV2InstrumentType
from phonepe.sdk.pg.payments.v2.models.request.payment_mode_config import PaymentModeConfig
from phonepe.sdk.pg.common.models.request.payment_mode_constraints.card_type import CardType
 
client_id = "<YOUR_CLIENT_ID>"
client_secret = "<YOUR_CLIENT_SECRET>"
client_version = <CLIENT_VERSION>  # Insert your client version here
env = Env.SANDBOX  # Change to Env.PRODUCTION when you go live
should_publish_events = False
 
client = StandardCheckoutClient.get_instance(client_id=client_id,
                                             client_secret=client_secret,
                                             client_version=client_version,
                                             env=env,
                                             should_publish_events=should_publish_events) 
unique_order_id = str(uuid4())
ui_redirect_url = "https://www.merchant.com/redirect"
amount = 100
meta_info = MetaInfo(udf1="udf1", udf2="udf2", udf3="udf3") #upto 15 udf's can be passed here
enabled_modes_data = [
        UpiIntentPaymentModeConstraint(PgV2InstrumentType.UPI_INTENT),
        NetBankingPaymentModeConstraint(PgV2InstrumentType.NET_BANKING),
        CardPaymentModeConstraint(card_types=[CardType.DEBIT_CARD, CardType.CREDIT_CARD]),
    ]
payment_mode_config = PaymentModeConfig(enabled_payment_modes=enabled_modes_data)
pay_page_build = StandardCheckoutPayRequest.build_request(
        merchant_order_id=unique_order_id,
        amount=100,
        meta_info=meta_info,
        payment_mode_config=payment_mode_config,
        redirect_url="https://www.merchant.com/redirect",
        message="Message that will be shown for UPI collect transaction",
        expire_after=3600,
        disable_payment_retry=True
    )
standard_pay_response = client.pay(pay_page_build)
checkout_page_url = standard_pay_response.redirect_url
```

## Response

The function returns aÂ `StandardCheckoutPayResponse`Â object with the following properties:

|  |  |  |
| --- | --- | --- |
| **Attribute** | **Data Type** | **Description** |
| `state` | String | State of the order created, expected value is PENDING. |
| `redirect_url` | String | URL for the PhonePe Payment Gateway Standard Checkout page. This is the URL to which the user should be redirected for payment. |
| `order_id` | String | A unique internal order ID generated by PhonePe PG. |
| `expire_at` | Long | Order expiry timestamp in epoch. |

## Whatâs Next?

After using the pay method to initiate a payment via the PhonePe PG, you can create a payment request and start the payment process. The next step is to create the order SDK.

Proceed to the next section to learn how to Create Order SDK .
