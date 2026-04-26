<!-- Source: https://developer.phonepe.com/offline-integration/faqs/integrated-static-qr-faqs -->

# Integrated Static QR FAQs

---

**Question: What are the types of solutions in Static QR?**

Answer: Phonepe has two types of solutions in case of Static QR. StaticQR with Callback API & Static QR with TransactionList & Metadata API, both are integrated solutions in nature.

**Question: What is the difference between StaticQR with Callback API & Static QR with TransactionList & Metadata API?**

Answer:Â **StaticQR with Callback API**: This integration is done at the merchant stores, EV charging stations, Vending machines without display screen where the customer pays on the standy staticQR and gets the required products or services. Here transaction verification is based on push mechanism, where phonepe sends callbacks to your server once the payment is completed. The dispatch of product happens post the Phonepe server pushes the transaction details on the merchantâs callback endpoint.

**Static QR with TransactionList API & Metadata API**: This type of integration is done at the POS software where there is an interaction between customer and cashier/ agent. Once a customer pays on the QR, the cashier pulls the list of successful transactions using TransactionList API from phonepe server ; and then pushes the BillNumber of the bill generated with transactionID through Metadata API to phonepe server. Here transaction verification is based on pull mechanism where the cashier fetches the list of successful transactions to confirm the payments.

**Question: What is the TransactionList API ?**

Answer: The Transaction List API is used to fetch/pull the list of successful transactions performed on the standy Static QR. This API will pull list of maximum 10 transactions performed within a specified time window. The default time window isÂ **5 mins**. Failed/pending transactions will not be fetched.

**Question: Can we increase/decrease the time window of the TransactionList API ?**

Answer: Yes we can increase or decrease the window of the Transaction List API based on your business requirement. The time window can vary between 1 min to 12 hours, but it will fetch only 10 latest transactions happened during that time frame.

**Question: What is Metadata API ?**

Answer: The Metadata API is used to push the invoice/ bill number generated at merchantâs end along with the TransactionID to our phonepe server.

**Question: What is the use of schemaversion in the Metadata API request payload ?**

Answer: Â The role ofÂ schemaversion is used to map the parameter (Bill number) for the merchant to pass in the payload.

**Question: Are merchants going to receive sales, refunds and chargebacks in the same settlement file?**

Answer:Â **Yes,**Â you will all get the details in the same Settlement Report. Settlement report would be sent on the registered email address with us.

**Question: What will be the callback response format for SQR?**

Answer: There are 2 types of callback response: encoded(v2) & decoded(v1).

By default we will be sending the encoded(V2) callback response. For SQR callback, you can choose for either base64encoded or decoded/plainJSON body based on your requirement.

X\_verify logic for v2 callback is:SHA256(response + saltlkey) + ### + salt index X\_verify logic for v1 Callback is: SHA256(MerchantId+TransactionId+Amount+SaltKey) + ### + saltindex.

**Question: Difference between Store ID and Terminal ID in SQR?**

Answer: StoreID refers to each and every Store where you are going to use our Static QR. Letâs assume that in a metro city, there are 5 RelianceTrend Stores at 5 different locations, here each Store will have a unique StoreID assigned for them, that particular StoreID we need to onboard so that during transaction callback response we send these data to the merchant. The Store details has to be shared with Phonepe to onboard them.

TerminalID : TerminalID refers to the numbers of payment counters/ Bill counters at a given Store. Let assume that for a Store with StoreID=1 has 4 bill Counters, so here every Billcounters will be treated as Terminal & have a defined TerminalID to it ( Terminal1, Ternimal2, etc). The terminal ID will have one to one mapping with the QR codeID.

**Question: Is it possible to send UPI application details like Gpay, Phonepe, CredPay in the callback response?**Â

Answer:Â  No, we do not send the bank or application in the callback. However we can enable payment mode details & UTR details but exact information about which UPI app (Gpay,Phonepe) has made that particular transaction is not being shared in the transaction response. However these details would be visible on the merchantâs PB dashboard on the transaction page.

**Question: Is it possible to send customer related details in the callback response?**

Answer: We can enable UTR & Bank details like AccountHolder name, IFSC, AccountNumber etc, but we cannot send customer details such as Mobile number, Email address of the payee .

**Question: Can we provide Fixed amount static QR?**
Answer: Yes we can help the merchants with fixed amount SQR where the customer has to scan and pay, no manual entry of amount would be allowed in this case.
