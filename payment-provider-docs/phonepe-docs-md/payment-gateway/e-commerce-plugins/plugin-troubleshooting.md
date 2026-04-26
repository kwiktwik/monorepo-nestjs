<!-- Source: https://developer.phonepe.com/payment-gateway/e-commerce-plugins/plugin-troubleshooting -->

# Common Issues & Fixes

---

## WooCommerce

## Transaction Failures

#### ****ð**** **Issue:** **Transaction failed due to network issue.**

**How do I resolve this error?**

- Ensure that your **PHP version is 8.2** or **above**, and the PhonePe plugin version is **3.0.4**(**latest**)
- Please verify your credentials in the Developer Settings section.
  - If you see **salt\_key** and **salt\_index** (V1 credentials):
    - These are older keys. Please reach out to the Integration Team to request PG V2 keys.
  - If you see **client\_id**, **client\_secret**, and **client\_version** (V2 credentials):
    - Ensure that the credentials entered on the config page are correct.
    - Make sure there are no extra spaces.
    - The environment must be set to **PRODUCTION**, as the plugin currently does not support the UAT environment.

#### **ð** **Issue:** **Transaction failed due to 404 error and Salt keys (V1 credentials) showing on the PhonePe Plugin configuration page despite being onboarded with V2 client credentials.**

**How do I resolve this error?**

If your PhonePe Plugin is asking for a **Salt Key** and **Merchant ID**, but your Developer Settings provide a **Client ID** and **Client Secret**, your website is likely holding onto outdated configuration settings.
Follow these steps to clear the old data and enable the V2 configuration fields.
**Step 1: Backup Your Database**
Before making any direct changes to your database, ensure you have a recent backup. While this process is safe, it is a standard best practice.
**Step 2: Locate the Outdated Settings**
To confirm that your database is holding old credentials, run the following query in your database management tool (like phpMyAdmin):
SQL

```
SELECT * FROM wp_options WHERE option_name='woocommerce_phonepe_settings';
```

**Step 3: Clear the Stored Credentials**To force the Plugin to reset and show the new V2 credential fields, you need to delete the existing settings row. Execute this query:
SQL

```
DELETE FROM wp_options WHERE option_name='woocommerce_phonepe_settings';
```

**Note:** If your database uses a custom prefix instead of `wp_`, ensure you replace `wp_options` with your actual table name (e.g., `xyz_options`).
Step 4: Re-configure the Plugin

- Log back into your **WordPress Admin Dashboard**.
- Navigate to **WooCommerce > Settings > Payments**.
- Click **Manage** next to the PhonePe gateway.
- The fields should now be reset, allowing you to enter your **Client ID** and **Client Secret** to complete the V2 integration.

âââââââÂ

## Webhook Configuration

#### **ð** **Issue:** **I want to configure a webhook for WooCommerce.**

- Woocommerce plugin in itself will handle the webhook for the merchantâs transactions initiated via the plugin.
- In case the Merchants webHook is not set, please ensure to remove the credentials and save the settings for PhonePe PG, and then again add the credentials and hit save this will retrigger the merchants webhook setup API.
- We have a scheduled cron added in our plugin code that checks for all pending orders status every 1 minute.Â  And that cron should be available and added in woocommerce tools scheduled actions page. [Please refer below screenshot]

![](/static/a65d40631a2ac4403effeeac956e3a42/58f13/image-1.png)![](/static/a65d40631a2ac4403effeeac956e3a42/58f13/image-1.png)

![](/static/a65d40631a2ac4403effeeac956e3a42/58f13/image-1.png)![](/static/a65d40631a2ac4403effeeac956e3a42/58f13/image-1.png)

- If this is not showing up most likely the merchant has disabled scheduled jobs and from their end. Ask your developer to enable the same.

âââââââÂ

## Shopify

## Troubleshooting URL Mismatches

#### **ð** **Issue:** **What should I do if I see a âURL Mismatchâ error?**

The URL Mismatch Error occurs when the payment request originates from a domain or URL that has not been whitelisted on the PhonePe server. For Shopify integrations, both the domain and the myshopify.com store URL must be whitelisted.

**How do I resolve these errors?**

- Identify the Required URL(s): Determine the exact domain from which your customers will initiate payments.Â
- Request Whitelisting:
  - Action: Provide the required, correct domain URL and the myshopify.com store URL to the PhonePe team.
  - Confirmation: Explicitly state that you authorize the team to proceed with whitelisting the URL.
  - Confirm and Re-test: Wait for confirmation from the PhonePe team that the URL has been successfully whitelisted.
  - Once confirmed, re-initiate the payment from the newly whitelisted Shopify URL.

**Note:
Mandatory Whitelisting:** It is mandatory to initiate payments only from the authorized, whitelisted URL. Otherwise, you will consistently encounter the âURL Mismatchâ error.

âââââââÂ

## Missing Install Button or Redirection Issues

#### **ð** **Issue:** **Install Button is missing or Multiple Redirection to PhonePe after clicking activate.**

**How do I resolve this error?**

To resolve this, log out of your Shopify account and log back in. Then, proceed with Integrating the PhonePe Plugin to the Shopify Store.

âââââââÂ

## Requesting Production Credentials for Shopify

#### ****ð** **Issue:**** **I need production credentials to complete the Shopify plugin integration.**

The Shopify Plugin Integration does not require credentials. Simply sign in with your registered email or phone number.

âââââââÂ
