<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/python-be-sdk/sdk-reference-python/class-initialization -->

# Python SDK Initialization

---

Class Initialization sets up the PhonePe Python SDK client using your credentials. This step creates a single client instance that handles all API communications securely throughout the application runtime.

## Request

- The `StandardCheckoutClient` class is used to interact with PhonePe APIs. Only one instance of this client should be created per runtime. Make sure to use the correct credentials when initializing to avoid exceptions.

## Request Parameters

|  |  |  |  |
| --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Mandatory (Yes/No)** | **Description** |
| `client_id` | String | Yes | Your unique client ID for secure communication with PhonePe. |
| `client_version` | Integer | Yes | Client version for secure communication with PhonePe. |
| `client_secret` | String | Yes | Secret key provided by PhonePe Payment Gateway, which must be securely stored. |
| `env` | Enum | Yes | Environment for the client: **•** PRODUCTION **•** SANDBOX |

Code Reference

```
from phonepe.sdk.pg.payments.v2.standard_checkout_client import StandardCheckoutClient
from phonepe.sdk.pg.env import Env
 
client_secret = "<YOUR_CLIENT_SECRET>"
client_id = "<YOUR_CLIENT_ID>"
client_version = <CLIENT_VERSION>  # insert your client version
env = Env.SANDBOX
should_publish_events = False
client = StandardCheckoutClient.get_instance(client_id=client_id,
                                                    client_secret=client_secret,
                                                    client_version=client_version,
                                                    env=env,
                                                    should_publish_events=should_publish_events)
```

## What’s Next?

Now that you’ve learned how to initialize the `StandardCheckoutClient` with your credentials to connect securely with PhonePe APIs. Next, you’ll create a payment request to start the transaction and generate the payment link for users.

Head over to Initiate Payment to learn how to start the transaction.
