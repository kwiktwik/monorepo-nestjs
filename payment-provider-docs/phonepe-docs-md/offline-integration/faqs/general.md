<!-- Source: https://developer.phonepe.com/offline-integration/faqs/general -->

# General

---

**Are the Salt Index and Salt key the same?**No, the Salt Index and Salt key are different. Merchant ID can have different salt keys. Each salt key has a unique salt index

**What is Server to Server callback (S2S callback)?**S2S callback is the response posted by PhonePe to the merchant server as soon as the transaction reaches the final state(i.e. Success or Failure

**How to get S2S callback configured?**S2S callbacks can be configured in two ways

**Dynamic S2S Callback â**Â Merchant can provide the callback URL in the header part (i.e. x-callback-URL) of the request while initiating the payment. Merchant can pass different callbacks for different transactions
**Static S2S Callback â**Â Merchants can get a static S2S callback URL configured at PhonePeâs backend

**What are the limitations of S2S callback?**S2S callbacks are sent only if a transaction reaches the terminal state

**Is it mandatory to use S2S callback functionality?**It is optional. If S2S callbacks are not being used, in order to safeguard from any fraudulent activity or tampering, merchants must validate the response via check transaction status API.

**What is Check Payment Status API?**It is used to get the current state of any transaction. Merchant can query PhonePe system to fetch the status of any transaction

**What is the transactionId parameter?**Transaction id is a unique value passed in the payment/refund request in order to track the transaction in later stages. Values should be alpha-numeric and without any spaces and should contain less than 38 characters

**Do we need to use Check Payment Status API to get the status of the transaction if we have already passed x-callback-URL to get the callback from PhonePe server?**Yes. It is used as a fallback option and it gives the current status of the transaction even if it is in a non-final state (ex. PAYMENT\_PENDING).

**What is the difference between PAYMENT\_ERROR and INTERNAL\_SERVER\_ERROR?
\*\***PAYMENT\_ERROR -\*\* It is the final state of the transaction. It simply means that payment is failed and the user/cashier can initiate a new transaction

**INTERNAL\_SERVER\_ERROR âÂ**It is not the final state of the transaction. In this scenario, the merchant system needs to wait until the final state of the transaction (i.e. PAYMENT\_SUCCESS or PAYMENT\_ERROR) is received. Merchant systems can use Check-Payment-Status API in order to get the current status

**How is merchantOrderId different from transactionId?**TransactionId is a unique id for each payment request. However, MerchantOrderId can be the same for multiple payment attempts against particular order in the merchant system

**What is the purpose of using X-Verify?**X-verify is used for authentication purposes. X-verify ensures that the PhonePe has received the authenticated request and the transaction request has not tampered

**What will be the Transaction Status in various scenarios and How should merchants handle them?**Transaction Status will be Payment\_Success if the transaction is completed successfully at Bank/Phonepe. This is the terminal state of the transaction
Transaction Status will be Payment\_Failed if the transaction is failed at Bank/Phonepe. This is the terminal state of the transaction
Transaction Status will be Payment\_Pending if the transaction has not reached either success/failure state at Phonepe because of network issues or processing delay on the bank side. The status can be Pending even if the user has not initiated a transaction. The merchant needs to call check transaction status API to fetch the status of the transaction
*## NOTE: After 15 mins, even if the Transaction has not reached either success/failure state, Phonepe will return Payment\_Failed*

**What is the use of Merchant ID?**Merchant Id is the unique identifier for a merchant at PhonePe level and is created at the time of merchant onboarding

**What will be the length ofTransactionID?**It should be less than 38 characters

**How many times a callback response will be sent on the Callback URL?**If PhonePe does not receive a successful acknowledgment from the merchant server, PhonePe will try sending 2 times until the call back is not received
