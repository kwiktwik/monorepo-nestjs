<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/net-backend-sdk/net-sdk-reference/class-initialization -->

# .NET Class Initialization

---

Class Initialization sets up the PhonePe .NET SDK client using your credentials. This step creates a single client instance that handles all API communications securely throughout the application runtime.

## Request

- The `StandardCheckoutClient` class is used to interact with PhonePe APIs. Only one instance of this client should be created per runtime. Make sure to use the correct credentials when initializing to avoid exceptions.

Request Parameters

|  |  |  |  |
| --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Mandatory (Yes/No)** | **Description** |
| `clientId` | String | Yes | Your unique Client ID for secure communication with PhonePe Payment Gateway. |
| `clientVersion` | Integer | Yes | Your unique Client Version for secure communication with PhonePe Payment Gateway. |
| `clientSecret` | String | Yes | Secret provided by PhonePe. |
| `env` | Env | Yes | Environment for the client: **• PRODUCTION** **• SANDBOX** |

Code Reference

```
using System.Text.Json;
using Microsoft.Extensions.Logging;
using pg_sdk_dotnet;
using pg_sdk_dotnet.Common.Models.Request;
using pg_sdk_dotnet.Common.Models.Request.PaymentModeConstraints;
using pg_sdk_dotnet.Common.Models.Response;
using pg_sdk_dotnet.Common.Utils;
using pg_sdk_dotnet.Payments.v2;
using pg_sdk_dotnet.Payments.v2.Models.Request;
using pg_sdk_dotnet.Payments.v2.Models.Response;

// to log responses from the SDK, initialize the logger
using ILoggerFactory loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddConsole();
        });
ILogger logger = loggerFactory.CreateLogger<ClassName>();
 
string clientId = <clientId>; // insert your client id here
string clientSecret = <clientSecret>; // insert your client secret here
int clientVersion = <clientVersion>; //insert your client version here
 
Env env = Env.SANDBOX; //change to Env.PRODUCTION when you go live
 
StandardCheckoutClient checkoutClient = StandardCheckoutClient.GetInstance(
            clientId,
            clientSecret,
            clientVersion,
            env,
            loggerFactory //null if logs donot want to be printed
        );
```

## What’s Next?

Now that you’ve learned how to initialize the `StandardCheckoutClient` with your credentials to connect securely with PhonePe APIs. Next, you’ll create a payment request to start the transaction and generate the payment link for users.

Head over to Initiate Payment to learn how to start the transcation.
