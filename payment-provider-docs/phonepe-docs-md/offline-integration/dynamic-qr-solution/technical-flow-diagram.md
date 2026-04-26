<!-- Source: https://developer.phonepe.com/offline-integration/dynamic-qr-solution/technical-flow-diagram -->

# Technical Flow Diagram

---

![](/static/3d95a28ef873e9ed8310195f0be0e6ae/58f13/c331620-dynamic_qrflow-1624x868-1.png)![](/static/3d95a28ef873e9ed8310195f0be0e6ae/58f13/c331620-dynamic_qrflow-1624x868-1.png)

![](/static/3d95a28ef873e9ed8310195f0be0e6ae/58f13/c331620-dynamic_qrflow-1624x868-1.png)![](/static/3d95a28ef873e9ed8310195f0be0e6ae/58f13/c331620-dynamic_qrflow-1624x868-1.png)

1. The cashier/biller chooses tender type PhonePe in the billing software.
2. The billing software then generates a PhonePe dynamic QR for this order. The QR is then shown to the user to scan.
   a. Transaction details like order id, amount, QR expiry are sent to PhonePe Server to generate the QR.
3. The user then scans this QR with any BHIM UPI App.
4. The user sees the merchant name and the amount to be paid on his app.
5. The user then makes the payment with various payment options available.
   a. If the user scans the QR with PhonePe, then the user can pay with all the payment instruments (UPI, CC, DC, Wallets) that are enabled for this merchant.
   b. If the user scans the QR with any other BHIM UPI app, then the user can complete the payment only with UPI
6. PhonePe servers, after the transaction is complete, sends the status to the merchant systems in either of the 2 ways
   a. Manually, when the merchant asks for the status through a button on the billing software UI
   b. Automatically, if the merchant has provided us with a callback URL to post the status of the transaction to.
7. The billing software then displays the status to the cashier.

For the detailed API contract for creating a dynamic QR code, please refer [DQR Init API](/phonepe-docs-md/offline-integration/dynamic-qr-solution/dqr-init-api.md) section of the documentation.
