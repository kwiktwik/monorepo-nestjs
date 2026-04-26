<!-- Source: https://razorpay.com/docs/payments/tpap-pro/integration-guide -->

Integrate TPAP Pro by following these steps:

1. [Integrate TPAP Pro Flows](/razorpay-docs-md/tpap-pro/integration-guide.md#1-tpap-pro-flows)
2. [Follow Go-live checklist](/razorpay-docs-md/tpap-pro/integration-guide.md#2-follow-go-live-checklist)

## 1. TPAP Pro Flows

Following are the flows available on our TPAP stack:

Customer Onboarding

Customer onboarding is a process of binding and registering the customer device by validating the mobile number. The customer's payment sources are linked to ensure seamless and hassle-free transactions. Additionally, You must create a fingerprint that acts as a unique identifier generated based on various attributes of the device. Know more about [customer onboarding](/razorpay-docs-md/api/payments/tpap-pro/customer-onboarding.md).

Create a Device Fingerprint

Create an unique identifier using various attributes of the device. This identifier is used to recognise the specific device during subsequent transactions.

To generate a device fingerprint for the customer:

1. Create a string with the following fields separated by a pipe (|).

   Code

   copy

   ```html
SSID|APP.ID|device.UUID|mobile_number|merchantCustomerId|timestamp
```
2. Hash this string using the SHA-256 algorithm.

   Java

   copy

   ```java
deviceFingerprintPayload =      
"<ssid|app.id|device.uuid|mobile_number|customer_reference|timestamp>"MessageDigest digest = MessageDigest.getInstance("SHA-256");
byte[] deviceFingerprint = digest.digest(deviceFingerprintPayload.getBytes(StandardCharsets.UTF_8));
```
3. Send the timestamp within the headers.

Device Binding Status

The following table lists the different device binding status and their description. Know more about [device binding](/razorpay-docs-md/api/payments/tpap-pro/customer-onboarding/bind-device.md).

Funds and Accounts Management

Funds and accounts management helps you manage payment sources and providers. The Razorpay APIs let you add more accounts, delete existing accounts and change PINs for accounts for hassle-free transactions. Know more about [managing funds and accounts](/razorpay-docs-md/api/payments/tpap-pro/funds-account-management.md).

Payments

The Payment module enables you to make various transactions using payment APIs. Below are the supported transaction types:

- [Make Payments](/razorpay-docs-md/api/payments/tpap-pro/payments-flow/make-payments.md)

  : Facilitate P2P (peer-to-peer) or P2M (peer-to-merchant) payments. The supported payment transfer types are:
  - Pay from a VPA to VPA.
  - Pay from a VPA to a payment source.
  - Pay from a payment source to a VPA.
  - Pay from one payment source to another.This API lets you enable the following payment options for customers:
  - **Scan and Pay (UPI QR & Bharat QR):** Customers can QR codes and make payments.
  - **Intent Payment:** Customers can make payment through an intent link.
  - **Payment to a PSP merchant:** Customers can make a payment using the merchant VPA.
  - **P2P Pay (VPA and Account+IFSC):** A person can pay to another person using a TPAP.
  - **Self Pay:** Customers can make transactions between their own accounts.
- [Collect Payments](/razorpay-docs-md/api/payments/tpap-pro/payments-flow/collect-payments.md)

  : This API lets you collect payments from others.
- [Approve Collect Requests](/razorpay-docs-md/api/payments/tpap-pro/payments-flow/approve-collect-requests.md)

  : This API lets you approve payment collect requests.
- [Reject Collect Requests](/razorpay-docs-md/api/payments/tpap-pro/payments-flow/reject-collect-requests.md)

  : This API lets you reject payment collect requests.

Mandates

You can create and manage mandates using the Razorpay APIs. Know more about [managing mandates](/razorpay-docs-md/api/payments/tpap-pro/mandate-flow.md).

Complaints API

The Complaints API enables efficient handling of transaction-related issues.

Raise Complaint

Submit complaints about transactions to ensure prompt resolution.

Check Complaint Status

Track the progress and status of submitted complaints.

UPI Mapper

UPI Mapper provides a 1:1 mapping between VPAs and mobile or UPI numbers, enabling efficient and streamlined identification.

Credit Card on UPI

Enable credit card payments via UPI for enhanced flexibility. All features of account management apply to credit cards as well.

UPI One-time Mandate

Authorise one-time payments for specific transactions, offering greater flexibility and control.

Credit Lines on UPI

Enable transactions using pre-approved credit lines, helping users manage finances more effectively.

UPI Lite

Support low-value transactions with a simplified process, ensuring quick and seamless payments.

Activation of Lite Service

The user enables UPI Lite through their UPI app, and the request is processed via PSP, NPCI, and the bank, ensuring activation.

![TPAP Pro UPI Lite Activation Flow](https://razorpay.com/docs/payments/tpap-pro/build/browser/assets/images/tpap-upilite-activation.jpg)

Payment via UPI Lite

The user makes a low-value transaction using UPI Lite, where the amount is deducted instantly from their Lite balance without requiring bank authentication.

![Payment VIA UPI Lite](https://razorpay.com/docs/payments/tpap-pro/build/browser/assets/images/payment-via-upilite.jpg)

Disabling UPI Lite Service with Non-Zero Balance

If the user disables UPI Lite with a remaining balance, the amount is credited back to their linked bank account before deactivation.

![Disabling UPI Lite Service with Non-Zero Balance](https://razorpay.com/docs/payments/tpap-pro/build/browser/assets/images/disabling-upilite-services.jpg)

Global UPI

Enable international UPI payments, making cross-border transactions smooth and hassle-free.

## 2. Follow Go-live Checklist

Consider the following steps before taking your integration live.

Switch Test API Keys With Live API Keys

After confirming if your integration is working successfully, you can take the integration live by switching the Test Mode API Keys with the Live Mode Keys.

Watch this video to know how to generate Live API keys:

Subscribe to Webhooks [Set up Razorpay Webhooks](/docs/webhooks/setup-edit-payments/) to configure and receive notifications when a specific event occurs. When one of these events is triggered, we send an HTTP POST payload in JSON to the webhook's configured URL.

## Header Information

Below are the headers you should pass while polling different APIs.
