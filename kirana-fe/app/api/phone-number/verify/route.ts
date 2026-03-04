import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { user, session } from "@/db/schema";
import { eq, or } from "drizzle-orm";
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
 * Verify Phone Number with OTP
 *
 * This endpoint verifies the OTP code sent to the phone number.
 * Uses Better Auth's phoneNumber plugin which handles OTP verification.
 * With signUpOnVerification configured, it will automatically create a user
 * if they don't exist when verifying their phone number.
 *
 * Body Parameters:
 * - phoneNumber: Phone number in E.164 format (required, e.g., "+919876543210")
 * - code: The OTP code received via SMS (required, string)
 * - disableSession: Whether to disable session creation (optional, default: false)
 * - updatePhoneNumber: Whether to update the phone number if user exists (optional, default: true)
 *
 * Response:
 * - 200: OTP verified successfully, returns session/user data
 * - 400: Invalid phone number, missing code, or invalid format
 * - 401: Invalid or expired OTP code
 * - 500: Error verifying OTP
 */
export async function POST(req: NextRequest) {
  const requestId = nanoid(8);
  const startTime = Date.now();
  let phoneNumber: string | undefined;
  let disableSession = false;
  let appId: string;

  try {
    // Validate app ID from headers
    try {
      const { validateAppFeature } = await import("@/lib/utils/app-validator");
      appId = validateAppFeature(req, "otpLogin");
    } catch (error) {
      if (error instanceof Error && error.name === "AppValidationError") {
        return NextResponse.json(
          { error: error.message },
          { status: (error as any).statusCode || 401 }
        );
      }
      throw error;
    }

    console.log(`[${requestId}] [Verify] Request received`, {
      timestamp: new Date().toISOString(),
      appId: appId,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    const body = await req.json();
    const { phoneNumber: phoneNum, code, disableSession: disableSessionValue = false } = body;
    phoneNumber = phoneNum;
    disableSession = disableSessionValue;

    console.log(`[${requestId}] [Verify] Request body parsed`, {
      phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "missing",
      hasCode: !!code,
      codeLength: code?.length || 0,
      disableSession,
    });

    // Validate phone number
    if (!phoneNumber) {
      console.log(`[${requestId}] [Verify] Validation failed: Phone number is missing`);
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate OTP code
    if (!code) {
      console.log(`[${requestId}] [Verify] Validation failed: OTP code is missing`, {
        phoneNumber: `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}`,
      });
      return NextResponse.json(
        { error: "OTP code is required" },
        { status: 400 }
      );
    }

    // Validate phone number format (E.164 format: + followed by country code and number)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      console.log(`[${requestId}] [Verify] Validation failed: Invalid phone number format`, {
        phoneNumber: `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}`,
      });
      return NextResponse.json(
        {
          error:
            "Invalid phone number format. Please use E.164 format (e.g., +919876543210)",
        },
        { status: 400 }
      );
    }

    // Validate OTP code format (typically 4-8 digits)
    const codeRegex = /^\d{4,8}$/;
    if (!codeRegex.test(code)) {
      console.log(`[${requestId}] [Verify] Validation failed: Invalid OTP code format`, {
        phoneNumber: `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}`,
        codeLength: code.length,
      });
      return NextResponse.json(
        { error: "Invalid OTP code format. OTP should be 4-8 digits" },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] [Verify] Validation passed`, {
      phoneNumber: `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}`,
      codeLength: code.length,
    });

    // TEST MODE: Handle test phone number 9999999999 with OTP 123456
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const isTestNumber = cleanPhone === "9999999999" || cleanPhone === "919999999999";
    const isTestOTP = code === "123456";

    if (isTestNumber && isTestOTP) {
      console.log(`[${requestId}] [Verify] Test mode detected - bypassing Better Auth verification`, {
        phoneNumber: `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}`,
        appId: appId,
      });

      try {
        // Check if user already exists for this app
        const dbQueryStartTime = Date.now();
        let currentUser = await findUserByPhoneAndApp(phoneNumber, appId);
        const dbQueryDuration = Date.now() - dbQueryStartTime;

        if (currentUser) {
          // Update existing user
          console.log(`[${requestId}] [Verify] Updating existing user for test number`, {
            userId: currentUser.id,
            appId: appId,
            dbQueryDuration: `${dbQueryDuration}ms`,
          });

          const updateStartTime = Date.now();
          await db
            .update(user)
            .set({
              phoneNumber: phoneNumber,
              phoneNumberVerified: true,
              updatedAt: new Date(),
            })
            .where(eq(user.id, currentUser.id));
          const updateDuration = Date.now() - updateStartTime;

          console.log(`[${requestId}] [Verify] User updated for test number`, {
            userId: currentUser.id,
            updateDuration: `${updateDuration}ms`,
          });
        } else {
          // Check if user exists globally (across all apps)
          let existingUser = null;

          existingUser = await findUserByPhone(phoneNumber);

          if (!existingUser) {
            const cleanPhone = phoneNumber.replace(/\D/g, "");
            const tempEmail = `${cleanPhone}@alertpay.local`;
            existingUser = await findUserByEmail(tempEmail);
          }

          if (existingUser) {
            // User exists in another app - link them to this app
            console.log(`[${requestId}] [Verify] Linking existing user to app ${appId} (test mode)`, {
              userId: existingUser.id,
              appId: appId,
            });

            currentUser = existingUser;

            // Update user info
            await db.update(user)
              .set({
                phoneNumber: phoneNumber,
                phoneNumberVerified: true,
                updatedAt: new Date(),
              })
              .where(eq(user.id, currentUser.id));

            // Create metadata entry for this app
            await updateUserMetadata(currentUser.id, appId);
          } else {
            // Create new user with app context
            console.log(`[${requestId}] [Verify] Creating new user for test number`, {
              appId: appId,
              dbQueryDuration: `${dbQueryDuration}ms`,
            });

            const createStartTime = Date.now();
            const cleanPhone = phoneNumber.replace(/\D/g, "");
            const tempEmail = `${cleanPhone}@alertpay.local`;
            const tempName = `User ${cleanPhone.slice(-4)}`;

            currentUser = await createUserWithApp(
              {
                name: tempName,
                email: tempEmail,
                emailVerified: false,
                phoneNumber: phoneNumber,
                phoneNumberVerified: true,
              },
              appId
            );
            const createDuration = Date.now() - createStartTime;

            console.log(`[${requestId}] [Verify] User created for test number`, {
              userId: currentUser.id,
              appId: appId,
              createDuration: `${createDuration}ms`,
            });
          }
        }

        // Create session with app context
        let sessionToken = null;
        if (!disableSession) {
          const sessionStartTime = Date.now();
          sessionToken = await createSessionWithApp(currentUser.id, appId, req);
          const sessionDuration = Date.now() - sessionStartTime;

          console.log(`[${requestId}] [Verify] Session created for test number`, {
            userId: currentUser.id,
            appId: appId,
            sessionDuration: `${sessionDuration}ms`,
          });
        }

        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] [Verify] Test mode verification completed`, {
          totalDuration: `${totalDuration}ms`,
          userId: currentUser.id,
          hasSession: !disableSession,
        });

        return NextResponse.json(
          {
            success: true,
            message: "OTP verified successfully (test mode)",
            data: {
              status: true,
              token: sessionToken,
              user: {
                id: currentUser.id,
                email: currentUser.email,
                emailVerified: currentUser.emailVerified,
                name: currentUser.name,
                image: currentUser.image,
                phoneNumber: phoneNumber,
                phoneNumberVerified: true,
                createdAt: currentUser.createdAt,
                updatedAt: new Date(),
              },
              appId: appId,
            },
          },
          { status: 200 }
        );
      } catch (testError) {
        console.error(`[${requestId}] [Verify] Error in test mode verification`, {
          error: testError instanceof Error ? testError.message : String(testError),
          errorType: testError instanceof Error ? testError.constructor.name : typeof testError,
        });
        return NextResponse.json(
          {
            error: "Failed to verify test OTP",
            details: testError instanceof Error ? testError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // Use Better Auth's API to verify phone number
    // This will automatically create a user if signUpOnVerification is configured
    try {
      // console.log(`[${requestId}] [Verify] Calling Better Auth API to verify phone number`, {
      //   phoneNumber: `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}`,
      //   disableSession,
      // });

      const authApiStartTime = Date.now();
      const result = await auth.api.verifyPhoneNumber({
        body: {
          phoneNumber: phoneNumber,
          code: code,
          disableSession: disableSession,
          // updatePhoneNumber: updatePhoneNumber,
        },
        headers: req.headers,
      });
      const authApiDuration = Date.now() - authApiStartTime;

      if (!result.token && !disableSession) {
        console.warn(`[${requestId}] [Verify] ⚠️ CRITICAL: Token missing in successful verification!`, {
          userId: result.user?.id,
          phoneNumberVerified: result.user?.phoneNumberVerified,
          isNew: result.user?.createdAt ? Date.now() - new Date(result.user.createdAt).getTime() < 5000 : false
        });
      }

      console.log(`[${requestId}] [Verify] Better Auth API verification successful`, {
        duration: `${authApiDuration}ms`,
        hasToken: !!result.token,
        userId: result.user?.id || "unknown",
      });

      // const totalDuration = Date.now() - startTime;
      // console.log(`[${requestId}] [Verify] Request completed successfully`, {
      //   totalDuration: `${totalDuration}ms`,
      //   userId: result.user?.id || "unknown",
      // });

      // Handle successful verification
      // Result structure: { status: boolean, token: string | null, user: UserWithPhoneNumber }
      return NextResponse.json(
        {
          success: true,
          message: "OTP verified successfully",
          data: result,
        },
        {
          status: 200,
        }
      );
    } catch (apiError: unknown) {
      const authApiDuration = Date.now() - startTime;
      console.error(`[${requestId}] [Verify] Better Auth API error`, {
        duration: `${authApiDuration}ms`,
        phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
        error: apiError instanceof Error ? apiError.message : String(apiError),
        errorType: apiError instanceof Error ? apiError.constructor.name : typeof apiError,
      });

      // Check if it's a duplicate email constraint error
      // Better Auth errors can be in different formats:
      // 1. PostgreSQL error objects with code, constraint, etc.
      // 2. Error objects with error.message
      // 3. Plain Error instances
      let errorMessage = "";
      let isDuplicateEmailError = false;

      if (apiError && typeof apiError === "object") {
        // Check for PostgreSQL error structure
        if ("code" in apiError && apiError.code === "23505") {
          // PostgreSQL unique constraint violation
          const pgError = apiError as { constraint?: string; detail?: string };
          if (pgError.constraint === "user_email_unique") {
            isDuplicateEmailError = true;
          }
        }

        // Check error message in various formats
        if ("error" in apiError) {
          const errorObj = apiError as { error?: { message?: string } };
          errorMessage = errorObj.error?.message || "";
        } else if ("message" in apiError) {
          errorMessage = (apiError as { message: string }).message;
        }
      } else if (apiError instanceof Error) {
        errorMessage = apiError.message;
      } else {
        errorMessage = String(apiError);
      }

      // Check for duplicate email constraint error in message
      if (
        !isDuplicateEmailError &&
        (errorMessage.includes(
          "duplicate key value violates unique constraint"
        ) &&
          errorMessage.includes("user_email_unique"))
      ) {
        isDuplicateEmailError = true;
      }

      // Check for duplicate email constraint error
      // This happens when OTP verification succeeds but user creation fails due to duplicate email
      // In this case, the OTP was already consumed, so we can't retry verification
      // Instead, we update the existing user and create a session directly
      if (isDuplicateEmailError) {
        console.log(
          `[${requestId}] [Verify] Duplicate email detected, OTP was already verified. Linking phone number to existing user`,
          {
            phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
          }
        );

        // Generate the temp email that Better Auth would have tried to use
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        const tempEmail = `${cleanPhone}@alertpay.local`;

        try {
          console.log(`[${requestId}] [Verify] Searching for existing user`, {
            tempEmail: `${tempEmail.slice(0, 8)}****`,
            phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
          });

          // Find existing user by email (the temp email) or phone number
          const dbQueryStartTime = Date.now();
          const existingUsers = await db
            .select()
            .from(user)
            .where(
              or(eq(user.email, tempEmail), eq(user.phoneNumber, phoneNumber))
            )
            .limit(1);
          const dbQueryDuration = Date.now() - dbQueryStartTime;

          if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            console.log(
              `[${requestId}] [Verify] Found existing user, updating phone number`,
              {
                userId: existingUser.id,
                dbQueryDuration: `${dbQueryDuration}ms`,
                currentPhoneNumber: existingUser.phoneNumber
                  ? `${existingUser.phoneNumber.slice(0, 4)}****${existingUser.phoneNumber.slice(-2)}`
                  : "none",
              }
            );

            // Update the existing user's phone number
            // The OTP was already verified in the first attempt, so we can mark it as verified
            const updateStartTime = Date.now();
            await db
              .update(user)
              .set({
                phoneNumber: phoneNumber,
                phoneNumberVerified: true,
                updatedAt: new Date(),
              })
              .where(eq(user.id, existingUser.id));
            const updateDuration = Date.now() - updateStartTime;

            console.log(`[${requestId}] [Verify] User phone number updated`, {
              userId: existingUser.id,
              updateDuration: `${updateDuration}ms`,
            });

            // Create a session token for the user
            // Since OTP was already verified (we got to user creation step), we can create session directly
            const sessionToken = nanoid(32);
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

            // Check if session creation is disabled
            if (!disableSession) {
              const sessionStartTime = Date.now();
              await db.insert(session).values({
                id: nanoid(),
                token: sessionToken,
                userId: existingUser.id,
                expiresAt: expiresAt,
                createdAt: new Date(),
                updatedAt: new Date(),
                ipAddress:
                  req.headers.get("x-forwarded-for") ||
                  req.headers.get("x-real-ip") ||
                  null,
                userAgent: req.headers.get("user-agent") || null,
              });
              const sessionDuration = Date.now() - sessionStartTime;

              console.log(`[${requestId}] [Verify] Session created`, {
                userId: existingUser.id,
                sessionDuration: `${sessionDuration}ms`,
                expiresAt: expiresAt.toISOString(),
              });
            } else {
              console.log(`[${requestId}] [Verify] Session creation disabled`, {
                userId: existingUser.id,
              });
            }

            const totalDuration = Date.now() - startTime;
            console.log(
              `[${requestId}] [Verify] Successfully linked phone number to existing user and created session`,
              {
                totalDuration: `${totalDuration}ms`,
                userId: existingUser.id,
                hasSession: !disableSession,
              }
            );

            // Return success with updated user info and session token
            return NextResponse.json(
              {
                success: true,
                message: "Phone number verified and linked to existing account",
                data: {
                  status: true,
                  token: disableSession ? null : sessionToken,
                  user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    emailVerified: existingUser.emailVerified,
                    name: existingUser.name,
                    image: existingUser.image,
                    phoneNumber: phoneNumber,
                    phoneNumberVerified: true,
                    createdAt: existingUser.createdAt,
                    updatedAt: new Date(),
                  },
                },
              },
              {
                status: 200,
              }
            );
          } else {
            // User not found by email or phone, this shouldn't happen but handle it
            console.error(
              `[${requestId}] [Verify] Duplicate email error but user not found in database`,
              {
                tempEmail: `${tempEmail.slice(0, 8)}****`,
                phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
              }
            );
            return NextResponse.json(
              {
                error:
                  "Account with this email already exists. Please sign in with your existing account.",
              },
              { status: 409 }
            );
          }
        } catch (dbError) {
          console.error(
            `[${requestId}] [Verify] Database error while handling duplicate`,
            {
              error: dbError instanceof Error ? dbError.message : String(dbError),
              errorType: dbError instanceof Error ? dbError.constructor.name : typeof dbError,
              phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
            }
          );
          return NextResponse.json(
            {
              error: "Failed to link phone number to existing account",
              details:
                dbError instanceof Error ? dbError.message : "Unknown error",
            },
            { status: 500 }
          );
        }
      }

      // Better Auth API errors are thrown as objects with error property or as APIError objects
      if ((apiError && typeof apiError === "object" && "error" in apiError) ||
        (apiError instanceof Error && (apiError.name === "APIError" || apiError.stack?.includes("APIError") || (apiError as any).status))) {
        let finalErrorMessage = errorMessage;
        let errorStatus = (apiError as any).status || 401;

        if (apiError && typeof apiError === "object" && "error" in apiError) {
          const errorObj = apiError as {
            error?: { message?: string; status?: number };
          };
          finalErrorMessage = errorObj.error?.message || errorMessage || "Verification failed";
          errorStatus = errorObj.error?.status || errorStatus;
        }

        // Log the specific error for debugging
        const totalDuration = Date.now() - startTime;
        console.error(`[${requestId}] [Verify] Better Auth error response`, {
          message: finalErrorMessage,
          status: errorStatus,
          phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
          totalDuration: `${totalDuration}ms`,
        });

        return NextResponse.json(
          { error: finalErrorMessage },
          { status: errorStatus }
        );
      }

      // Re-throw if it's not a Better Auth error
      throw apiError;
    }
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`[${requestId}] [Verify] Unexpected error in phone number verification`, {
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
      phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
      totalDuration: `${totalDuration}ms`,
    });

    if (error && typeof error === "object") {
      // Check for duplicate email constraint error in outer catch (database errors)
      // Handle both Error instances and PostgreSQL error objects
      let isDuplicateEmailError = false;
      let errorMessage = "";

      // Check for PostgreSQL error structure
      if ("code" in error && error.code === "23505") {
        const pgError = error as { constraint?: string };
        if (pgError.constraint === "user_email_unique") {
          isDuplicateEmailError = true;
        }
      }

      // Check error message
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if ("message" in error) {
        errorMessage = String(error.message);
      }

      if (
        !isDuplicateEmailError &&
        errorMessage.includes(
          "duplicate key value violates unique constraint"
        ) &&
        errorMessage.includes("user_email_unique")
      ) {
        isDuplicateEmailError = true;
      }

      if (isDuplicateEmailError && phoneNumber) {
        console.log(
          `[${requestId}] [Verify] Duplicate email detected in outer catch, OTP was already verified. Linking phone number to existing user`,
          {
            phoneNumber: `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}`,
          }
        );

        // Generate the temp email that Better Auth would have tried to use
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        const tempEmail = `${cleanPhone}@alertpay.local`;

        try {
          console.log(`[${requestId}] [Verify] Searching for existing user (outer catch)`, {
            tempEmail: `${tempEmail.slice(0, 8)}****`,
            phoneNumber: `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}`,
          });

          // Find existing user by email (the temp email) or phone number
          const dbQueryStartTime = Date.now();
          const existingUsers = await db
            .select()
            .from(user)
            .where(
              or(eq(user.email, tempEmail), eq(user.phoneNumber, phoneNumber))
            )
            .limit(1);
          const dbQueryDuration = Date.now() - dbQueryStartTime;

          if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            console.log(
              `[${requestId}] [Verify] Found existing user, updating phone number (outer catch)`,
              {
                userId: existingUser.id,
                dbQueryDuration: `${dbQueryDuration}ms`,
                currentPhoneNumber: existingUser.phoneNumber
                  ? `${existingUser.phoneNumber.slice(0, 4)}****${existingUser.phoneNumber.slice(-2)}`
                  : "none",
              }
            );

            // Update the existing user's phone number
            // The OTP was already verified (we got to user creation step), so we can mark it as verified
            const updateStartTime = Date.now();
            await db
              .update(user)
              .set({
                phoneNumber: phoneNumber,
                phoneNumberVerified: true,
                updatedAt: new Date(),
              })
              .where(eq(user.id, existingUser.id));
            const updateDuration = Date.now() - updateStartTime;

            console.log(`[${requestId}] [Verify] User phone number updated (outer catch)`, {
              userId: existingUser.id,
              updateDuration: `${updateDuration}ms`,
            });

            // Create a session token for the user
            const sessionToken = nanoid(32);
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

            // Check if session creation is disabled
            if (!disableSession) {
              const sessionStartTime = Date.now();
              await db.insert(session).values({
                id: nanoid(),
                token: sessionToken,
                userId: existingUser.id,
                expiresAt: expiresAt,
                createdAt: new Date(),
                updatedAt: new Date(),
                ipAddress:
                  req.headers.get("x-forwarded-for") ||
                  req.headers.get("x-real-ip") ||
                  null,
                userAgent: req.headers.get("user-agent") || null,
              });
              const sessionDuration = Date.now() - sessionStartTime;

              console.log(`[${requestId}] [Verify] Session created (outer catch)`, {
                userId: existingUser.id,
                sessionDuration: `${sessionDuration}ms`,
                expiresAt: expiresAt.toISOString(),
              });
            } else {
              console.log(`[${requestId}] [Verify] Session creation disabled (outer catch)`, {
                userId: existingUser.id,
              });
            }

            const totalDuration = Date.now() - startTime;
            console.log(
              `[${requestId}] [Verify] Successfully linked phone number to existing user and created session (outer catch)`,
              {
                totalDuration: `${totalDuration}ms`,
                userId: existingUser.id,
                hasSession: !disableSession,
              }
            );

            // Return success with updated user info and session token
            return NextResponse.json(
              {
                success: true,
                message: "Phone number verified and linked to existing account",
                data: {
                  status: true,
                  token: disableSession ? null : sessionToken,
                  user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    emailVerified: existingUser.emailVerified,
                    name: existingUser.name,
                    image: existingUser.image,
                    phoneNumber: phoneNumber,
                    phoneNumberVerified: true,
                    createdAt: existingUser.createdAt,
                    updatedAt: new Date(),
                  },
                },
              },
              {
                status: 200,
              }
            );
          } else {
            // User not found by email or phone
            console.error(
              `[${requestId}] [Verify] Duplicate email error but user not found in database (outer catch)`,
              {
                tempEmail: `${tempEmail.slice(0, 8)}****`,
                phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
              }
            );
            return NextResponse.json(
              {
                error:
                  "Account with this email already exists. Please sign in with your existing account.",
              },
              { status: 409 }
            );
          }
        } catch (dbError) {
          console.error(
            `[${requestId}] [Verify] Database error while handling duplicate (outer catch)`,
            {
              error: dbError instanceof Error ? dbError.message : String(dbError),
              errorType: dbError instanceof Error ? dbError.constructor.name : typeof dbError,
              phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
            }
          );
          return NextResponse.json(
            {
              error: "Failed to link phone number to existing account",
              details:
                dbError instanceof Error ? dbError.message : "Unknown error",
            },
            { status: 500 }
          );
        }
      }

      // Check if it's an authentication error
      const errorMsg = error instanceof Error ? error.message : String(error);
      const lowerErrorMsg = errorMsg.toLowerCase();
      if (
        lowerErrorMsg.includes("invalid") ||
        lowerErrorMsg.includes("expired") ||
        lowerErrorMsg.includes("not found")
      ) {
        console.log(`[${requestId}] [Verify] Authentication error detected`, {
          errorMessage: errorMsg,
          status: 401,
          phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
        });
        return NextResponse.json(
          { error: errorMsg || "Invalid or expired OTP code" },
          { status: 401 }
        );
      }

      console.error(`[${requestId}] [Verify] Returning generic error response`, {
        errorMessage: errorMsg,
        status: 500,
        phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
      });
      return NextResponse.json(
        { error: errorMsg || "Failed to verify OTP" },
        { status: 500 }
      );
    }

    console.error(`[${requestId}] [Verify] Unhandled error - returning generic 500`, {
      phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-2)}` : "unknown",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
