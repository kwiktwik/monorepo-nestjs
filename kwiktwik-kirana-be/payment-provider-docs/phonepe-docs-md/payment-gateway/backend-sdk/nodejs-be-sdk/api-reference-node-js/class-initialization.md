<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/class-initialization -->

# Node.js Class Initialization

---

**StandardCheckoutClient** class will be used to communicate with the PhonePe APIs. You can initiate the instance of this class only once.
Use required credentials while initializing the object.

|  |  |  |  |
| --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Mandatory (Yes/No)** | **Description** |
| `client_id` | Integer | Yes | Your unique client ID for secure communication with PhonePe. |
| `client_version` | String | Yes | Client version for secure communication with PhonePe. |
| `client_secret` | Integrer | Yes | Secret key provided by PhonePe Payment Gateway, which must be securely stored. |
| `env` | Enum | Yes | Environment for the client: **•****PRODUCTION** **•****SANDBOX** |

Sample code

```
import { StandardCheckoutClient, Env } from 'pg-sdk-node';
 
const clientId = "<clientId>";
const clientSecret = "<clientSecret>";
const clientVersion = <clientVersion>;  //insert your client version here
const env = Env.SANDBOX;      //change to Env.PRODUCTION when you go live
 
const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
```

## What’s Next?

Now that you’ve learned how to initialize the `StandardCheckoutClient` with your credentials to connect securely with PhonePe APIs. Next, you’ll create a payment request to start the transaction and generate the payment link for users.

Head over to Initiate Payment to learn how to start the transaction.
