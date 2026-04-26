<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/java-be-sdk/sdk-reference-java/class-initialization -->

# Java Class Initialization

---

Class Initialization sets up the PhonePe Java SDK client using your credentials. This step creates a single client instance that handles all API communications securely throughout the application runtime.

## Request

- The `StandardCheckoutClient` class is used to interact with PhonePe APIs. Only one instance of this client should be created per runtime. Make sure to use the correct credentials when initializing to avoid exceptions.

|  |  |  |  |
| --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Mandatory (Yes/No)** | **Description** |
| `clientId` | String | Yes | Your unique Client ID for secure communication with PhonePe Payment Gateway. |
| `clientVersion` | Integer | Yes | Your unique Client Version for secure communication with PhonePe Payment Gateway. |
| `clientSecret` | String | Yes | Secret provided by PhonePe. |
| `env` | Env | Yes | Environment for the client: **• PRODUCTION** **• SANDBOX** |

Code Reference

```
import com.phonepe.sdk.pg.Env;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.common.models.MetaInfo;
import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
 
String clientId = "<clientId>";
String clientSecret = "<clientSecret>";
Integer clientVersion = <clientVersion>;               //insert your client version here
Env env = Env.SANDBOX;                   //Change to Env.PRODUCTION when you go live
 
StandardCheckoutClient client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
```

## What’s Next?

Now that you’ve learned how to initialize the `StandardCheckoutClient` with your credentials to connect securely with PhonePe APIs. Next, you’ll create a payment request to start the transaction and generate the payment link for users.

Head over to Initiate Payment to learn how to start the transcation.
