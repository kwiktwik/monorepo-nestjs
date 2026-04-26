<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/java-be-sdk/sdk-reference-java/initiate-payment -->

# Initiate Payment with Java SDK

---

The Initiate Payment step allows you to start a payment transaction by creating a payment request with essential details like order ID, amount, and redirect URL. This request prepares the transaction on PhonePe’s platform and generates a redirect URL where users complete their payment securely.

## Request

Use `StandardCheckoutPayRequest.builder()` to create the payment request. Below are the key attributes you can set:

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Mandatory** **(Yes/No)** | **Description** | **Constraints** |
| `merchantOrderId` | String | Yes | Unique order ID assigned by you | Max length: 63 characters, no special characters except “\_” and “-” |
| `amount` | Long | Yes | Order amount in paisa | Minimum value: 100 (in paisa) |
| `metaInfo` | Object | No | Meta information is defined by you to store additional information. The same data will be returned in status and callback response. |  |
| `redirectUrl` | String | No | URL where user will be redirected after success/failed payment. |  |
| `paymentModeConfig` | Object | No | Used to dynamically enable only specific instruments on the checkout page. |  |
| disablePaymentRetry | Boolean | No | Setting this field to true will disable retries on standard checkout payment page. |  |
| expireAfter | Long | No | Set a orders expiry time in seconds. |  |

Sample Request

```
import java.util.UUID;
import com.phonepe.sdk.pg.Env;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.payments.v2.models.request.StandardCheckoutPayRequest;
import com.phonepe.sdk.pg.payments.v2.models.response.StandardCheckoutPayResponse;
import com.phonepe.sdk.pg.common.models.MetaInfo;
 
String clientId = "<clientId>";
String clientSecret = "<clientSecret>";
Integer clientVersion = clientVersion;  //insert your client version here
Env env = Env.SANDBOX;      //change to Env.PRODUCTION when you go live
 
StandardCheckoutClient client = StandardCheckoutClient.getInstance(clientId, clientSecret,
        clientVersion, env);
 
String merchantOrderId = UUID.randomUUID().toString();
long amount = 100;
String redirectUrl = "https://redirectUrl.com";
MetaInfo metaInfo = MetaInfo.builder()
            .udf1("udf1")
            .udf2("udf2")
            .udf3("udf3")
            .udf4("udf4")
            .udf5("udf5")
PrefillUserLoginDetails prefillUserLoginDetails = PrefillUserLoginDetails.builder()
        .phoneNumber("<PhonepeNumber>")
            .build();
 
StandardCheckoutPayRequest standardCheckoutPayRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amount)
        .metaInfo(MetaInfo.builder().udf1("udf1").udf2("udf2").build())
        .redirectUrl(redirectUrl)
        .disablePaymentRetry(true)
        .paymentModeConfig(PaymentModeConfig.builder()
                .enabledPaymentModes(List.of(
                        CardPaymentModeConstraint.builder().cardTypes(Set.of(CardType.CREDIT_CARD)).build(),
                        UpiCollectPaymentModeConstraint.builder().build(),
                        UpiQrPaymentModeConstraint.builder().build()
                ))
                .build())
        .message("Message that will be visible in collect message")
        .prefillUserLoginDetails(prefillUserLoginDetails)
        .expireAfter(3600L)
                .build();
 
StandardCheckoutPayResponse standardCheckoutPayResponse = client.pay(standardCheckoutPayRequest);
String checkoutPageUrl = standardCheckoutPayResponse.getRedirectUrl();
```

Example using `paymentModeConfig`:
Pass either `enabledPaymentModes` or `disabledPaymentModes` in the request. Avoid setting both, as doing so will result in an error.
The following example demonstrates usage with only `enabledPaymentModes`.

Sample Request

```
import java.util.UUID;
import com.phonepe.sdk.pg.Env;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.payments.v2.models.request.StandardCheckoutPayRequest;
import com.phonepe.sdk.pg.payments.v2.models.response.StandardCheckoutPayResponse;
import com.phonepe.sdk.pg.common.models.MetaInfo;
import com.phonepe.sdk.pg.payments.v2.models.request.PaymentModeConfig;
import com.phonepe.sdk.pg.common.models.request.paymentmodeconstraints.CardPaymentModeConstraint;
import com.phonepe.sdk.pg.common.models.request.paymentmodeconstraints.CardType;
import com.phonepe.sdk.pg.common.models.request.paymentmodeconstraints.NetBankingPaymentModeConstraint;
import com.phonepe.sdk.pg.common.models.request.paymentmodeconstraints.PaymentModeConstraint;
import com.phonepe.sdk.pg.common.models.request.paymentmodeconstraints.UpiCollectPaymentModeConstraint;
import com.phonepe.sdk.pg.common.models.request.paymentmodeconstraints.UpiIntentPaymentModeConstraint;
import com.phonepe.sdk.pg.common.models.request.paymentmodeconstraints.UpiQrPaymentModeConstraint;


String clientId = "<clientId>";
String clientSecret = "<clientSecret>";
Integer clientVersion = clientVersion; //insert your client version here
Env env = Env.SANDBOX; //change to Env.PRODUCTION when you go live

StandardCheckoutClient client = StandardCheckoutClient.getInstance(clientId, clientSecret,
    clientVersion, env);

String merchantOrderId = UUID.randomUUID().toString();
long amount = 100;
String redirectUrl = "https://redirectUrl.com";
MetaInfo metaInfo = MetaInfo.builder()
    .udf1("udf1")
    .udf2("udf2")
    .udf3("udf3")
    .udf4("udf4")
    .udf5("udf5")
    .build();

Set < CardType > allowedCardTypes = new HashSet < > ();
allowedCardTypes.add(CardType.DEBIT_CARD);
allowedCardTypes.add(CardType.CREDIT_CARD);
PaymentModeConstraint cardPaymentModeConstraint = CardPaymentModeConstraint.builder()
    .cardTypes(allowedCardTypes)
    .build();
PaymentModeConstraint netbanking = NetBankingPaymentModeConstraint.builder().build();
PaymentModeConstraint upiIntent = UpiIntentPaymentModeConstraint.builder().build();
PaymentModeConstraint upiQr = UpiQrPaymentModeConstraint.builder().build();
PaymentModeConstraint upiCollect = UpiCollectPaymentModeConstraint.builder().build();
PaymentModeConfig paymentModeConfigEnabled = PaymentModeConfig.builder()
    .enabledPaymentModes(Arrays.asList(cardPaymentModeConstraint, netbanking, upiIntent, upiQr))
    .build();

StandardCheckoutPayRequest standardCheckoutPayRequest = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(amount)
    .redirectUrl(redirectUrl)
    .metaInfo(metaInfo)
    .paymentModeConfig(paymentModeConfigEnabled)
    .message("Message that will be visible in collect message")
    .expireAfter(3600L)
    .build();

StandardCheckoutPayResponse standardCheckoutPayResponse = client.pay(standardCheckoutPayRequest);
String checkoutPageUrl = standardCheckoutPayResponse.getRedirectUrl();
```

## Response

The function returns a `StandardCheckoutPayResponse` object with the following properties:

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| `orderId` | String | Order Id created by PhonePe. |
| `state` | String | State of the order. Initially it will be PENDING. |
| `expireAt` | Long | Order expiry timestamp in epoch format. |
| `redirectUrl` | String | URL for the PhonePe Payment Gateway Standard Checkout page. This is the URL to which the user should be redirected for payment. |

## What’s Next?

After using the pay method to initiate a payment via the PhonePe PG, you can create a payment request and start the payment process. The next step is to create the order SDK.

Proceed to the next section to learn how to Create Order SDK .
