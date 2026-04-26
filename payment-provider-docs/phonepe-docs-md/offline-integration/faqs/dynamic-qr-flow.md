<!-- Source: https://developer.phonepe.com/offline-integration/faqs/dynamic-qr-flow -->

# Dynamic QR Flow

---

**What is Dynamic QR?**Dynamic QR solution enables our partners to generate unique QR codes for each payment request. This QR code then can be scanned by the customer in order to complete the transaction. For scanning and paying, the customer can use any app.

**Can we scan the Dynamic QR twice?**If payment has been initiated by the customer then this QR code can not be scanned again even if the transaction was unsuccessful during the first attempt. So, the cashier needs to generate a new QR code and has to ask the customer to try again. Also, the customer needs to respond within the time limit passed in the expiresIn parameter.

**Can we use special characters in the Transaction ID?**
Generating transactionId with special characters is not advised, since most of the UPI Apps block special characters present in UPI Intent.
Hence we only suggest using underscore “\_” and hyphen “-“, which is supported by all PSP, and avoid other special characters like Slash “/”, Question Mark “?” and even space “ “ in the transaction ID.
Valid transaction ID= TX\_345678-12-2024
Invalid transaction ID = TX46RT\*/12/2024, REFYH 1234

**What is the difference between Dynamic QR and Static QR?**

|  |  |
| --- | --- |
| **Dynamic QR** | **Static QR** |
| A unique QR code is generated for every transaction | Same QR code is scanned by customers for different transactions |
| On scanning, the amount is pre-populated on the screen and the customer only needs to complete the transaction | After scanning, the customer needs to enter the amount and then he needs to complete the transaction |
| Bill closure can be done via API calls | Bill closure is done manually by cashiers |

**What is the transactionId parameter?**A unique value is passed in this parameter in order to track the transaction at the later stages. Values should be alpha-numeric and without any spaces and should contain less than 38 characters. If a value is passed which is already stored in the PhonePe server then the server will give you a 417-expectation error response code (INVALID\_TRANSACTION\_ID, msg: duplicate transaction id).

**What would be the length of the transaction ID ?**
The length of the transaction ID can be decided by the merchant but should be less than 35 characters. We recommend using transaction length between 20-30 characters.

**Briefly explain about the amount parameter in the request payload ?**
The “amount” in the request payload should be in Paise format and accepts LONG type. So if you are passing Amount=100 on payload, it will generate a DQR of 1.00 Rs (not 100Rs). Suggesting merchants to multiply the amount parameter with 100 while sending in the DQR request. Example amount= request.getParameter(amount) \* 100;

**Briefly explain about the ExpiresIn parameter in the request payload ?**
Answer: ExpiresIn parameter is in seconds format and accepts LONG type. When a DQR call is made by passing expiresIn=60, the DQR generated would be valid for 60 seconds and the end user can pay on the QR within the time frame. Post 60 seconds, the generated QR will no longer be valid and shows REQUEST\_EXPIRED error message through callback response & StatusCheck API

**What is the maximum limit of DQR expiry ?**
The maximum limit for the DQR expiry is 1 month. As our expiresIn parameter is in “seconds” format so the merchant can pass the value accordingly. For example: If a merchant wished to keep the generated DQR valid for 24hours he can pass the value as 86400 under expiresIn parameter.

**What are the basic payment responses by StatusCheck API and Callback API when a transaction being performed?**
**Payment\_Success**: When the customer makes a successful payment from his UPI app, then the merchant would get the transaction response by either implementing our StatusCheck API ( as a backend schedular) or through his Callback API ( Server to Server communication). The callback response would be in Base64 encoded format.
**Payment\_Failed**: When the customer makes a payment from his UPI app and the transaction gets failed, then the merchant would get the transaction response by either implementing our StatusCheck API ( as a backend schedular) or through his Callback API ( Server to Server communication). The callback response would be in Base64 encoded format.
**Payment\_Pending**: When the customer makes a payment from his UPI app and the transaction goes into Pending state. In this case the merchant have to wait for the final response which could be Success or Failed callback.
**Payment\_Expired**: When the customer proceeds to make a payment on the QR which already got expired, in this case the merchant would get the REQUEST\_EXPIRED response either through our StatusCheck API ( as a backend schedular) or through our Callback API ( Server to Server communication). The callback response would be in Base64 encoded format.

**What is the use of X-Provider-Id in the request header and who will generate it?**
The merchants who treat themselves as a POS provider or a Vending machine manufacturer and wished to get onboarded as a Provider for all his customers (sub-merchants), for those we are creating a ProviderID and treating them as a Provider at Phonepe. All the Merchant IDs will be mapped to the X-Provider-ID. X-Provider-ID will be provided by PhonePe at the time of onboarding.

**What is Check Payment Status API?**It is used to get the current state of any transaction with the help of transactionId

**What is the role of MerchantOrderID inside the QR Init API request payload ?**
Answer: MerchantOrderID refers to the orderID against which a Dynamic QR gets generated. This is not a unique value parameter and can be repeated/duplicated for multiple DQR Inits.

**Do we need to use Check Payment Status API to get the status of the transaction if we have already passed x-callback-URL to get the callback from the PhonePe server?**Yes. It is used as a fallback option and it gives the current status of the transaction even if it is in a non-final state (ex. PAYMENT\_PENDING).

**What is the difference between PAYMENT\_ERROR and INTERNAL\_SERVER\_ERROR?
\*\***PAYMENT\_ERROR** – It is the final state of the transaction. It simply means that payment is failed and the cashier can initiate a new transaction and ask the customer to try again. No waiting period to mark the transaction as failed**INTERNAL\_SERVER\_ERROR
\*\* It is a non-final state of the transaction. In this scenario, the cashier needs to wait until he gets any final state of the transaction (i.e. PAYMENT\_SUCCESS or PAYMENT\_ERROR). The Cashier can use Check-Payment-Status API in order to get the current status.

**Can my customer pay via any other UPI app using the collect flow?**
Yes, customer can pay via any UPI app
