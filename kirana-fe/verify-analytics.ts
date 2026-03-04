/**
 * Verification script for app-specific analytics events
 */
import "dotenv/config";
import { sendAnalyticsEvent } from "./lib/events/server";

async function testAnalytics() {
    const userData = {
        email: "test@example.com",
        phone: "919999999999",
        firstName: "Test",
        lastName: "User",
        userId: "test-user-id",
    };

    const eventProperties = {
        amount: 100,
        currency: "INR",
    };

    console.log("--- Testing DEFAULT App ID ---");
    await sendAnalyticsEvent("TEST_EVENT", userData, eventProperties);

    console.log("\n--- Testing Jamun App ID (com.sharestatus.app) ---");
    await sendAnalyticsEvent("TEST_EVENT", userData, eventProperties, undefined, "com.sharestatus.app");

    console.log("\n--- Testing Jamun App ID (com.sharekaro.kirana) ---");
    await sendAnalyticsEvent("TEST_EVENT", userData, eventProperties, undefined, "com.sharekaro.kirana");

    console.log("\n--- Testing Non-Jamun App ID (alertpay-android) ---");
    await sendAnalyticsEvent("TEST_EVENT", userData, eventProperties, undefined, "alertpay-android");
}

testAnalytics().catch(console.error);
