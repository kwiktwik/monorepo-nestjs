<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/net-backend-sdk/net-sdk-reference/initiate-payment -->

# Initiate Payment with .NET SDK

---

The Initiate Payment step allows you to start a payment transaction by creating a payment request with essential details like order ID, amount, and redirect URL. This request prepares the transaction on PhonePe’s platform and generates a redirect URL where users complete their payment securely.

## Request

Use `StandardCheckoutPayRequest.builder()` to create the payment request. Below are the key attributes you can set:

|
|  |
| **Paramters** | **Type** | **Mandatory** | **Description** | **Constraints** |
| `amount` | `Long` | Yes | Order amount in Paisa | Minimum amount should be 100 Paisa |
| `merchantOrderId` | `String` | Yes | The unique order ID assigned by the merchant | Length should be less than 63 characters.  No special characters allowed except underscore “\_” and hyphen “-“ |
| `metaInfo` | `Object` | No | Meta information is defined by you to store additional information. The same data will be returned in status and callback response. |  |
| `metaInfo.udf1-15` | `String` | No | Optional details you can add for more information. | Maximum length = 256 characters |
| `redirectUrl` | `String` | No | URL where user will be redirected after success/failed payment. |  |

Sample Request

```
using pg_sdk_dotnet.Common.Models;

var redirectUrl = "https://www.merchant.com/redirect";
var prefiled = PrefillUserLoginDetails.Builder()
                    .SetPhoneNumber("<PhonepeNumber>")
var metaInfo = MetaInfo.Builder()
                    .SetUdf1("udf1")
                    .SetUdf2("udf2") // upto 15 udf's can be passed
                    .Build();
  
var merchantOrderID = Guid.NewGuid().ToString();
 
var payRequest = StandardCheckoutPayRequest.Builder()
            .SetMerchantOrderId(merchantOrderID)
            .SetAmount(100)
            .SetPrefillUserLoginDetails(prefiled)
            .SetRedirectUrl(redirectUrl)
            .SetExpireAfter(300)
            .SetMetaInfo(metaInfo)
            .Build();
 
StandardCheckoutPayResponse response = await checkoutClient.Pay(payRequest);
logger.LogInformation("Pay API Response:\n{Response}", JsonSerializer.Serialize(response, JsonOptions.IndentedWithRelaxedEscaping));
```

## Response

The function returns a `StandardCheckoutPayResponse` object with the following properties:

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| `state` | `String` | State of the order. Expected value is PENDING. |
| `redirectUrl` | `String` | The url for the PG Standard Checkout (merchant is supposed to redirect user to complete payment) |
| `orderId` | `String` | Order Id created by PhonePe |
| `expireAt` | `Long` | Order expire date in epoch |

## What’s Next?

After using the pay method to initiate a payment via the PhonePe PG, you can create a payment request and start the payment process. The next step is to create the order SDK.

Proceed to the next section to learn how to Create Order SDK .
