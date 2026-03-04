import { db } from "@/db";
import { user, userMetadata, session } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";

/**
 * User Helper Utilities for Multi-App Support
 * 
 * These functions handle user and session management with app context.
 */

export interface CreateUserData {
  name: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean;
  image?: string | null;
}

/**
 * Find user by phone number globally (across all apps)
 * Returns null if user doesn't exist
 */
export async function findUserByPhone(
  phoneNumber: string
): Promise<typeof user.$inferSelect | null> {
  const results = await db
    .select()
    .from(user)
    .where(eq(user.phoneNumber, phoneNumber))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

/**
 * Find user by email globally (across all apps)
 * Returns null if user doesn't exist
 */
export async function findUserByEmail(
  email: string
): Promise<typeof user.$inferSelect | null> {
  const results = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

/**
 * Find user by phone number and app ID
 * Returns null if user doesn't exist for this app
 */
export async function findUserByPhoneAndApp(
  phoneNumber: string,
  appId: string
): Promise<typeof user.$inferSelect | null> {
  const results = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      phoneNumberVerified: user.phoneNumberVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .innerJoin(userMetadata, eq(user.id, userMetadata.userId))
    .where(
      and(
        eq(user.phoneNumber, phoneNumber),
        eq(userMetadata.appId, appId)
      )
    )
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

/**
 * Find user by email and app ID
 * Returns null if user doesn't exist for this app
 */
export async function findUserByEmailAndApp(
  email: string,
  appId: string
): Promise<typeof user.$inferSelect | null> {
  const results = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      phoneNumberVerified: user.phoneNumberVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .innerJoin(userMetadata, eq(user.id, userMetadata.userId))
    .where(
      and(
        eq(user.email, email),
        eq(userMetadata.appId, appId)
      )
    )
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

/**
 * Create user with app metadata
 * Returns the created user
 */
export async function createUserWithApp(
  userData: CreateUserData,
  appId: string
): Promise<typeof user.$inferSelect> {
  const userId = nanoid();
  
  // Create user
  const newUsers = await db
    .insert(user)
    .values({
      id: userId,
      name: userData.name,
      email: userData.email,
      emailVerified: userData.emailVerified,
      phoneNumber: userData.phoneNumber || null,
      phoneNumberVerified: userData.phoneNumberVerified || false,
      image: userData.image || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const newUser = newUsers[0];

  // Create user metadata with app ID
  await db.insert(userMetadata).values({
    userId: newUser.id,
    appId: appId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return newUser;
}

/**
 * Update or create user metadata with app ID
 * Used when linking existing users to apps
 */
export async function updateUserMetadata(
  userId: string,
  appId: string,
  additionalData?: {
    upiVpa?: string;
    audioLanguage?: string;
  }
): Promise<void> {
  // Check if metadata exists for this user AND app
  const existing = await db
    .select()
    .from(userMetadata)
    .where(
      and(
        eq(userMetadata.userId, userId),
        eq(userMetadata.appId, appId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing metadata for this specific app
    await db
      .update(userMetadata)
      .set({
        upiVpa: additionalData?.upiVpa || existing[0].upiVpa,
        audioLanguage: additionalData?.audioLanguage || existing[0].audioLanguage,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userMetadata.userId, userId),
          eq(userMetadata.appId, appId)
        )
      );
  } else {
    // Create new metadata for this app
    await db.insert(userMetadata).values({
      userId: userId,
      appId: appId,
      upiVpa: additionalData?.upiVpa || null,
      audioLanguage: additionalData?.audioLanguage || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Create session with app context
 * Returns the session token
 */
export async function createSessionWithApp(
  userId: string,
  appId: string,
  req: NextRequest | Request
): Promise<string> {
  const sessionToken = nanoid(32);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(session).values({
    id: nanoid(),
    token: sessionToken,
    userId: userId,
    appId: appId,
    expiresAt: expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress:
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      null,
    userAgent: req.headers.get("user-agent") || null,
  });

  return sessionToken;
}

/**
 * Get user metadata for specific app
 */
export async function getUserMetadata(userId: string, appId: string) {
  const results = await db
    .select()
    .from(userMetadata)
    .where(
      and(
        eq(userMetadata.userId, userId),
        eq(userMetadata.appId, appId)
      )
    )
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

/**
 * Get all user metadata across all apps
 */
export async function getAllUserMetadata(userId: string) {
  return await db
    .select()
    .from(userMetadata)
    .where(eq(userMetadata.userId, userId));
}
