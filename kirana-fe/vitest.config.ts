import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./lib/events/__tests__/setup.ts"],
        include: ["lib/events/__tests__/**/*.{test,spec}.{ts,tsx}"],
        env: {
            VED_MIXPANEL_TOKEN_ALERTPAY: "test-token",
            FIREBASE_API_SECRET: "test-secret",
            NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "test-id",
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./"),
        },
    },
});
