<!-- Source: https://developer.phonepe.com/offline-integration/integrated-static-qr/payment-flow -->

# Payment Flow

---

PhonePe Integrated Static QR is a payment solution to help a merchant reconcile the payments made to a static QR with their billing POS.

With this integration, merchants would be able to accept payments via Static QR codes without any challenges related to reconciliations.

## Payment Flow

1. Cashier punches the order and selects the PhonePe as MOP in the terminal
2. Cashier presents the PhonePe Static QR to the customer and shares the amount for which customer has to make the payment

![](/static/619534f80f7e69328d46fad84fb98dcc/58f13/payment-flow.png)![](/static/619534f80f7e69328d46fad84fb98dcc/58f13/payment-flow.png)

![](/static/619534f80f7e69328d46fad84fb98dcc/58f13/payment-flow.png)![](/static/619534f80f7e69328d46fad84fb98dcc/58f13/payment-flow.png)

3. Customer scans the QR via any UPI application and completes the transaction
4. Once the transaction is completed, cashier will pull the list of transactions from our Transaction List API to confirm that payment was successful and click on the verify payment button against PhonePe.

![](/static/6a58aa5135d8a5bde60e606ac13d391b/58f13/devdocsimg2.png)![](/static/6a58aa5135d8a5bde60e606ac13d391b/58f13/devdocsimg2.png)

![](/static/6a58aa5135d8a5bde60e606ac13d391b/58f13/devdocsimg2.png)![](/static/6a58aa5135d8a5bde60e606ac13d391b/58f13/devdocsimg2.png)

4. Transaction list API will fetch all the successful transaction happened during the defined window. The Transaction List API will show the list of transaction of last 5 mins payments.
5. The cashier may also filter out the list of transactions by using amount filter or last 4 digits of transaction ID (Optional).

![](/static/1766fe1c2eb7bb1c6503cacf2d64ccde/58f13/devdocsimg3.png)![](/static/1766fe1c2eb7bb1c6503cacf2d64ccde/58f13/devdocsimg3.png)

![](/static/1766fe1c2eb7bb1c6503cacf2d64ccde/58f13/devdocsimg3.png)![](/static/1766fe1c2eb7bb1c6503cacf2d64ccde/58f13/devdocsimg3.png)

6. Merchant Server calls theÂ **[PhonePe transaction list API](/phonepe-docs-md/offline-integration/integrated-static-qr/transaction-list-api.md)Â**with parameters such as Merchant ID, store id, amount, or last 4 digits of the transaction.
7. PhonePe verifies the request and responds with the transaction details like PhonePe providerReferenceId, transaction Id, payment status, payment mode, amount, etc.
8. On successful verification, the merchant server passes the response to Merchant POS
9. Cashier closes the transaction and generates the bill
10. Post invoice generation, the merchantâs server calls Metadata API to push the invoice/bill number alongwith the selected transaction ID for future reference, to the PhonePe server. This helps to add the bill number for each transaction.
11. Once the bill number/invoice number is attached to a transaction ID, the PhonePe server will exclude that transaction from the next response of Transaction list API, to avoid duplicates.

![](/static/a722c58fb7e07890ea0a04c542b9aadd/58f13/devdocsimg4.png)![](/static/a722c58fb7e07890ea0a04c542b9aadd/58f13/devdocsimg4.png)

![](/static/a722c58fb7e07890ea0a04c542b9aadd/58f13/devdocsimg4.png)![](/static/a722c58fb7e07890ea0a04c542b9aadd/58f13/devdocsimg4.png)

## System Flow

![](/static/e5c54e4fc9f97daed40f396d7f2b2392/58f13/devdocsimg5.png)![](/static/e5c54e4fc9f97daed40f396d7f2b2392/58f13/devdocsimg5.png)

![](/static/e5c54e4fc9f97daed40f396d7f2b2392/58f13/devdocsimg5.png)![](/static/e5c54e4fc9f97daed40f396d7f2b2392/58f13/devdocsimg5.png)
