<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/php-be-sdk/sdk-reference-php/class-initialization -->

# PHP SDK Initialization

---

**StandardCheckoutClient** class will be used to communicate with the PhonePe APIs. You can create the instance only once per runtime; hence use the correct credentials while initializing the object. Use required credentials while initializing the object.

|  |  |  |  |
| --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Mandatory (Yes/No)** | **Description** |
| `client_id` | String | Yes | Your unique client ID for secure communication with PhonePe. |
| `client_version` | Integer | Yes | Client version for secure communication with PhonePe. |
| `client_secret` | String | Yes | Secret key provided by PhonePe Payment Gateway, which must be securely stored. |
| `env` | String | Yes | Environment for the client: **•****PRODUCTION** |

Sample code

```
<?php

require_once 'vendor/autoload.php'; // Include Composer autoloader

use PhonePe\payments\v2\standardCheckout\StandardCheckoutClient;
use PhonePe\Env;

$clientId = "YOUR_CLIENT_ID"; // Replace with your Client ID
$clientVersion = YOUR_CLIENT_VERSION ;           // Replace with your Client Version
$clientSecret = "YOUR_CLIENT_SECRET"; // Replace with your Client Secret
$env = Env::PRODUCTION;  // Use Env::PRODUCTION for live environment

$client = StandardCheckoutClient::getInstance(
    $clientId,
    $clientVersion,
    $clientSecret,
    $env
);

// Now you can use $client to interact with the PhonePe API.

?>
```

Please note that the **StandardCheckoutClient** follows the **singleton pattern**.

- This means that calling `getInstance()` will always return the **same client instance** for a given set of credentials.

Configuration Instructions.

• Replace “YOUR\_CLIENT\_ID”, YOUR\_CLIENT\_VERSION, and “YOUR\_CLIENT\_SECRET” with your actual PhonePe Merchant credentials.

ℹ️ ****PHP SDK Environment & Event Publishing****!

---

- The PHP SDK currently supports **only the Production environment**.
- The fifth parameter (`$shouldPublishEvents`) is **optional**.
- Set it to `true` to enable event publishing, which helps PhonePe collect analytics and monitoring data.
- By default, this is set to `false`.

⚠️ **Protect Your Client Secret**!

---

- Treat your **Client Secret** like a **password**.
- Never expose it in **client-side code** or commit it to **version control systems** (e.g., Git).
- Store it securely using **environment variables** or a **secure configuration management tool**.

## What’s Next?

As you now understand how to use the `StandardCheckoutClient` class to interact with the PhonePe APIs and how to initialize it, let’s proceed to initiating a payment.

Next, let’s learn how to initiate a payment using the StandardCheckoutPayRequestBuilder::builder().
