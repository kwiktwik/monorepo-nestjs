<!-- Source: https://developer.phonepe.com/offline-integration/integrated-edc-solution/edc-uat-testing -->

# EDC UAT Testing

---

**Please follow the below steps to test the EDC integrated APIs of Sale Init API & StatusCheck API**

EDC Sale Init API:

- Create a Sale request by hitting Sale Request API through Postman or from code logic implemented inside POS application

EDC Pay API:

- Enable the Pay API for the raised request by mocking the pay API. Merchant can mock the API based on their choice of paymentModes [CREDIT\_CARD, DEBIT\_CARD, ACCOUNT\_WALLET, ACCOUNT, WALLET]
- For instance, to receive the StatusCheck API or callback response of paymentMode: ACCOUNT, please mock the PayAPI with ACCOUNT
- For instance, to receive the StatusCheck API or callback response of paymentMode: CREDIT\_CARD, please mock the PayAPI with CREDIT\_CARD
- Please follow the same steps for PaymentMode: DEBIT\_CARD/WALLET/ACCOUNT\_WALLET
