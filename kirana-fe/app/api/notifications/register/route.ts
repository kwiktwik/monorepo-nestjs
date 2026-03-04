import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { pushTokens } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session?.user) {
            console.warn("[FCM register] 401 Unauthorized - no valid session");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { token, appId, deviceModel, osVersion } = await req.json();

        if (!token || !appId) {
            console.warn("[FCM register] 400 Bad Request", { hasToken: !!token, hasAppId: !!appId });
            return NextResponse.json({ error: "Token and App ID are required" }, { status: 400 });
        }

        const userId = session.user.id;
        const now = new Date();

        // Atomic upsert — ON CONFLICT (token) update owner + metadata
        await db
            .insert(pushTokens)
            .values({
                userId,
                appId,
                token,
                deviceModel: deviceModel ?? null,
                osVersion: osVersion ?? null,
                isActive: true,
                updatedAt: now,
            })
            .onConflictDoUpdate({
                target: pushTokens.token,
                set: {
                    userId,
                    appId,
                    deviceModel: sql`COALESCE(${deviceModel ?? null}, ${pushTokens.deviceModel})`,
                    osVersion: sql`COALESCE(${osVersion ?? null}, ${pushTokens.osVersion})`,
                    isActive: true,
                    updatedAt: now,
                },
            });

        console.log("[FCM register] OK - user:", userId, "appId:", appId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[FCM register] 500 Error:", error);
        return NextResponse.json(
            { error: "Failed to register push token" },
            { status: 500 }
        );
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { token, appId } = await req.json();

        if (!token || !appId) {
            return NextResponse.json({ error: "Token and App ID are required" }, { status: 400 });
        }

        const userId = session.user.id;

        await db
            .delete(pushTokens)
            .where(
                and(
                    eq(pushTokens.token, token),
                    eq(pushTokens.userId, userId),
                    eq(pushTokens.appId, appId)
                )
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting push token:", error);
        return NextResponse.json(
            { error: "Failed to delete push token" },
            { status: 500 }
        );
    }
}
