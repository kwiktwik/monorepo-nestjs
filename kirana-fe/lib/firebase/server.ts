import {
  initializeApp,
  getApps,
  cert,
  ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";
import type { DecodedFirebaseToken, FirebaseUserRecord } from "./types";

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    try {
      let serviceAccount: ServiceAccount;

      // Option 1: JSON string in env (for serverless: Vercel, Railway, etc.)
      const credentialsJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
      if (credentialsJson) {
        try {
          serviceAccount = JSON.parse(credentialsJson) as ServiceAccount;
        } catch (parseError) {
          const msg =
            parseError instanceof Error ? parseError.message : "Unknown error";
          if (msg.includes("Unexpected end of JSON")) {
            throw new Error(
              "FIREBASE_SERVICE_ACCOUNT_JSON is empty or truncated. " +
                "Ensure the full JSON (no line breaks/escapes) is set. " +
                "For Vercel: paste as single-line or use base64 encoding."
            );
          }
          throw parseError;
        }
        const sa = serviceAccount as ServiceAccount & Record<string, unknown>;
        if (
          !sa?.project_id ||
          !(sa?.private_key || sa?.privateKey) ||
          !(sa?.client_email || sa?.clientEmail)
        ) {
          const missing = [
            !sa?.project_id && "project_id",
            !(sa?.private_key || sa?.privateKey) && "private_key",
            !(sa?.client_email || sa?.clientEmail) && "client_email",
          ].filter(Boolean);
          throw new Error(
            `FIREBASE_SERVICE_ACCOUNT_JSON is invalid: missing ${missing.join(", ")}. ` +
              "Download a fresh key from Firebase Console > Project Settings > Service Accounts."
          );
        }
      } else {
        // Option 2: File path (local dev or when file is available)
        const serviceAccountPath =
          process.env.GOOGLE_APPLICATION_CREDENTIALS ??
          path.resolve(process.cwd(), "kiranaapps-alertpay-firebase-adminsdk.json");

        if (!fs.existsSync(serviceAccountPath)) {
          throw new Error(
            `Service account not found. Set FIREBASE_SERVICE_ACCOUNT_JSON (JSON string) or place the service account JSON at: ${serviceAccountPath}`
          );
        }

        const serviceAccountFile = fs.readFileSync(serviceAccountPath, "utf8");
        try {
          serviceAccount = JSON.parse(serviceAccountFile) as ServiceAccount;
        } catch (parseError) {
          const msg =
            parseError instanceof Error ? parseError.message : "Unknown error";
          if (msg.includes("Unexpected end of JSON")) {
            throw new Error(
              `Service account file at ${serviceAccountPath} is empty or has invalid JSON. ` +
                "Download a fresh key from Firebase Console > Project Settings > Service Accounts."
            );
          }
          throw parseError;
        }
        const saFile = serviceAccount as ServiceAccount & Record<string, unknown>;
        if (
          !saFile?.project_id ||
          !(saFile?.private_key || saFile?.privateKey) ||
          !(saFile?.client_email || saFile?.clientEmail)
        ) {
          const missing = [
            !saFile?.project_id && "project_id",
            !(saFile?.private_key || saFile?.privateKey) && "private_key",
            !(saFile?.client_email || saFile?.clientEmail) && "client_email",
          ].filter(Boolean);
          throw new Error(
            `Service account file at ${serviceAccountPath} is invalid: missing ${missing.join(", ")}. ` +
              "Download a fresh key from Firebase Console > Project Settings > Service Accounts."
          );
        }
      }

      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized with service account");
    } catch (error) {
      console.warn(
        "Firebase Admin SDK not initialized (build will continue):",
        error instanceof Error ? error.message : error
      );
      return undefined;
    }
  }
  return getApps()[0];
};

// Initialize the app
const app = initializeFirebaseAdmin();

// Get Auth and Messaging instances
export const auth = app ? getAuth(app) : null;
export const messaging = app ? getMessaging(app) : null;

// Verify Firebase token (supports both ID tokens and custom tokens)
export async function verifyFirebaseToken(
  token: string
): Promise<DecodedFirebaseToken> {
  if (!auth) {
    throw new Error("Firebase Admin SDK not initialized");
  }

  if (!token) {
    throw new Error("No token provided for verification");
  }

  console.log("Starting Firebase token verification...");

  try {
    // First, try to verify as an ID token
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken as DecodedFirebaseToken;
  } catch (idTokenError) {
    console.error("ID token verification failed:", {
      error:
        idTokenError instanceof Error ? idTokenError.message : idTokenError,
      errorCode:
        idTokenError instanceof Error && "code" in idTokenError
          ? (idTokenError as Error & { code?: string }).code
          : undefined,
    });

    console.error("Attempting to handle as custom token...");

    try {
      // If ID token verification fails, try to exchange custom token for ID token
      const idToken = await exchangeCustomTokenForIdToken(token);

      // Now verify the exchanged ID token
      console.error("Verifying exchanged ID token...");
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log(
        "Custom token exchange and verification successful for user:",
        decodedToken.uid
      );

      return decodedToken as DecodedFirebaseToken;
    } catch (customTokenError) {
      console.error("Both ID token and custom token verification failed:", {
        idTokenError: {
          message:
            idTokenError instanceof Error ? idTokenError.message : idTokenError,
          code:
            idTokenError instanceof Error && "code" in idTokenError
              ? (idTokenError as Error & { code?: string }).code
              : undefined,
        },
        customTokenError: {
          message:
            customTokenError instanceof Error
              ? customTokenError.message
              : customTokenError,
          code:
            customTokenError instanceof Error && "code" in customTokenError
              ? (customTokenError as Error & { code?: string }).code
              : undefined,
        },
      });

      // Provide helpful error message based on the ID token error
      if (
        idTokenError instanceof Error &&
        idTokenError.message.includes(
          "expects an ID token, but was given a custom token"
        )
      ) {
        throw new Error(
          "Custom token detected but FIREBASE_API_KEY is not configured. " +
          "Please add your Firebase Web API Key to your environment variables."
        );
      }

      throw new Error(
        "Invalid Firebase token. Please ensure you're providing a valid Firebase ID token or custom token."
      );
    }
  }
}

// Get user by UID
export async function getFirebaseUser(
  uid: string
): Promise<FirebaseUserRecord> {
  if (!auth) {
    throw new Error("Firebase Admin SDK not initialized");
  }

  try {
    const userRecord = await auth.getUser(uid);
    return userRecord as FirebaseUserRecord;
  } catch (error) {
    console.error("Error getting Firebase user:", error);
    throw new Error("User not found");
  }
}

// Exchange custom token for ID token
export async function exchangeCustomTokenForIdToken(customToken: string) {
  if (!process.env.FIREBASE_API_KEY) {
    console.error("FIREBASE_API_KEY environment variable is missing");
    throw new Error(
      "FIREBASE_API_KEY environment variable is required for custom token exchange. " +
      "Please get your Web API Key from Firebase Console > Project Settings > General tab, " +
      "and add it to your .env.local file as FIREBASE_API_KEY=your_api_key_here"
    );
  }

  console.log("Attempting to exchange custom token for ID token...");

  try {
    // Use Firebase Auth REST API to exchange custom token for ID token
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();
    console.log(
      "Firebase custom token exchange response status:",
      response.status
    );

    if (!response.ok) {
      console.error("Firebase custom token exchange failed:", {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        data: data,
      });
      throw new Error(data.error?.message || "Failed to exchange custom token");
    }

    console.log(
      "Custom token exchange successful, checking for idToken in response..."
    );

    // Log the response structure for debugging (without exposing the actual token)
    console.error("Response data keys:", Object.keys(data));

    if (!data.idToken) {
      console.error(
        "No idToken found in response. Available keys:",
        Object.keys(data)
      );
      throw new Error("No ID token received from custom token exchange");
    }

    console.error("Successfully exchanged custom token for ID token");
    return data.idToken;
  } catch (error) {
    console.error("Error exchanging custom token:", error);
    if (error instanceof Error) {
      throw error; // Re-throw the original error with its message
    }
    throw new Error("Failed to exchange custom token for ID token");
  }
}

