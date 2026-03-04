import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendAnalyticsEvent } from "../server";
import { ANALYTICS_EVENTS } from "../constant";
import Mixpanel from "mixpanel";

// Mock Mixpanel
vi.mock("mixpanel", () => ({
    default: {
        init: vi.fn(() => ({
            track: vi.fn(),
            people: {
                set: vi.fn(),
            },
        })),
    },
}));

describe("Payment and Subscription Analytics Events", () => {
    const userData = {
        userId: "user-123",
        email: "user@example.com",
        phone: "919999999999",
        firstName: "John",
        lastName: "Doe",
        ip: "127.0.0.1",
        userAgent: "Mozilla/5.0",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.VED_MIXPANEL_TOKEN_ALERTPAY = "test-token";
        process.env.FIREBASE_API_SECRET = "test-secret";
        process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = "test-id";
        process.env.VED_FACEBOOK_CONVERSION_AP_TOKEN = "test-fb-token";
        process.env.FACEBOOK_PIXEL_ID = "test-fb-pixel";
    });

    it("should send PAYMENT_CAPTURED event to all platforms", async () => {
        const eventProperties = {
            payment_id: "pay_1",
            order_id: "order_1",
            amount: 100,
            currency: "INR",
            method: "card",
        };

        const success = await sendAnalyticsEvent(
            ANALYTICS_EVENTS.PAYMENT_CAPTURED,
            userData,
            eventProperties
        );

        expect(success).toBe(true);

        // Check global fetch for Firebase and Facebook
        expect(global.fetch).toHaveBeenCalled();
    });

    it("should send SUBSCRIPTION_ACTIVATED event with correct properties", async () => {
        const eventProperties = {
            subscription_id: "sub_1",
            plan_id: "plan_1",
            quantity: 1,
        };

        const success = await sendAnalyticsEvent(
            ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
            userData,
            eventProperties
        );

        expect(success).toBe(true);
        expect(global.fetch).toHaveBeenCalled();
    });

    it("should send SUBSCRIPTION_CHARGED event with amount", async () => {
        const eventProperties = {
            subscription_id: "sub_1",
            paid_count: 5,
            amount: 199,
            currency: "INR",
        };

        const success = await sendAnalyticsEvent(
            ANALYTICS_EVENTS.SUBSCRIPTION_CHARGED,
            userData,
            eventProperties
        );

        expect(success).toBe(true);
    });

    it("should send TOKEN_CONFIRMED event", async () => {
        const eventProperties = {
            token_id: "tok_1",
            order_id: "order_1",
        };

        const success = await sendAnalyticsEvent(
            ANALYTICS_EVENTS.TOKEN_CONFIRMED,
            userData,
            eventProperties
        );

        expect(success).toBe(true);
    });

    it("should handle missing optional user data", async () => {
        const minimalUserData = {
            userId: "user-123",
        };

        const success = await sendAnalyticsEvent(
            ANALYTICS_EVENTS.PAYMENT_FAILED,
            minimalUserData as any,
            { error_code: "BAD_CARD" }
        );

        expect(success).toBe(true);
    });
});
