<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/payment-methods/turbo-upi/integration-ui-tpv -->

Third-party validation (TPV) of bank accounts is mandatory for businesses in the BFSI (Banking, Financial Services and Insurance) sector that deal with Securities, Brokerage and Mutual Funds. You can accept customer payments using the Turbo UPI UI with TPV SDK. Know more about [how TPV works](/razorpay-docs-md/third-party-validation.md#how-it-works).

**Watch Out!**

To whitelist the customer account, use our S2S [Customer Add Bank Account API](/razorpay-docs-md/api/customers/bank-accounts.md#1-add-bank-account-of-customer). This optional functionality ensures that only pre-approved accounts are displayed to users during the onboarding process, streamlining the experience and enhancing security.

Prerequisites

1. Contact our [integrations team](mailto:integrations@razorpay.com)

   for
   - Whitelisting mobile numbers and app id whitelisted for testing on UAT.
   - Getting access to our sample app `https://github.com/upi-turbo/ios-sample-app` repository.
2. In this repository, you will find the UAT frameworks and the sample app source code to help you with the integration. Use branches inside `ui/tpv/` to access sample app and frameworks for Turbo UPI with UI TPV.
3. Integrate with the [Razorpay iOS Custom SDK](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md)   .
4. Add the following lines to your Podfile for Turbo pod installation:

   ruby

   copy

   ```ruby
pod 'razorpay-customui-pod'

pod 'razorpay-turbo-custom/ui'
```
5. Import the Turbo plugin as given below:

   swift

   copy

   ```swift
import Razorpay
import TurboUpiPluginUI
```

**Watch Out!**

- The minimum supported iOS version for using Turbo UPI is currently 12.0.
- Use the `rzp_test_8UzRYt0d70Ntgz` API key id for testing on the UAT environment and the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  for prod testing.

## 1. Integration Steps

Environment based URLs:

- UAT: `https://api-web-turbo-upi.ext.dev.razorpay.in`
- Production: `https://api.razorpay.com`

Given below are the steps:

Step 1: Whitelist Customer Bank Accounts *(Optional)*

You can whitelist (also known as allowlist) your customer's bank accounts to ensure that only those accounts are considered during customer onboarding. By whitelisting the accounts at the start, you can avoid the bank account linking during payment. Use the Customer APIs to create customers and add their bank account details.

For example, if a customer named Gaurav has two bank accounts, ABC and XYZ, you can use the APIs to create a customer id and link the bank accounts to that id. You can then pass this customer id at the time of payment.

Follow these steps.

1.1: Create a Customer

Use this endpoint to create or add a customer with basic details such as name and contact details.

CurlSuccessFailure

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST {environment_based_url}/v1/customers \
-H "Content-Type: application/json" \
-d '{
    "name": "Gaurav Kumar",
    "contact": "9123456780",
    "email": "gaurav.kumar@example.com",
    "fail_existing": "0",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    }
}'
```

Request Parameters

name

optional

`string` Customer's name. Alphanumeric value with period (.), apostrophe ('), forward slash (/), at (@) and parentheses are allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

email

optional

`string` The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

fail\_existing

optional

`string` Possible values:

- `1` (default): If a customer with the same details already exists, throws an error.
- `0`: If a customer with the same details already exists, fetches details of the existing customer.

gstin

optional

`string` Customer's GST number, if available. For example, `29XAbbA4369J1PA`.

notes

optional

`object` This is a key-value pair that can be used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

Response Parameters

id

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

name

`string` Customer's name. Alphanumeric, with period (.), apostrophe ('), forward slash (/), at (@) and parentheses allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

contact

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

email

`string` The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

gstin

`string` GST number linked to the customer. For example, `29XAbbA4369J1PA`.

notes

`json object` This is a key-value pair that can be used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` UNIX timestamp, when the customer was created. For example, `1234567890`.

1.2: Add Customer's Bank Account

The following endpoint adds the customer's bank accounts.

POST

customers/:customer\_id/bank\_account

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST {environment_based_url}/v1/customers/:customer_id/bank_account \
-H "Content-Type: application/json" \
-d '{
   "ifsc_code" : "UTIB0000194",
   "account_number"         :"916010082985661",
   "beneficiary_name"      : "Gaurav",
   "beneficiary_address1"  : "address 1",
   "beneficiary_address2"  : "address 2",
   "beneficiary_address3"  : "address 3",
   "beneficiary_address4"  : "address 4",
   "beneficiary_email"     : "gaurav.kumar@example.com",
   "beneficiary_mobile"    : "9900990099",
   "beneficiary_city"      :"Bangalore",
   "beneficiary_state"     : "KA",
   "beneficiary_country"   : "IN"
}'
```

Path Parameter

customer\_id

mandatory

`string` Customer id of the customer whose bank account is to be added.

Request Parameters

account\_number

mandatory

`string` Customer's bank account number. For example, `11214311215411`.

beneficiary\_name

mandatory

`string` The name of the beneficiary associated with the bank account.

beneficiary\_address1

optional

`string` The virtual payment address.

beneficiary\_email

optional

`string` Email address of the beneficiary. For example, `gaurav.kumar@example.com`.

beneficiary\_mobile

optional

`string` Mobile number of the beneficiary.

beneficiary\_city

optional

`string` The city of the beneficiary.

beneficiary\_state

optional

`string` The state of the beneficiary.

beneficiary\_country

optional

`string` The country of the beneficiary.

beneficiary\_pin

optional

`integer` The pin code of the beneficiary's address.

ifsc\_code

mandatory

`string` The IFSC of the bank branch associated with the account.

Response Parameters

bank\_accounts

`array` An array containing bank account details.

id

`string` Unique identifier of the bank account.

entity

`string` The type of entity, which in this case is `bank_account`.

ifsc

`string` The IFSC of the bank branch associated with the account.

bank\_name

`string` The name of the bank.

name

`string` The name associated with the bank account.

notes

`object` Set of key-value pairs that can be used to store additional information about the payment.

account\_number

`integer` Customer's bank account number. For example, `0002020000304030434`.

Step 2: Create an Order *(Mandatory)*

Pass the investor bank account details to the `bank_account` array of the Orders API. Given below is the sample code when the `method` is `upi`.

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST {environment_based_url}/v1/orders \
-H "Content-Type: application/json" \
-d '{
   "amount": 500,
   "method": "upi",
   "receipt": "BILL13375649",
   "currency": "INR",
   "bank_account": {
       "account_number": "765432123456789",
       "name": "Gaurav Kumar",
       "ifsc": "HDFC0000053"
   }
}'
```

Request Parameters

amount

mandatory

`integer` The transaction amount expressed in paise (currency supported is INR). For example, for an actual amount of ₹1, the value of this field should be `100`.

currency

mandatory

`string` The currency in which the transaction should be made. You can create orders in **INR** only.

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Maximum length is 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

method

mandatory

`string` The payment method used to make the payment. If this parameter is not passed, investors will be able to make payments using both netbanking and UPI payment methods. Possible values:

- `netbanking`: Investors can make payments only using netbanking.
- `card`: Investors can make payments using debit card.
- `upi`: Investors can make payments only using UPI.

bank\_account

mandatory

`object` Details of the bank account that the investor has provided at the time of registration.

account\_number

mandatory

`string` The bank account number from which the investor should make the payment. For example, `765432123456789` Payments will not be processed for an incorrect account number.

name

mandatory

`string` The name linked to the bank account. For example, `Gaurav Kumar`.

ifsc

mandatory

`string` The bank IFSC. For example, `HDFC0000053`.

Response Parameters

id

`string` Unique identifier of the order.

entity

`string` Indicates the type of entity. Here, it is `order`.

amount

`integer` The order amount represented in the smallest unit of the currency passed. For example, amount = 100 translates to 100 paise, that is ₹1 (default currency is INR).

amount\_paid

`integer` The amount that has been paid.

amount\_due

`integer` The amount that is yet to be paid.

currency

`string` The 3-letter ISO currency code for the payment. Currently, we support INR only.

receipt

`string` A unique identifier of the order entered by the user. For example, `BILL13375649`.

status

`string` The status of the order.

notes

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, "note\_key": "Beam me up Scotty”.

created\_at

`integer` The Unix timestamp at which the order was created.

offer\_id

`string` Unique identifier of the offer.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

Step 3: Turbo UPI with UI SDK Action

To link the customer's UPI account with your app. Use the code samples given below to fetch the UPI account.

3.1 Initialise the SDK

Use the code given below to initialise the SDK.

Initialise the SDK and set up the Checkout instance (Razorpay) to handle payment outcomes like success and errors by listening to delegate methods.

SwiftObjective C

copy

```swift
var razorpay: RazorpayCheckout? // Globally declare
let wkWebView = WKWebView(frame: self.view.frame) // configure your webview
razorpay = RazorpayCheckout.initWithKey( "YOUR_KEY_ID",
    andDelegate: self, withPaymentWebView: wkWebView, UIPlugin: RZPTurboUPI.UIPluginInstance)
```

3.2 Create a Session Token

To enhance security, you must create a session token via a server-to-server (S2S) call between your backend and Razorpay's backend. This session token ensures secure communication between the Turbo SDK and Razorpay's systems.

#### How to Create a Session Token

1. Trigger the S2S API from your Backend. Use the following API to generate a session token:

Authorization Header Creation: `Base64.encode(${public_key}:${secret})`

Request Parameters

customer\_reference

mandatory

`string` A unique identifier for the customer provided by the business. The recommended value is mobile number. For example, `9000090000`

Response Parameters

token

`string` A session token to be used in subsequent session-protected APIs.

expire\_at

`long` Expiry time (in seconds) for the session token, used to optimise session handling and reduce unnecessary reinitialisations.

error

`object` The request failure due to business or technical failure.

1. Create/Retry Session Token Mechanism

**Using Delegate Pattern**

To ensure a smooth experience during token expiry, the Turbo SDK provides the `TurboSessionDelegate` interface with a `fetchToken` method. This method dynamically fetches and updates the session token without reinitialising the session.

Initialise the `TurboSessionDelegate` object anonymously and pass it through the initialize method.

SwiftObjective C

copy

```swift
self.razorpay?.upiTurboUI?.initialize(self)
```

The SDK will call `fetchToken` as needed and use the provided callback to handle the updated token. This allows you to seamlessly refresh the session by retrieving a new token via a server-to-server (S2S) call.

Below is an example of creating an instance of the `TurboSessionDelegate` interface using an anonymous object expression:

SwiftObjective C

copy

```swift
extension ViewController: TurboSessionDelegate {
      func fetchToken(completion: @escaping (Session) -> Void) {
      // Fetch token here and once fetched,
      // it can be passed back to Turbo SDK using the completion delegate
        completion(Session(token: "<new-token>"))
      }
  }
```

3.3 Link New UPI Account

Use the following code to link the newly created UPI account with your app. This function can be called from anywhere in the application, providing multiple entry points for customers to link their UPI account with your app.

### Parameter Combinations

#### Using Order ID

When calling the `linkNewUpiAccount` function with an `OrderId`, the TPV process is initiated for linking whitelisted accounts. Ensure that TPV bank account details are not provided in this case.

#### Using Customer ID with TPV Bank Account

When calling the `linkNewUpiAccount` function with a `CustomerId`, you must also include TPV bank account details. This links the specific whitelisted account associated with that user.

#### Restrictions

- **Order ID and Customer ID**: Do not pass both `OrderId` and `CustomerId` simultaneously in the `linkNewUpiAccount` function. Choose one based on your use case.
- **Order ID and TPV Bank Account**: Do not pass `OrderId` and `TPV bank account` details together. Use either one.
- **TPV Bank Account without Customer ID or Order ID**: TPV bank account details cannot be provided without a `CustomerId`.

These combinations ensure proper functionality and avoid conflicts during the UPI account linking process.

- Using Order Id and Mobile Number

SwiftObjective C

copy

```swift
self.razorpay?.upiTurboUI?.TPV?
    .setMobileNumber(mobile: "YOUR_MOBILE_NUMBER")
    .setOrderId(orderId: "YOUR_ORDER_ID")
    .linkNewUpiAccountWithUI(color: "#0000FF", completionHandler: 
    { upiAccounts, error in
        guard error == nil else {
            let error = error as? TurboError
            // handle error
            return
        }
        guard let vpaAccounts = upiAccounts as? [UpiAccount] 
        else {
            return
         }
     // handle UPI Account Response here and save it globally in this file for further usage.
 })
```

- Using Customer Id and TPV Bank Account

SwiftObjective C

copy

```swift
self.razorpay?.upiTurboUI?.TPV?
    .setMobileNumber(mobile: "YOUR_MOBILE_NUMBER")
    .setCustomerId(customerId: "YOUR_CUSTOMER_ID")
    .setTpvBankAccount(tpvBankAccount: "TPV_BANK_ACCOUNT")
    .linkNewUpiAccountWithUI(color: "#0000FF", completionHandler: 
    { upiAccounts, error in
        guard error == nil else {
            let error = error as? TurboError
            // handle error
            return
        }
        guard let vpaAccounts = upiAccounts as? [UpiAccount] 
        else {
            return
         }
     // handle UPI Account Response here and save it globally in this file for further usage.
 })
```

Request Parameters

customerMobile

mandatory

`string` A unique identifier for the customer provided by the business. The recommended value is mobile number. For example, `9000090000`

customer\_id

`string` The CustomerId will be used for fetching the TPV whitelisted bank accounts when the OrderId is not provided.

order\_id

`string` The OrderId to be used for fetching the TPV whitelisted bank account for the order.

tpvBankAccount

`object` This object type `TurboTPVBankAccount` will contain the bank account that the user selected in the onboard flow.

3.4 Authorize Method

To accept payments, call Custom Checkout’s `authorize` method with the following payload:

SwiftObjective C

copy

```swift
import Razorpay
import TurboUpiPluginUI
```0

Request Parameters

turboPayload

mandatory

`dictionary` Payload for initiating the transaction.

Response Parameters

onSuccess

This function is triggered if the list is fetched successfully. accList can be empty to indicate that no accounts have been linked yet.

onFailure

This function is triggered in case an error is thrown during the retrieval process, either by the Razorpay SDK or the Bank SDK.

Steps 4: Store Fields in Your Server

A successful payment returns the following fields to the Checkout form.

- You need to store these fields in your server.
- You can confirm the authenticity of these details by verifying the signature in the next step.

Success Callback

copy

```swift
import Razorpay
import TurboUpiPluginUI
```1

Response Parameters

razorpay\_payment\_id

`string` Unique identifier for the payment returned by Checkout **only** for successful payments.

razorpay\_order\_id

`string` Unique identifier for the order returned by Checkout.

razorpay\_signature

`string` Signature returned by the Checkout. This is used to verify the payment.

Step 5: Verify Signature

This is a mandatory step to confirm the authenticity of the details returned to the Checkout form for successful payments.

To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:

   - `order_id`: Retrieve the `order_id` from your server. Do not use the `razorpay_order_id` returned by Checkout.
   - `razorpay_payment_id`: Returned by Checkout.
   - `key_secret`: Available in your server. The `key_secret` that was generated from the [Dashboard](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)     .
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `order_id` to construct a HMAC hex digest as shown below:

   HMAC Hex Digest

   copy

   ```swift
import Razorpay
import TurboUpiPluginUI
```2
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```swift
import Razorpay
import TurboUpiPluginUI
```3

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).

### Get Linked Accounts

If your customer has already linked the UPI account, use the following code to fetch it. If there are no linked UPI accounts, an empty list is returned

**Watch Out!**
If the device binding is not completed and `getLinkedUpiAccounts` is triggered, it will return a `Device Binding Not Done` error message.

- You can retrieve the list of UPI accounts linked to a customer's mobile number using the following code. This function can be invoked from any part of the application, offering multiple entry points for customers to manage their UPI accounts.

SwiftObjective C

copy

```swift
import Razorpay
import TurboUpiPluginUI
```4

- Implement the delegate methods to handle the response for fetching linked UPI accounts. Below is an example:

SwiftObjective C

copy

```swift
import Razorpay
import TurboUpiPluginUI
```5

### Non-Transactional Flow

You can directly interact with the exposed methods of the Turbo Framework to perform the non-transactional flows listed below.

Manage UPI Accounts

Let Razorpay SDK manage the linked UpiAccounts on the applications by triggering `manageUpiAccounts()`.

SwiftObjective C

copy

```swift
import Razorpay
import TurboUpiPluginUI
```6

### Additional Features

To get the device binding status, please use the variable `razorpay.upiTurbo.deviceBindingDone` of type boolean. It indicates whether the device binding, which is a prerequisite for adding UPI accounts, is done with the user's mobile number.

SwiftObjective C

copy

```swift
import Razorpay
import TurboUpiPluginUI
```7

### Models Exposed from the SDKs

The SDKs provide access to exposed models for seamless integration.

UpiAccount

UpiBankAccount

UpiBank

TurboError [Refer to the list of possible error reasons](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods/turbo-upi/error-codes.md).

TurboTPVBankAccount

## 2. Test Integration

We recommend the following:

- Complete the integration on UAT before using the prod builds.
- Perform the UAT testing using the Razorpay-provided API keys.

## 3. Go-live Checklist

Complete these steps to take your integration live:

- You should get your app id whitelisted by Razorpay to test on prod.

  **Handy Tips**

  Contact our [integrations team](mailto:integrations@razorpay.com)

  to get your mobile number and app whitelisted.
- Replace the UAT credential with the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  for prod testing.
