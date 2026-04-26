<!-- Source: https://developer.phonepe.com/offline-integration/collect-call-solution/technical-flow-diagram -->

# Technical Flow Diagram

---

## Forward Transaction

Payment through PhonePe on a Billing POS terminal has the following steps.

Technical Flow Diagram

![Technical Flow Diagram](/phonepe-docs-md/static/ad89e001c39cfce964b7cfc639581820/58f13/383e415-collect_flow-1624x731.md)![Technical Flow Diagram](/phonepe-docs-md/static/ad89e001c39cfce964b7cfc639581820/58f13/383e415-collect_flow-1624x731.md)

Technical Flow Diagram

![Technical Flow Diagram](/phonepe-docs-md/static/ad89e001c39cfce964b7cfc639581820/58f13/383e415-collect_flow-1624x731.md)![Technical Flow Diagram](/phonepe-docs-md/static/ad89e001c39cfce964b7cfc639581820/58f13/383e415-collect_flow-1624x731.md)

A detailed explanation of the flow is described below:
**1.** **Raising Payment Collect Request on Terminal**

- Customer shares his mobile number with the cashier at the billing terminal.
- Cashier enters mobile number. There should be a **validation** of mobile number.(regex)
- Once cashier presses “Send collect request” button, the request goes to terminal’s backend.
- On receiving success for the collect request at backend, backend should notify this to terminal.
- Now, on terminal after receiving success for collect request one dialog box should be displayed stating “**collect request sent Successfully. Please ask customer to initiate the payment.”**
- If collect request response is not the success, message should be displayed on terminal to **“reinitiate the transaction”.**
- There should not be multiple collect requests raised in the same order ie. the “**Send collect request”** button should be **disabled**.
- If transaction status is checked manually, there should be a button on the terminal to **“check the transaction status”** which will call the terminal’s backend.
- This button should be enabled only when the collect request is sent successfully and “send collect request” button is disabled.

For the detailed API contract for raising collect request, please refer [Request Payment](/phonepe-docs-md/offline-integration/collect-call-solution/request-payment-api.md) section of the documentation.

**2.** **Payment on Customer’s PhonePe App**

- Customer receives an SMS and push notification in PhonePe App against the collect request
- Customer makes payment to the collect request from pending transactions of the app.
- Customer notifies cashier that the payment is completed.

**3.** **Validating Transaction Status**
There are two ways to validate the transaction

**3.1. Server to server callback**

- There will be callback sent to terminal’s server. Which further should be communicated to terminal and accordingly order should be fulfilled.
- If callback is not received the payment may or may not be successful and can be in pending state.
- The status should be checked manually for such cases from terminal.

**3.2. Check the status manually**

- The cashier should select the **“check the transaction status”** button which should call the terminal’s server. Terminal’s server should call the PhonePe server to know the status.
- Add a message in the POS asking the cashier to click the Check Status button only after customer tells the cashier that he has made the payment.

For detailed API contract for fetching transaction status, please refer [Check Payment Status](/phonepe-docs-md/offline-integration/response-capturing-api/check-payment-status-api.md) section of the documentation.

4.**Order Fulfillment**
Order is fulfilled on a transaction status validation.

## Canceling Payment Request

The collect transaction raised by the merchant can be aborted at any time before the payment is successful.
Merchants should Implement **cancel API** on the **Close/Cancel button** of terminal or the actions which may lead to aborting the transactions.
Scenarios for canceling collect requests include order cancellation, sent to wrong mobile number, collect request not received in app etc.

For cancelling this collect request, please refer [Cancel Payment Request](/phonepe-docs-md/offline-integration/cancel-payment-request-api.md) section of documentation.

Cancel Payment Request API will remove the collect request from the pending section of PhonePe app.
If payment is not successful already and in progress, It will be marked as failed and refund will be initiated.
If Cancel API request fails, Merchants should check the status before aborting the payment.

The collect request will automatically be canceled and payment will be failed after `ExpiresIn` time sent through [Charge](/phonepe-docs-md/offline-integration/collect-call-solution/ref-charge.md) ends. Recommended time for expiry of collect request is 180 seconds.

The collect request will automatically be canceled and payment will be failed after `ExpiresIn` time sent through charge ends. Recommended time for expiry of collect request is 180 seconds.

## Other Flows

**Reconciliation**

A reconciliation is needed for transactions which are payment `Successful` but Order Not Fulfilled.

A customer’s money is deducted but the order does not go through on the Merchant side for the following reasons:

- A transaction goes in `Pending` hence order is not completed by the merchant. However, the `Pending` changes to `Successful` after some time.
- Due network issue or internal failure from either end, if the merchant does not receive any status for a given transaction, it is left in “open” state.

Reconciliation can be done by the merchant in the following ways:

- Through running a scheduler periodically which will pick these cases and fetch the transaction status to close the transaction. The recommended time interval to run this scheduler is 15 min.
- Reconcile using the daily settlement report shared via mail/dashboard. Settlement report will have entries for all successful transactions.

**Refund**

For detailed API contracts for initiating a refund, please refer [Refund](/phonepe-docs-md/offline-integration/refund-flow/refund-api.md) section of the documentation.
