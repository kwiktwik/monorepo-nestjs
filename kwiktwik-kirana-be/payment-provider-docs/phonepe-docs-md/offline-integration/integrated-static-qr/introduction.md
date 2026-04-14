<!-- Source: https://developer.phonepe.com/offline-integration/integrated-static-qr/introduction -->

# Introduction

---

PhonePe Integrated Static QR is a payment solution to help a merchant reconcile the payments made to a static QR with their billing POS.

With this integration, merchants would be able to accept payments via Static QR codes without any challenges related to reconciliations.

We have two different Static QR solutions which can be implemented at the Merchant’s side and both are considered under one solution: Integrated Static QR.
1. Integrated Static QR with Callback API solution
2. Integrated Static QR with Transaction-List+ Metadata API

## The SQR with Callback API

This solution is implemented at the Phonepe merchant’s stores where a Standy Static QR code is deployed and the payment confirmation would be received through the Callback URL mapped during the integration process. This solutions works with Vending Machines, Water ATMs, Charging Stations, etc where a callback is required.
Server to server callbacks are initiated from PhonePe server to the url provided by merchant when payment reaches to any terminal state (SUCCESS or FAIL)

## Integrated Static QR with Transaction-List + Metadata API

This solution is implemented at the Phonepe merchant’s stores where a Standy Static QR code is deployed and the payment reconciliations would be performing using our Transaction-List API & Metadata API. Transaction-List API is a pull mechanism where the agent/ cashier will get the list of transactions when the API gets hitted and then select the required transaction ID from the list.
Metadata API is a push mechanism where the agent/ cashier will tag the BillNumber/ invoiceNo generated with the selected Transaction ID and then push to our phonepe server through this Metadata API.
