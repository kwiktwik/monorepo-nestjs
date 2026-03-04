# Android Analytics Events

> Auto-generated from Android source code. Run `node scripts/extract-android-events.js` to update.

## Overview

| Category | Count |
|----------|-------|
| **Total Events** | 80 |
| **kwiktwik-kit (Shared)** | 24 |
| **alertpay (App-Specific)** | 38 |
| **jamun (App-Specific)** | 0 |
| **Facebook Standard Events** | 11 |
| **Custom Events** | 69 |

---

## Usage

### In Android (Dart)

```dart
// For shared events from kwiktwik-kit
import 'package:kwiktwik_kit/kwiktwik_kit.dart';

AlertpayAnalyticsService().trackEvent(
  name: KitEvents.otpSent.name,
);

// For app-specific events
import 'package:pay_app/analytics/events/alertpay_events.dart';

AlertpayAnalyticsService().trackEvent(
  name: AlertpayEvents.paymentSuccess.name,
);

// For Facebook Standard Events - use dedicated methods
AlertpayAnalyticsService().logPurchase(
  amount: 299.00,
  currency: 'INR',
);
```

### In Frontend (TypeScript)

```typescript
import { ANDROID_ANALYTICS_EVENTS, getEventByName, ALERTPAY_EVENTS } from '@/lib/events/android-analytics-events';

const allEvents = ANDROID_ANALYTICS_EVENTS;
const event = getEventByName('payment_success');
console.log(event?.description);

// Filter by source
const alertpayEvents = ALERTPAY_EVENTS;
```

---

## kwiktwik-kit Shared Events (24)

> These events are shared across multiple apps via kwiktwik-kit.

| Event Name | Type | Description |
|------------|------|-------------|
| `login_screen_viewed` | custom | User opened the login screen |
| `phone_number_entered` | custom | User entered phone number |
| `truecaller_auth_attempted` | custom | User initiated Truecaller authentication |
| `truecaller_auto_popup_shown` | custom | Truecaller auto popup was shown on login screen |
| `otp_sent` | custom | OTP sent successfully to user phone |
| `otp_verified` | custom | User verified OTP successfully |
| `otp_error` | custom | OTP verification failed |
| `truecaller_auth_success` | custom | Truecaller authentication successful |
| `truecaller_auth_error` | custom | Truecaller authentication failed |
| `login_error` | custom | Login error occurred |
| `user_fetch_success` | custom | User data fetched successfully |
| `user_fetch_failed` | custom | User data fetch failed |
| `nav_login` | custom | User navigated to login screen |
| `nav_home` | custom | User navigated to home screen |
| `paywall_payment_success` | custom | Premium payment successful |
| `paywall_payment_failed` | custom | Premium payment failed |
| `paywall_viewed` | custom | User viewed paywall |
| `fallback_screen_viewed` | custom | User landed on fallback paywall screen |
| `subscription_restored` | custom | User restored subscription |
| `subscription_initiated` | custom | User initiated subscription purchase |
| `upi_app_selected` | custom | User selected a UPI app for payment |
| `error_occurred` | custom | Application error occurred |
| `refer_and_earn_clicked` | custom | User clicked refer and earn |
| `logout_clicked` | custom | User clicked logout |

---

## alertpay App-Specific Events (38)

| Event Name | Type | Description |
|------------|------|-------------|
| `notification_permission_granted` | custom | User granted notification permission |
| `notification_permission_denied` | custom | User denied notification permission |
| `notification_read_allowed` | custom | User enabled notification read feature |
| `notification_received` | custom | Notification received from any app |
| `user_notification_processed` | custom | All the notification user getting on their device |
| `notification_played_via_sound` | custom | Notification played via sound alert |
| `notification_played_via_sound_failed` | custom | Notification played via sound alert failed |
| `test_notification_played` | custom | User played test notification |
| `test_notification_played_failed` | custom | User played test notification failed |
| `battery_optimization_disabled` | custom | User disabled battery optimization |
| `battery_optimization_enabled` | custom | User enabled battery optimization |
| `sound_mute_toggled` | custom | User toggled sound mute |
| `permissions_opened` | custom | User opened permissions settings screen |
| `date_filter_applied` | custom | User applied date filter |
| `language_changed` | custom | User changed app language |
| `default_language_set` | custom | Default language set for user |
| `onboarding_completed` | custom | User completed onboarding |
| `payment_verification_failed` | custom | Payment verification failed |
| `notification_processed_with_transaction` | custom | Notification processed with transaction |
| `fb_mobile_complete_registration` | facebook | User completed registration (FB Standard Event) |
| `fb_mobile_initiated_checkout` | facebook | User initiated checkout (FB Standard Event) |
| `fb_mobile_add_payment_info` | facebook | User added payment info (FB Standard Event) |
| `fb_mobile_purchase` | facebook | User completed purchase (FB Standard Event) |
| `fb_mobile_add_to_cart` | facebook | User added item to cart (FB Standard Event) |
| `fb_mobile_view_content` | facebook | User viewed content (FB Standard Event) |
| `fb_mobile_search` | facebook | User performed search (FB Standard Event) |
| `fb_mobile_tutorial_completion` | facebook | User completed tutorial (FB Standard Event) |
| `fb_mobile_tutorial_start` | facebook | User started tutorial (FB Standard Event) |
| `fb_mobile_unlock_achievement` | facebook | User unlocked achievement (FB Standard Event) |
| `fb_mobile_spent_credits` | facebook | User spent credits (FB Standard Event) |
| `qr_code_generated` | custom | QR code generated for payment |
| `qr_code_shared` | custom | QR code shared via social media |
| `deep_link_received` | custom | Deep link received and processed |
| `notification_sound_changed` | custom | User changed notification sound preference |
| `profile_name_clicked` | custom | User clicked on profile name to edit |
| `contact_support_opened` | custom | User opened contact support page |
| `privacy_policy_opened` | custom | User opened privacy policy |
| `terms_of_service_opened` | custom | User opened terms of service |

---

## Facebook Standard Events (11)

> These events use dedicated Facebook SDK methods - NOT the generic `trackEvent()`.

| Event Name | Source | Description | Usage |
|------------|--------|-------------|-------|
| `fb_mobile_complete_registration` | alertpay | User completed registration (FB Standard Event) | `AlertpayAnalyticsService().logCompleteRegistration()` |
| `fb_mobile_initiated_checkout` | alertpay | User initiated checkout (FB Standard Event) | `AlertpayAnalyticsService().logInitiatedCheckout()` |
| `fb_mobile_add_payment_info` | alertpay | User added payment info (FB Standard Event) | `AlertpayAnalyticsService().logAddPaymentInfo()` |
| `fb_mobile_purchase` | alertpay | User completed purchase (FB Standard Event) | `AlertpayAnalyticsService().logPurchase()` |
| `fb_mobile_add_to_cart` | alertpay | User added item to cart (FB Standard Event) | `AlertpayAnalyticsService().logEvent()` |
| `fb_mobile_view_content` | alertpay | User viewed content (FB Standard Event) | `AlertpayAnalyticsService().logEvent()` |
| `fb_mobile_search` | alertpay | User performed search (FB Standard Event) | `AlertpayAnalyticsService().logEvent()` |
| `fb_mobile_tutorial_completion` | alertpay | User completed tutorial (FB Standard Event) | `AlertpayAnalyticsService().logOnboardingCompleted()` |
| `fb_mobile_tutorial_start` | alertpay | User started tutorial (FB Standard Event) | `AlertpayAnalyticsService().logOnboardingStarted()` |
| `fb_mobile_unlock_achievement` | alertpay | User unlocked achievement (FB Standard Event) | `AlertpayAnalyticsService().logTrialEnabled()` |
| `fb_mobile_spent_credits` | alertpay | User spent credits (FB Standard Event) | `AlertpayAnalyticsService().logEvent()` |

---

*Generated on: 2026-02-26T07:18:20.068Z*
