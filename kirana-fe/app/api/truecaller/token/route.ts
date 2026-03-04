import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, account, session } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  findUserByPhoneAndApp,
  findUserByPhone,
  findUserByEmail,
  createUserWithApp,
  updateUserMetadata,
  createSessionWithApp
} from "@/lib/utils/user-helpers";

/**
 * Truecaller Token Exchange and User Profile Endpoint
 * 
 * Exchanges authorization code for access token and fetches user profile using Truecaller OAuth2 flow
 * 
 * Body Parameters:
 * - grant_type: "authorization_code" (hardcoded value)
 * - client_id: Your Truecaller client ID
 * - code: Authorization code from Truecaller OAuth callback
 * - code_verifier: Code verifier used in PKCE flow
 * 
 * Response:
 * - 200: Success - returns access token, expires_in, token_type, and user profile
 * - 400: Bad Request - Invalid parameters or grant type not supported
 * - 401: Unauthorized - Invalid/expired token or missing openid scope
 * - 403: Forbidden - Invalid client ID, auth code, or code verifier
 * - 404: Not Found - Profile information not present for the user
 * - 422: Unprocessable Entity - openid scope missing in initial request
 * - 429: Too Many Requests - Rate limit exceeded
 * - 500: Internal Server Error - Server-side error
 * - 503: Service Unavailable - Resource unavailable
 */
export async function POST(req: NextRequest) {
  try {
    // Validate app ID from headers
    let appId: string;
    try {
      const { validateAppFeature } = await import("@/lib/utils/app-validator");
      appId = validateAppFeature(req, "truecallerLogin");
    } catch (error) {
      if (error instanceof Error && error.name === "AppValidationError") {
        return NextResponse.json(
          { error: error.message },
          { status: (error as any).statusCode || 401 }
        );
      }
      throw error;
    }

    console.log(`[Truecaller Token] App ID: ${appId}`);

    const body = await req.json();
    const { grant_type, client_id, code, code_verifier } = body;

    // Validate required parameters
    if (!grant_type || !client_id || !code || !code_verifier) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          details: "grant_type, client_id, code, and code_verifier are required",
        },
        { status: 400 }
      );
    }

    // Validate grant_type
    if (grant_type !== "authorization_code") {
      return NextResponse.json(
        {
          error: "Invalid grant type",
          details: "grant_type must be 'authorization_code'",
        },
        { status: 400 }
      );
    }

    // Prepare form data for Truecaller API
    const formData = new URLSearchParams();
    formData.append("grant_type", grant_type);
    formData.append("client_id", client_id);
    formData.append("code", code);
    formData.append("code_verifier", code_verifier);

    // Make request to Truecaller token endpoint
    const response = await fetch(
      "https://oauth-account-noneu.truecaller.com/v1/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    const data = await response.json();

    // Handle different error status codes
    if (!response.ok) {
      let errorMessage = "Failed to exchange authorization code for token";

      switch (response.status) {
        case 400:
          errorMessage = "Bad Request - Invalid parameters or grant type not supported";
          break;
        case 403:
          if (data.error_description) {
            errorMessage = data.error_description;
          } else {
            errorMessage = "Forbidden - Invalid client ID, auth code, or code verifier";
          }
          break;
        case 429:
          errorMessage = "Too Many Requests - Rate limit exceeded";
          break;
        case 500:
          errorMessage = "Internal Server Error - Unexpected error on server side";
          break;
        case 503:
          errorMessage = "Service Unavailable - Resource unavailable due to server-side issue";
          break;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: data.error_description || data.error || "Unknown error",
        },
        { status: response.status }
      );
    }

    // Extract access token from response
    const { access_token, expires_in, token_type } = data;

    // Fetch user profile using the access token
    try {
      const userInfoResponse = await fetch(
        "https://oauth-account-noneu.truecaller.com/v1/userinfo",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const userInfoData = await userInfoResponse.json();

      // Handle userinfo endpoint errors
      if (!userInfoResponse.ok) {
        let errorMessage = "Failed to fetch user profile";

        switch (userInfoResponse.status) {
          case 401:
            errorMessage = "Unauthorized - Invalid or expired token, or authentication type is not bearer token";
            break;
          case 404:
            errorMessage = "Not Found - Profile information is not present for the user";
            break;
          case 422:
            errorMessage = "Unprocessable Entity - openid scope missing in initial request";
            break;
          case 500:
            errorMessage = "Internal Server Error - Failed to validate token or unexpected server error";
            break;
        }

        // Return token but include error about profile fetch
        return NextResponse.json(
          {
            access_token,
            expires_in,
            token_type,
            user_profile: null,
            error: errorMessage,
            details: userInfoData.error_description || userInfoData.error || "Unknown error",
          },
          { status: 200 } // Still return 200 since token was successfully obtained
        );
      }

      // Extract user profile data
      const userProfile = {
        sub: userInfoData.sub,
        given_name: userInfoData.given_name,
        family_name: userInfoData.family_name,
        phone_number: userInfoData.phone_number,
        email: userInfoData.email,
        picture: userInfoData.picture,
        gender: userInfoData.gender,
        phone_number_country_code: userInfoData.phone_number_country_code,
        phone_number_verified: userInfoData.phone_number_verified,
        address: userInfoData.address,
      };

      // Create or find user in database with app context
      let dbUser;
      const userEmail = userProfile.email || `${userProfile.phone_number?.replace(/\D/g, "")}@alertpay.local`;
      const userName = userProfile.given_name && userProfile.family_name
        ? `${userProfile.given_name} ${userProfile.family_name}`
        : userProfile.given_name || userProfile.family_name || `User ${userProfile.phone_number?.slice(-4) || "Unknown"}`;

      // Step 1: Check if user exists for this specific app
      if (userProfile.phone_number) {
        dbUser = await findUserByPhoneAndApp(userProfile.phone_number, appId);
      }

      if (dbUser) {
        console.log(`[Truecaller UserInfo] Found existing user for app ${appId}: ${dbUser.id}`);
        // Update user info if needed
        await db.update(user)
          .set({
            name: userName,
            image: userProfile.picture || dbUser.image,
            emailVerified: userProfile.email ? true : dbUser.emailVerified,
            phoneNumber: userProfile.phone_number || dbUser.phoneNumber,
            phoneNumberVerified: userProfile.phone_number_verified ?? dbUser.phoneNumberVerified,
            updatedAt: new Date(),
          })
          .where(eq(user.id, dbUser.id));
      } else {
        // Step 2: Check if user exists globally (across all apps)
        let existingUser = null;

        if (userProfile.phone_number) {
          existingUser = await findUserByPhone(userProfile.phone_number);
        }

        if (!existingUser) {
          existingUser = await findUserByEmail(userEmail);
        }

        if (existingUser) {
          // User exists in another app - link them to this app
          console.log(`[Truecaller UserInfo] Linking existing user ${existingUser.id} to app ${appId}`);
          dbUser = existingUser;

          // Update user info
          await db.update(user)
            .set({
              name: userName,
              image: userProfile.picture || dbUser.image,
              emailVerified: userProfile.email ? true : dbUser.emailVerified,
              phoneNumber: userProfile.phone_number || dbUser.phoneNumber,
              phoneNumberVerified: userProfile.phone_number_verified ?? dbUser.phoneNumberVerified,
              updatedAt: new Date(),
            })
            .where(eq(user.id, dbUser.id));

          // Create metadata entry for this app
          await updateUserMetadata(dbUser.id, appId);
        } else {
          // Step 3: User doesn't exist anywhere - create new user
          console.log(`[Truecaller UserInfo] Creating new user for app ${appId}`);
          dbUser = await createUserWithApp(
            {
              name: userName,
              email: userEmail,
              emailVerified: !!userProfile.email,
              phoneNumber: userProfile.phone_number || null,
              phoneNumberVerified: userProfile.phone_number_verified || false,
              image: userProfile.picture || null,
            },
            appId
          );
        }
      }

      // Create or update Truecaller account link
      const existingAccounts = await db
        .select()
        .from(account)
        .where(and(eq(account.userId, dbUser.id), eq(account.providerId, "truecaller")))
        .limit(1);
      const existingAccount = existingAccounts[0] || null;

      if (existingAccount) {
        // Update existing account
        await db.update(account)
          .set({
            accessToken: access_token,
            idToken: userInfoData.sub,
            accessTokenExpiresAt: new Date(Date.now() + (expires_in * 1000)),
            updatedAt: new Date(),
          })
          .where(eq(account.id, existingAccount.id));
      } else {
        // Create new account
        await db.insert(account).values({
          id: nanoid(),
          accountId: userProfile.sub,
          providerId: "truecaller",
          userId: dbUser.id,
          accessToken: access_token,
          idToken: userProfile.sub,
          accessTokenExpiresAt: new Date(Date.now() + (expires_in * 1000)),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Create session using Better Auth with app context
      const sessionToken = await createSessionWithApp(dbUser.id, appId, req);

      // Success response with session token and user profile
      return NextResponse.json(
        {
          success: true,
          token: sessionToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phoneNumber: dbUser.phoneNumber,
            image: dbUser.image,
            emailVerified: dbUser.emailVerified,
            phoneNumberVerified: dbUser.phoneNumberVerified,
          },
          user_profile: userProfile,
          appId: appId,
        },
        { status: 200 }
      );
    } catch (userInfoError) {
      console.error("[Truecaller UserInfo] Error:", userInfoError);

      // Return token even if userinfo fetch fails
      return NextResponse.json(
        {
          access_token,
          expires_in,
          token_type,
          user_profile: null,
          error: "Failed to fetch user profile",
          details: userInfoError instanceof Error ? userInfoError.message : "Unknown error",
        },
        { status: 200 } // Still return 200 since token was successfully obtained
      );
    }
  } catch (error) {
    console.error("[Truecaller Token] Error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Internal server error while exchanging token";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

