<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/autopay-backend-sdk/java-sdk-autopay/class-initialization -->

# Class Initialization

---

Class Initialization is the first step in integrating the PhonePe Java SDK into your application. In this step, you’ll set up the necessary classes and configurations to begin interacting with the SDK’s functionalities.

## SubscriptionClient Class Configuration

The **SubscriptionClient** class is used for communication with PhonePe APIs. It must be initialized only once, and the required credentials need to be provided during the initialization process.

⚠️ ****Do not store credentials in production code!****

---

For production builds, do not store credentials directly in the code.

## Parameters for Initialization

|  |  |  |  |
| --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Mandatory** | **Description** |
| `clientId` | String | Yes | Client ID for secure communication with PhonePe. |
| `clientSecret` | String | Yes | The Secret provided by PhonePe should be securely stored on the merchant’s side. |
| `clientVersion` | Int | Yes | Client version for secure communication with PhonePe. |
| `env` | Env | Yes | The Environment for the `StandardCheckoutClient`: **•** **Env.PRODUCTION**: For live, real transactions in the production environment. • **Env.SANDBOX**: For testing and development in a sandbox environment. |

## PhonePeException Handling

**PhonePeException** will be thrown if a new `SubscriptionClient` instance is created with different credentials than the previous instance. Ensure that credentials remain consistent to avoid this error.

Code Reference

```
import com.phonepe.sdk.pg.Env;
import com.phonepe.sdk.pg.subscription.v2.SubscriptionClient;
 
String clientId = "<clientId>";
String clientSecret = "<clientSecret>";
Integer clientVersion = <clientVersion>;   //insert your client version here
Env env = Env.SANDBOX;       //change to Env.PRODUCTION when you go live
 
SubscriptionClient subscriptionClient = SubscriptionClient.getInstance(clientId, clientSecret,
        clientVersion, env);
```

## What’s Next?

Now that we’ve walked through class initialization, let’s move on to setting up the subscription.

Head over to the next section and let’s walk you through the process.
