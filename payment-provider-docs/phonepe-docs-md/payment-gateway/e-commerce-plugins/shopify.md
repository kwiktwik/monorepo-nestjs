<!-- Source: https://developer.phonepe.com/payment-gateway/e-commerce-plugins/shopify -->

# Shopify Integration

---

Shopify provides a simple, user friendly platform for managing your online store. You can easily integrate the PhonePe Payment Gateway, even without a technical background, by simply installing our official plugin. This straightforward, no code process allows you to start accepting payments and managing orders effortlessly.

.custom-block-wrapper {
padding: 20px;
border: 1px solid black;
background-color: #d9edbc;
}

## Integrating PhonePe Payment Gateway with Shopify

⚠️ ****Admins Only**!**

---

Only users with Admin access can set up and integrate PhonePe Payment Gateway.

## Install the PhonePe PG plugin

- In your Shopify Admin, go to Settings → Payments and click “Add payment method”.
- Click “Search by provider”, type “PhonePe PG”, and click “Install”.
- Click “Install” again. This will redirect you to the PhonePe Business Dashboard for authentication.

[](/static/6fab843465e4a259b5015f03574033c7/Shopify1-1.mp4)

[](/static/6fab843465e4a259b5015f03574033c7/Shopify1-1.mp4)

## Configure PhonePe Payments

- You will be redirected to the PhonePe Business Dashboard. Authenticate using your registered phone number or email and the OTP.
- Upon successful login, the system will confirm your Shopify store is linked to your PhonePe Merchant ID.
- After linking, you will be automatically redirected back to your Shopify Admin Dashboard.
- Click the “Activate” button to enable the gateway.
- Test Mode (Optional): If you want to test the flow without processing real money, you can enable “Test Mode”.

[](/static/d157b6b6b672bda84dda99b016f685af/Shopify2.mp4)

[](/static/d157b6b6b672bda84dda99b016f685af/Shopify2.mp4)

## Check Payment Flow

To ensure everything is working correctly, perform a test checkout:

- Go to your store, add an item to the cart, and click “Checkout”.
- On the checkout page, select PhonePe and click “Pay Now”.
- You will be redirected to the secure PhonePe page to complete the payment.

[](/static/66d21a0bf2d1371362ada0b2365e30e3/Shopify3.mp4)

[](/static/66d21a0bf2d1371362ada0b2365e30e3/Shopify3.mp4)

Congratulations! You have successfully installed and activated the PhonePe Payment Gateway. Your Shopify store is now equipped with a secure, high-speed checkout experience for your customers.

Ready to go live? Double-check that **Test Mode** is turned OFF to begin accepting payments from your customers!

## Track Successes and Troubleshoot Failures

Previously, transactions only displayed a Payment ID. We have now introduced a new section called **Information from Payment Gateway** to give you better visibility. Now, for successful payments, Shopify Store Admin users can view the **Network Transaction ID** for easier tracking, and for failed payments, you can view specific **error codes** to quickly troubleshoot the issue.

*Note: The Network Transaction ID is only generated for successful transactions and is visible to Shopify store Admins users.*

## Error Code

When integrating the plugin, it is essential to handle both successful and failed transactions gracefully. To simplify troubleshooting, the PhonePe Payment Gateway now helps you easily identify and understand transaction failures. The table below outlines and explains the specific Shopify error codes you may encounter.

|  |  |
| --- | --- |
| **Shopify Error Code** | **Description** |
| `AUTHENTICATION_FAILED` | 3D Secure or other authentication failed |
| `CARD_DECLINED` | Generic card decline |
| `EXPIRED_CARD` | Card has expired |
| `INCORRECT_ADDRESS` | Billing address mismatch |
| `INCORRECT_CVC` | CVV/CVC mismatch |
| `INCORRECT_NUMBER` | Card number is incorrect |
| `INCORRECT_PIN` | PIN is incorrect |
| `INCORRECT_ZIP` | Postal code mismatch |
| `INVALID_CVC` | CVV/CVC format is invalid |
| `INVALID_EXPIRY_DATE` | Expiry date is invalid |
| `INVALID_NUMBER` | Card number format is invalid |
| `PROCESSING_ERROR` | Generic processing error (fallback) |
| `RISKY` | Transaction flagged as risky/fraudulent |
| `CONFIRMATION_REJECTED` | Payment confirmation was rejected |
