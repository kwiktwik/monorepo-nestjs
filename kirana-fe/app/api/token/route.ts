import { NextRequest, NextResponse } from "next/server";
import { auth as betterAuth } from "@/lib/better-auth/auth";
import { auth as firebaseAdminAuth } from "@/lib/firebase/server";

export async function GET(req: NextRequest) {
  try {
    // Get the Better Auth session from the incoming request
    const session = await betterAuth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - no Better Auth session" },
        { status: 401 }
      );
    }

    if (!firebaseAdminAuth) {
      return NextResponse.json(
        { error: "Firebase Admin SDK not initialized" },
        { status: 500 }
      );
    }

    const user = session.user;
    const uid = user.id;

    console.log({ user, uid });
    // Ensure a corresponding Firebase user exists (idempotent)
    try {
      const response = await firebaseAdminAuth.getUserByEmail(user.email);
      console.log({ response });
    } catch {
      await firebaseAdminAuth.createUser({
        uid,
        email: user.email,
        displayName: user.email ?? undefined,
        photoURL: user.image ?? undefined,
        emailVerified: user.emailVerified ?? false,
      });
    }

    // Optional: attach custom claims that mirror your DB user
    const customClaims = {
      dbUserId: uid,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    const customToken = await firebaseAdminAuth.createCustomToken(
      uid,
      customClaims
    );

    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error("Error creating Firebase custom token:", error);
    return NextResponse.json(
      { error: "Failed to create Firebase custom token" },
      { status: 500 }
    );
  }
}

