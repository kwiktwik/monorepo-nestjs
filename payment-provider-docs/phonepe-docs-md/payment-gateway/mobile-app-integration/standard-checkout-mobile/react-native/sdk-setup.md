<!-- Source: https://developer.phonepe.com/payment-gateway/mobile-app-integration/standard-checkout-mobile/react-native/sdk-setup -->

# React Native SDK Setup

---

This section explains how to integrate the PhonePe Payment Gateway with the React Native platform. We provide a plugin/bridge to help you integrate our SDK to your app. The implementation involves three steps:

- [Add the Plugin to the React Native project.](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/react-native/sdk-setup.md#nav-1-add-the-plugin-to-the-react-native-project)
- [Add the native configuration (Android/iOS).](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/react-native/sdk-setup.md#nav-1-add-the-plugin-to-the-react-native-project)
- [Integrate the Plugin to the React Native project.](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/react-native/sdk-setup.md#nav-3-integrating-plugin-in-react-native-project-app)

## Prerequisite

The minimum supported versions of React Native are:

- ****React-Native Version: 0.72.3****
- ****Latest React-Native SDK Version: 3.1.1****

## Integrate React SDK

Follow the sequence below to integrate the React Native SDK.

- Add Plugin in React-Native Project/App.
- Android â Add the native configuration in the Android Studio project.
- iOS â Add the native configuration in the Xcode project.
- Integrating Plugin in React-Native Project/App.
  - Init Method.
  - Start Transaction.
- Server Side Implementation.

## 1. Add the Plugin to the React Native project.

- Add PhonePe Payment Dependency in React-Native project , go to root folder and install âreact-native-phonepe-pgâ in node\_modules.

Install React Native PhonePe PG

```
npm i react-native-phonepe-pg -f
npm i -f
```

## 2. Add the native configuration (Android/iOS)

## 2.1 Android

### **Add the native configuration in the Android Studio project**

- Add the below code to ârepositoriesâ section of your project level build.gradle file

Top-level build file where you can add configuration options common to all sub-projects/modules.

```
allprojects { 
   repositories { 
      google() 
      maven { 
         url "https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android" 
      } 
   } 
}
```

- **Build/Sync gradle:**
  - Go to the android folder inside your app & sync/build gradle (by typing ./gradlew build on the command line/ terminal)

## 2.2 iOS

### **Add the native configuration in the Xcode project**

- In your Info.plist under the iOS Xcode project, create or append a new Array type nodeÂ **LSApplicationQueriesSchemes**Â to append the following values.

Add the new Array

```
<key>LSApplicationQueriesSchemes</key> 
<array> 
   <string>ppemerchantsdkv1</string>  
   <string>ppemerchantsdkv2</string> 
   <string>ppemerchantsdkv3</string>
   <string>paytmmp</string>
   <string>gpay</string> 
</array>
```

![](https://wordpress-cms.phonepe.com/phonepe-dev-docs-2/wp-content/uploads/sites/93/2025/07/ios-sdk-pgv2-1-5.png)

![](https://wordpress-cms.phonepe.com/phonepe-dev-docs-2/wp-content/uploads/sites/93/2025/07/ios-sdk-pgv2-1-5.png)

- Create a URLType for your app (Deeplink), if not already present.
  - For example, we have used:Â **iOSIntentIntegration**. (You can create your own identifier for your app)

![](https://wordpress-cms.phonepe.com/phonepe-dev-docs-2/wp-content/uploads/sites/93/2025/07/ios-sdk-pgv2-2-6.png)

![](https://wordpress-cms.phonepe.com/phonepe-dev-docs-2/wp-content/uploads/sites/93/2025/07/ios-sdk-pgv2-2-6.png)

â¹ï¸ ****URLScheme Validation conditions !****

---

- Only Alphabets (lower and upper case) and numbers are allowed.
- We can allow special characters only like dot(.) and (-)
- The name should always start with alphabets.

The schema should be correct to redirect the app otherwise it will not redirect back to the merchant app.

- For iOS dependency

Install

```
cd ios 
pod install
```

- For Monitoring Transaction State and getting callback from the PhonePe consumer app, add these lines in yourÂ **AppDelegate.m**, insideÂ **openURL:(NSURL \*) url**

add in your appdelegate.m

```
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options 
{ 
  NSMutableDictionary *userInfo = [[NSMutableDictionary alloc] init]; 
  [userInfo setObject:options forKey:@"options"];    
  [userInfo setObject:url forKey:@"openUrl"]; 
  [[NSNotificationCenter defaultCenter] postNotificationName: @"ApplicationOpenURLNotification" object:nil userInfo:userInfo]; 
  return YES; 
}
```

## 3. Integrating Plugin in React-Native Project/App

- import the package in your js/typescript code.

import package

```
import PhonePePaymentSDK from 'react-native-phonepe-pg'
```

- Call the PhonePe methods as below:

## 3.1 Init Method

Initialize the init method before starting the transaction.

init method

```
/**
  * This method is used to initiate PhonePe Payment sdk.
  * Provide all the information as requested by the method signature.
  * Params:
  *    - environment: This signified the environment required for the payment sdk
  *      possible values: SANDBOX or PRODUCTION
  *      if any unknown value is provided, PRODUCTION will be considered as default.
  *    - merchantId: The merchant id provided by PhonePe  at the time of onboarding.
  *    - flowId : An alphanumeric string without any special character. It acts as a common ID b/w
  *      your app user journey and PhonePe SDK. This helps to debug prod issue.
  *      Recommended - Pass user-specific information or merchant user Id to track the journey.
  *    - enableLogging: If you want to enable / visualize sdk log
  *        - enable = TRUE
  *        - disable = FALSE     
  *    - Return: Boolean (TRUE -> SUCCESS).
  *        - SUCCESS: TRUE
  *        - FAILURE: FALSE
  *            - in iOS = False (if AppID missing:-Please provide PhonePe AppId)
  *            - in Android = Error in case of invalid arguments ex: "Invalid environment or merchantId!" 
  */

init(
  environment: string,
  merchantId: string,
  flowId: string,
  enableLogging: boolean | false,
): Promise<any>;

Example:

PhonePePaymentSDK.init(
  environmentDropDownValue,
  merchantId,
  flowId,
  true
).then(result => {
  setMessage("Message: SDK Initialisation ->" + JSON.stringify(result));
}).catch(error => {
  setMessage("error:" + error.message);
})
```

## 3.2 Start Transaction

Initiate PhonePe Transaction Flow

```
/**
  * This method is used to initiate PhonePe Transaction Flow
  * Provide all the information as requested by the method signature.
  * Params:
  *    - request : The request body for the transaction as per the developer docs.
  *    - appSchema: @Optional(Not need for Android) For iOS, Your custom URL Schemes, as per the developer docs.
  * Return: Will be returning a dictionary / hashMap
  *  { 
  *     status: String, // string value to provide the status of the transcation
  *                     // possible values: SUCCESS, FAILURE, INTERRUPTED
  *     error: String   // if any error occurs
  *  }
  */

startTransaction(
  request: string,
  appSchema: string | null
): Promise<any>;

Example:

PhonePePaymentSDK.startTransaction(
  requestBody,
  callbackURL
).then(a => {
  setMessage(JSON.stringify(a));
}).catch(error => {
  setMessage("error:" + error.message);
})
```

iOS SDK Initialization Parameters

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| `environment` | Enum | Possible Values: **â¢** SANDBOX **â¢** PRODUCTION |
| `merchantId` | String | The merchant Id provided by PhonePe PG |
| `flowId` | String | Pass the merchant user Id or the unique string (UUID().uuidString) for every init for analytics purposes |
| `enableLogging` | Boolean | [Optional Parameter] **â¢** **TrueÂ**(To enable the SDK logs) **â¢** **False**Â (To disable the SDK logs) **Note:** In Prod, make sure to set as False. |
| `request` | String | The request for the payment initiation **Note**: Refer toÂ **Step 3**Â underÂ **Server Side Implementation** |
| `appSchema` | String | [**Only for iOS**]Your App URL Scheme to return the UI control back to the merchant app. |

## Server Side Implementation

- **Fetch Auth Token**
  - Check whether the valid Auth Token is present already. If not, theÂ [Fetch Auth Token API](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/api-reference/authorization.md)Â should be called to get the valid Auth Token.

- **Call the Create Order API**
  - CallÂ [Create Order API](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/api-reference/create-order-token.md)Â for Order creation with the valid Auth Token, by passing the required details. PhonePe backend will pass the Order Token in response.

- **Construct the JSON request body**
  - Construct the JSON request body as per the payment flow and pass the JSON payload as STRING in theÂ **startTransaction**Â method.

For Standard Checkout

```
//Sample Request:

Map payload = {
  "orderId": <orderId>,
  "merchantId": <merchantId>,
  "token": <token>,
  "paymentMode": {
    "type": "PAY_PAGE"
  }
};

String request = jsonEncode(payload);
print("Payment Request: $request");
```

Request Parameters

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| `orderId` | String | The PhonePe generatedÂ **orderId**Â received in the Create Order API response. |
| `merchantId` | String | Merchant ID provided by the PhonePe Team. |
| `token` | String | The Order Token received in the Create Order API response. |
| `paymentMode.type` | String | For Standard Checkout, value should be PAY\_PAGE |

- **Check the payment status**
  - Once the payment is completed, check the backend server if the [Webhook](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/webhook-handling.md) has been received or not.
    - If not, call the [Order Status API](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/api-reference/check-order-status.md) to fetch the current payment status.
    - If the status is terminal status like: COMPLETED or FAILED, the the order status can be updated accordingly.
    - If incase, the status is PENDING, then call the Order Status API at regular intervals like every 15 secs or 30 secs or 1min once till the terminal status is reached.

## Sample App

- React Native Sample App âÂ <https://github.com/PhonePe/pg-sdk-react-native-sample>

### Whatâs Next?

You have completed setting up the React- Native SDK in your app. Next, letâs learn how to use the APIs, starting with generating the Authorization token.

Head over to the next section to learn how to Generate Authorization Token.
