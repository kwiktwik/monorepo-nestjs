import { betterAuth } from "better-auth";
import type { GenericEndpointContext } from "better-auth";
import { jwt, oneTimeToken, bearer, phoneNumber } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import type { UserWithPhoneNumber } from "better-auth/plugins";
import { sendOTPViaAPI } from "@/lib/utils/sms";
import { db } from "@/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// Helper function to extract header value from various header formats
type HeaderLike =
  | Headers
  | { get: (name: string) => string | null }
  | Record<string, string>
  | null
  | undefined;

function getHeader(headers: HeaderLike, name: string): string {
  if (!headers) return "";
  try {
    if (headers instanceof Headers) {
      return headers.get(name) || headers.get(name.toLowerCase()) || "";
    }
    if (
      typeof (headers as { get?: (name: string) => string | null }).get ===
      "function"
    ) {
      const getter = (headers as { get: (name: string) => string | null }).get;
      return getter(name) || getter(name.toLowerCase()) || "";
    }
    const record = headers as Record<string, string>;
    return record[name] || record[name.toLowerCase()] || "";
  } catch {
    return "";
  }
}

export const auth = betterAuth({
  plugins: [
    bearer(),
    jwt(),
    oneTimeToken(),
    phoneNumber({
      sendOTP: (
        { phoneNumber, code }: { phoneNumber: string; code: string },
        ctx?: GenericEndpointContext,
      ) => {
        // Extract appHash from headers (try ctx.headers first, then ctx.request.headers)
        const appHash =
          getHeader(ctx?.headers, "x-app-hash") ||
          getHeader(ctx?.request?.headers, "x-app-hash") ||
          "";

        // TEST MODE: Skip sending SMS for test number 9999999999 (PREMIUM ONLY)
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        const isTestNumber =
          cleanPhone === "9999999999" || cleanPhone === "919999999999";

        if (isTestNumber) {
          console.log(
            `[OTP] Test mode (PREMIUM ONLY): Skipping SMS send for test number ${phoneNumber}. Use OTP: 123456`,
          );
          return;
        }

        // Send OTP in background (non-blocking to prevent timing attacks)
        sendOTPViaAPI(phoneNumber, code, appHash).catch((error) => {
          console.error(`[OTP] Error sending to ${phoneNumber}:`, error);
        });
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber: string) => {
          const cleanPhone = phoneNumber.replace(/\D/g, "");
          return `${cleanPhone}@kiranaapps.local`;
        },
        getTempName: (phoneNumber: string) => {
          const cleanPhone = phoneNumber.replace(/\D/g, "");
          return `User ${cleanPhone.slice(-4)}`;
        },
      },
      callbackOnVerification: async ({
        phoneNumber,
        user,
      }: {
        phoneNumber: string;
        user: UserWithPhoneNumber;
      }) => {
        console.log("[Auth] Phone number verified:", {
          phoneNumber,
          userId: user?.id,
        });
      },
    }),
    nextCookies(),
  ],
  database: drizzleAdapter(db, { provider: "pg" }),
  socialProviders: {
    google: {
      accessType: "offline",
      // prompt: "select_account+consent",
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },
  logger: {
    disabled: false,
    disableColors: false,
    level: "debug",
    log: (level, message, ...args) => {
      // Custom logging implementation
      console.log(`[${level}] ${message}`, ...args);
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:11434",
    "http://127.0.0.1:3000",
    "https://app.storyowl.app",
    "http://localhost:3010",
    "http://localhost:3002",
    "https://build.kiranaapps.com",
    "https://preprod.kiranaapps.com",
    "https://alertpay.kiranaapps.com",
    "https://kiranaapps.com",
    "https://www.kiranaapps.com",
  ],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});
