<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/autopay-backend-sdk/python-sdk-autopay/class-initialization -->

# Class Initialization

---

Class Initialization is the first step in integrating the PhonePe Python SDK into your application. In this step, you’ll set up the necessary classes and configurations to begin interacting with the SDK’s functionalities.

## SubscriptionClient Class Configuration

The **SubscriptionClient** class is used for communication with PhonePe APIs. It must be initialized only once, and the required credentials need to be provided during the initialization process.

⚠️ ****Do not store credentials in production code!****

---

For production builds, do not store credentials directly in the code.

## Parameters for Initialization

|  |  |  |  |
| --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Mandatory** | **Description** |
| `client_id` | `String` | Yes | Client ID for secure communication with PhonePe. |
| `client_secret` | String | Yes | The Secret provided by PhonePe should be securely stored on the merchant’s side. |
| `cient_version` | Int | Yes | Client version for secure communication with PhonePe. |
| `env` | Env | Yes | The Environment for the `StandardCheckoutClient`: **•** **Env.PRODUCTION**: For live, real transactions in the production environment. • **Env.SANDBOX**: For testing and development in a sandbox environment. |

## PhonePeException Handling

**PhonePeException** will be thrown if a new `SubscriptionClient` instance is created with different credentials than the previous instance. Ensure that credentials remain consistent to avoid this error.

## Example Usage

Code Reference

```
from phonepe.sdk.pg.env import Env
from phonepe.sdk.pg.subscription.v2.subscription_client import SubscriptionClient
 
client_id = ""
client_secret = ""
client_version = ""  # insert your client version here
should_publish_events = false
env = Env.SANDBOX  # change to Env.PRODUCTION when you go live
 
subscription_client = SubscriptionClient.get_instance(client_id=client_id,
                                                      client_secret=client_secret,
                                                      client_version=client_version,
                                                      env=env,
                                                      should_publish_events=should_publish_events)
```

## What’s Next?

Now that we’ve walked through class initialization, let’s move on to setting up the subscription.

Head over to the next section and let’s walk you through the process.
