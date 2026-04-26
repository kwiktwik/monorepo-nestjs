<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/payment-methods/turbo-upi/integrate-noui -->

Use Razorpay Turbo UPI to make UPI payments faster. Follow these steps to integrate with Razorpay Turbo UPI Headless SDK.

Prerequisites

1. Contact our [integrations team](mailto:integrations@razorpay.com)

   to get your mobile number, app, and GitHub account whitelisted to get access to the `https://github.com/upi-turbo/ios-sample-app` - sample app repository. In this repository, you will find the framework files (libraries for Turbo) and the sample app source code to help you with the integration. Use branch `custom_ui/turbo` to access the sample app and frameworks for Turbo UPI. The sample app workspace is divided into Prod and UAT environment targets with separate pod dependencies.
2. Integrate with [Razorpay iOS Custom SDK](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md)   .
3. Add the below line of code to your `Podfile` to install Turbo pods:

   ruby

   copy

   ```ruby
pod 'razorpay-customui-pod'

pod 'razorpay-turbo-pod'
```
4. Import the Turbo plugin as given below:

   swift

   copy

   ```swift
import Razorpay

import TurboUpiPlugin
```

**Watch Out!**

- The minimum supported iOS version for using Turbo UPI is currently 11.0.
- Use the `rzp_test_0wFRWIZnH65uny` API key id for testing on the UAT environment and the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  for prod testing.

## 1. Integration Steps

Follow these steps:

### 1.1 Initialise the Razorpay Checkout

Initialise the SDK and set up the Checkout instance (Razorpay) to handle payment outcomes like success and errors by listening to delegate methods.

SwiftObjective C

copy

```swift
var razorpay = 
RazorpayCheckout.initWithKey("rzp_test_0wFRWIZnH65uny", 
                            andDelegate: self, 
                            withPaymentWebView: wkWebView,
                            plugin: 
RazorpayTurboUPI.pluginInstance())
```

### 1.2 Create a Session Token

To enhance security, you must create a session token via a server-to-server (S2S) call between your backend and Razorpay's backend. This session token ensures secure communication between the Turbo SDK and Razorpay's systems.

#### How to Create a Session Token

1. Trigger the S2S API from your Backend. Use the following API to generate a session token:

   Request Parameters

   customer\_reference

   mandatory

   `string` A unique identifier for the customer provided by the business. The recommended value is mobile number. For example, `9000090000`.

   Response Parameters

   token

   `string` A session token to be used in subsequent session-protected APIs.

   expire\_at

   `long` Expiry time (in seconds) for the session token, used to optimise session handling and reduce unnecessary reinitialisations.

   error

   `object` The request failure due to business or technical failure.
2. Pass the Generated Token to Turbo SDK. Use the session token in the [initialisation step](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods/turbo-upi/integrate-noui.md#13-initialise-turbo-sdk)   , ensuring that it is refreshed upon expiry.

### 1.3 Initialise Turbo SDK

After generating the session token, initialise the Turbo SDK with the session delegate.

Use the initialize(...) method to configure the session.

Swift

copy

```swift
razorpay?
       .upiTurboUI?
       .initialize(sessionDelegate: Any)
```

#### Create/Retry Session Token Mechanism

**Using Delegate Pattern**

To ensure a smooth experience during token expiry, the Turbo SDK provides the `TurboSessionDelegate` interface with a `fetchToken` method. This method dynamically fetches and updates the session token without reinitialising the session.

Initialise the `TurboSessionDelegate` object anonymously and pass it through the initialize method. The SDK will call `fetchToken` as needed and use the provided callback to handle the updated token. This allows you to seamlessly refresh the session by retrieving a new token via a server-to-server (S2S) call.

Below is an example of creating an instance of the `TurboSessionDelegate` interface using an anonymous object expression:

Kotlin

copy

```kotlin
extension ViewController: TurboSessionDelegate {
    func fetchToken(completion: @escaping (Session) -> Void) {
// fetch token here and once fetched,
        // it can be passed back to Turbo SDK using completion delegate 
    completion(Session(token: <new-token>)
    }
}
```

### 1.4 Handle UPI Account Linking and Payment Flow

After initialising the Turbo SDK, proceed to securely link UPI accounts and complete the payment flow

1. You need to link the customer’s UPI account with your app. Use the code samples given below to fetch the UPI account.

   **Watch Out!**

   If the device binding is not completed and `getLinkedUpiAccounts` is triggered, it will return an `OnError` with a `DEVICE_BINDING_INCOMPLETE` error message.

   - Get the customer's linked UpiAccount list using the below code. This function can be called from anywhere in the application, providing multiple entry points for customers to link their UPI account with your app.

     SwiftObjective C

     copy

     ```swift
razorpay?.upiTurbo?.getLinkedUpiAccounts("9000090000", resultDelegate: self)
```

     Request Parameters

     mobile\_num

     `string` The customer's mobile number.

     Delegate

     `object` The Delegate to be sent is of type `UpiTurboResultDelegate`.
   - If your customer has already linked the UPI account, use the following code to fetch it. If there are no linked UPI accounts, an empty list is returned.

     SwiftObjective C

     copy

     ```swift
extension ViewController: UPITurboResultDelegate {
func onSuccessFetchingLinkedAcc(_ accList: [UpiAccount]) {
    if accList.count > 0 {
        print("Success Fetching Accounts")
    } else {
        // call linkNewUpiAccount()
    }
}

func onErrorFetchingLinkedAcc(_ error: TurboUpiPlugin.TurboError?) {
    print("Error: \(error?.errorDescription)")
    print("Error code: \(error?.errorCode)")
}
}
```

   Response Parameters

   onSuccess

   `string` This function is triggered if the list is fetched successfully. `accList` can be empty to indicate that no accounts have been linked yet.

   onError

   `string` This function is triggered in case an error is thrown during the retrieval process, either by the Razorpay SDK or the Bank SDK.
2. If the customer has not linked any UPI account, they can link UPI accounts using the following method:

   - Link one UPI account at a time:
     Use the following code to link the newly created UPI account with your app. This function can be called from anywhere in the application, providing multiple entry points for customers to link their UPI account with your app.

   SwiftObjective C

   copy

   ```swift
self.razorpay?.upiTurbo?.linkNewUpiAccount("9000090000", linkActionDelegate: self)

extension ViewController: UpiTurboLinkAccountDelegate {
func onResponse(_ action: LinkUpiAction) {
    switch action.code {
    case .sendSms:
        guard action.error == nil else {
            return
        }
        action.registerDevice()
    case .selectBank:
        guard action.error == nil else {
            return
        }
        if let banks = action.data as? [UpiBank] {
        let selectedBank = banks[0]
        action.selectedBank(selectedBank)
        }
    case .selectBankAccount:
        guard action.error == nil else {
            return
        }
        if let bankAccounts = action.data as? [UpiBankAccount] {
            let bankAccount = bankAccounts[0]
            action.selectedBankAccount(bankAccount)
        }
    case .setUpiPin:
        let card = UpiCard("last6Digits", "expiry", "cvv")
        action.setUpiPin(bankAccount, card)
    case .linkAccountResponse:
        guard action.error == nil else {
            return
        }
        if let upiAccounts = action.data as? [UpiAccount] {
            //save the upi account response
        }
    default: break
    }
}
}
```

   action

   The current state of customer registration with which you can call further functions. All values for this variable are exposed as an enum for ease of integration. Know more about the [action parameters](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods/turbo-upi/integrate-noui.md#action-parameter-values)   .

   Request Parameters

   mobileNumber

   mandatory

   `string` Customer's mobile number needed to initialise the SDKs.

   linkActionDelegate

   `UpiTurboLinkAccountDelegate` Used as a callback to send a response or failure to you. Given below are the functions:

   - `action.code`: This function denotes that the user registration is incomplete and additional action is required.
   - `action.data`: This function denotes that the user has registered UpiAccounts on the device. It returns a list of UpiAccount objects, which can then be used to show the details on UI.
   - `action.error`: Returns an error object with a description and message relating to a failure in either one of the registration steps or in retrieving the UpiAccount list.

   **Watch Out!**

   If the merchant wants to use the prefetch feature, they need to specifically include a case for prefetch in their code's switch statement. If they do not need prefetching, they can just use a default case in the switch statement to handle all other situations.
3. The **Reward feature** allows you to allocate rewards to users without specific criteria. To avail rewards, you need to configure them from the Dashboard. You can seamlessly integrate this function into your application, providing multiple entry points for users to check their rewards eligibility before completing a payment.

   SwiftObjective C

   copy

   ```swift
razorpay.upiTurbo?.getRewardForCustomer(
    mobileNumber: "9000090000",
    action: RewardAction.payment,
    amount: "10000"?,
    rewardsDelegate: self
)

extension ViewController: UpiTurboCustomerRewardsDelegate {
    
    func onSuccess(_ reward: CustomerReward) {
        
    }
    
    func onFailure(_ error: TurboError?) {
        
    }
}
```

   Request Parameters

   mobileNumber

   mandatory

   `string` The customer's mobile number.

   action

   mandatory

   `RewardAction` This parameter specifies the action to check reward eligibility. Possible values:

   - `onboarding`: To check reward eligibility for Onboarding.
   - `payment`: To check reward eligibility for Payment.

   amount

   optional

   `string` The transaction amount expressed in the currency subunits.

   rewardsDelegate

   mandatory

   `delegate` This parameter allows you to receive callbacks regarding reward eligibility.
4. To process the payments, call the `authorize` method of custom checkout with the provided payload. Upon receiving the `PaymentData` response, you will also receive `rewardStatus` along with the payment response. Please note that the `rewardStatus` key will be present in the response only if your eligible for a reward.

   SwiftObjective C

   copy

   ```swift
let turboPayload: [AnyHashable: Any] = [
"currency": "INR",
"amount": "700",
"email": "gaurav.kumar@example.com",
"contact": "9000090000",
"method": "upi",
"upi": [
    "flow": "in_app"
],
"order_id": "order_L2MUBUOeFItcpU",  //optional
]
turboPayload["upiAccount"] = upiAccount
razorpay?.authorize(turboPayload)

extension ViewController: RazorpayPaymentCompletionProtocol {

func onPaymentSuccess(_ payment_id: String, andData response: [AnyHashable: Any]) {
    let rewardStatus = response["rewardStatus"]
    // show payment success screen with reward if rewarded
}

func onPaymentError(_ code: Int32, description str: String, andData response: [AnyHashable: Any])
{

}
}
```

Request Parameters

amount

mandatory

`integer` The transaction amount expressed in the currency subunit. For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

currency

mandatory

`string` The currency in which the transaction should be made.

email

mandatory

`string` Email address of the customer.

contact

mandatory

`string` Customer's phone number.

order\_id

optional

`string` Order id generated via the [Orders API](/razorpay-docs-md/api/orders.md).

method

mandatory

`string` The payment method used by the customer on Checkout. In this case, it is `upi` (default).

upi

mandatory

`array` Details of the UPI payment.

flow

mandatory

`string` Type of the UPI method. In this case, it is `in_app`.

## Non-Transactional Flows

You can directly interact with the exposed methods of the Turbo Framework to perform the non-transactional flows listed below.

Fetch Balance

Fetch the customer's account balance. Call `getBalance()` on the bank account object received from upiAccount.

SwiftObjective C

copy

```swift
import Razorpay

import TurboUpiPlugin
```0

Change UPI PIN

Provide the customer the ability to change their UPI PIN. Call `changeUpiPin()` on the bank account object received from upiAccount.

SwiftObjective C

copy

```swift
import Razorpay

import TurboUpiPlugin
```1

Reset UPI PIN

Let your customers reset their UPI PIN. Call `resetUpiPin()` on the bank account object received from getLinkedUpiAccounts().

SwiftObjective C

copy

```swift
import Razorpay

import TurboUpiPlugin
```2

Delink UpiAccount

Let your customers delink their UpiAccounts.

DelinkObjective C

copy

```swift
import Razorpay

import TurboUpiPlugin
```3

### Additional Features

To get the device binding status, please use the variable `razorpay.upiTurbo.deviceBindingDone` of type boolean. It indicates whether the device binding, which is a prerequisite for adding UPI accounts, is done with the user's mobile number.

SwiftObjective C

copy

```swift
import Razorpay

import TurboUpiPlugin
```4

Action Parameter Values

Following are the constants that are passed in `action.code` parameter in `onResponse`.

## Models Exposed from the SDKs

The SDKs given below provide access to exposed models for seamless integration.

UpiBankAccount

UpiAccountBalance

UpiAccount

UpiCard

UpiBank

AllBanks

TurboError [Refer to the list of possible error reasons](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods/turbo-upi/error-codes.md).

UpiBankAccountState

Consent

ConsentType enum

PrefetchBank

CustomerReward

Reward

PaymentData

RewardAction

## 2. Test Integration

We recommend the following:

- Complete the integration on UAT before using the prod builds.
- Perform the UAT using the Razorpay-provided API keys.

## 3. Go-live Checklist

Complete these steps to take your integration live:

- You should get your app id whitelisted by Razorpay to test on prod.

  **Handy Tips**

  Contact our [integrations team](mailto:integrations@razorpay.com)

  to get your mobile number and app whitelisted.
- Import the prod library from the GitHub repository → `https://github.com/upi-turbo/ios-sample-app` `custom_ui/turbo` branch.
- Switch to Prod environment and podfile.
- Replace the UAT credential with the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  for prod testing.

For iOS users, outgoing device binding SMS is editable by default. To ensure these SMS messages are non-editable, you must complete the following steps:

### Requesting UPI Device Validation Entitlement

1. Submit a Request on the Apple Developer Portal

- Log in to the [Apple Developer Portal](https://developer.apple.com/contact/request/upi-device-validation)  .
- Fill out the necessary details to request permission for the `setUPIVerificationCodeSendCompletion` API, which allows secure, non-editable content for device registration SMS.
- Await approval from Apple.

2. Submit Details to NPCI

Once Apple approves the entitlement, share the request details with NPCI for their approval. Use the format given below for submitting the details:

- Name of the App:
- Functionality (UPI or CBDC App): UPI
- App ID:
- Team ID:
- Request ID:
- Bundle ID:

3. Follow the Guidelines for Implementation

- Ensure your app supports iOS 17 and above.
- Use the `setUPIVerificationCodeSendCompletion` API to comply with NPCI requirements.
