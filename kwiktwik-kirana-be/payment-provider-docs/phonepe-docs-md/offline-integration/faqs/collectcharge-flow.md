<!-- Source: https://developer.phonepe.com/offline-integration/faqs/collectcharge-flow -->

# Collect(Charge) Flow

---

**What is Collect Call?**Merchant can send a notification to the customer’s PhonePe app using this flow. If the customer has not installed the PhonePe’s app then he will receive an SMS with the link to download the app and then complete the transaction

**What is the expireIn parameter?**ExpiresIn is the expiry time till the customer can make the payment. If the customer does not respond within this time then the request expires.
The value should be in seconds and generally, 180 sec is passed in this parameter. If no value is passed in this parameter then, by default, the request is valid for 30 days.

**What is the transactionId parameter?**A unique value is passed in this parameter in order to track the transaction at the later stages. Values should be alpha-numeric and without any spaces and should contain less than 38 characters. If a value is passed which is already stored in the PhonePe server then the server will give you 417-expectation error response code (INVALID\_TRANSACTION\_ID, msg: duplicate transaction id).

**What is Check Payment Status API?**It is used to get the current state of any transaction with the help of transactionId

**Do we need to use Check Payment Status API to get the status of the transaction if we have already passed x-callback-URL to get the callback from the PhonePe server?**Yes. It is used as a fallback option and it gives the current status of the transaction even if it is in a non-final state (ex. PAYMENT\_PENDING).

**What is the difference between PAYMENT\_ERROR and INTERNAL\_SERVER\_ERROR?
\*\***PAYMENT\_ERROR** – It is the final state of the transaction. It simply means that payment is failed and the cashier can initiate a new transaction and ask the customer to try again. No waiting period to mark the transaction as failed**INTERNAL\_SERVER\_ERROR
\*\* It is a non-final state of the transaction. In this scenario, the cashier need to wait until he gets any final state of the transaction (i.e. PAYMENT\_SUCCESS or PAYMENT\_ERROR). The Cashier can use Check-Payment-Status API in order to get the current status. The cashier needs to wait a max time period up to the time passed in expiresIn parameter during making the payment request.

**What if the customer does not respond to the payment request?**The payment request will expire as it reaches the time period passed in the expiresIn parameter during the call of the respective APIs. And if we check the current status of the transaction then it must be PAYMENT\_ERROR

**I have sent a collect request to the wrong mobile number, how can I send the request to the correct number?**You can cancel the request sent to the wrong number by using Cancel Payment API. Once the request is canceled successfully, you can reinitiate the payment by sending the collect request to the correct number

**I have sent a collect request of the wrong amount, how can I change the amount?**You can cancel the request sent by using Cancel Payment API. Once the request is canceled successfully, you can reinitiate the payment by sending the collect request of the correct amount

**What is the use of X-Provider ID and who will generate it?**If you are a POS provider or Technical Service Provider or an aggregator, you can call APIs without using SAT Keys and Index of individual Merchant IDs, you can use the SALT Key and Index of the X-Provider ID. All the Merchant IDs will be mapped to the X-Provider-ID.
X-Provider-ID will be provided by PhonePe at the time of onboarding

**Can my customer pay via any other UPI app using the collect flow?**
No. However, you can use our Dynamic QR flow or Payment Link flow which enables your customer to pay via any UPI app
