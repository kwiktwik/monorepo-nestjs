import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId } from "@/lib/utils/app-validator";
import axios from "axios";

interface BackgroundRemovalRequest {
    imageUrl: string;
    imageId: number;
    key: string;
}

/**
 * POST /api/background-removal
 * 
 * Triggers background removal for an uploaded image.
 * This should be called by the frontend AFTER the image has been successfully uploaded to R2.
 * 
 * Body Parameters:
 * - imageUrl: The public URL of the uploaded image (required, string)
 * - imageId: The database ID of the image record (required, number)
 * - key: The R2 key for the image (required, string)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Background removal task queued",
 *   "imageId": 123
 * }
 * 
 * Response (400 Bad Request):
 * {
 *   "error": "Missing required fields: imageUrl, imageId, key"
 * }
 * 
 * Response (401 Unauthorized):
 * {
 *   "error": "Unauthorized - no valid session"
 * }
 * 
 * Response (500 Internal Server Error):
 * {
 *   "error": "Failed to trigger background removal"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Validate app ID from headers
        let appId: string;
        try {
            appId = validateAppId(request);
        } catch (error) {
            if (error instanceof Error && error.name === "AppValidationError") {
                const appError = error as any;
                return NextResponse.json(
                    { error: error.message },
                    { status: appError.statusCode || 401 }
                );
            }
            throw error;
        }

        // Get the Better Auth session from the incoming request
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized - no valid session" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        console.log("[POST /api/background-removal] Request from userId:", userId, "appId:", appId);

        // Parse request body
        let body: BackgroundRemovalRequest;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        const { imageUrl, imageId, key } = body;

        // Validate required fields
        if (!imageUrl || !imageId || !key) {
            return NextResponse.json(
                { error: "Missing required fields: imageUrl, imageId, key" },
                { status: 400 }
            );
        }

        console.log(`[POST /api/background-removal] Triggering for image ${imageId}: ${imageUrl}`);

        // Call Python backend
        const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

        try {
            const response = await axios.post(
                `${PYTHON_BACKEND_URL}/api/v1/background-removal/process-background-removal`,
                {
                    image_url: imageUrl,
                    image_id: imageId,
                    key: key,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    timeout: 5000, // Short timeout since Python processes in background
                }
            );

            if (response.status === 200) {
                console.log(`[POST /api/background-removal] ✅ Background removal task queued for image ${imageId}`);
                return NextResponse.json({
                    success: true,
                    message: "Background removal task queued",
                    imageId: imageId,
                });
            } else {
                console.error(`[POST /api/background-removal] ❌ Python API returned status: ${response.status}`);
                return NextResponse.json(
                    { error: `Python API returned status: ${response.status}` },
                    { status: 500 }
                );
            }
        } catch (error) {
            console.error(`[POST /api/background-removal] ❌ Failed to trigger background removal:`, error);
            if (axios.isAxiosError(error)) {
                console.error("[POST /api/background-removal] Error details:", {
                    status: error.response?.status,
                    data: error.response?.data,
                });
            }
            return NextResponse.json(
                { error: "Failed to trigger background removal" },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        console.error(`[POST /api/background-removal] Unexpected error:`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            type: error instanceof Error ? error.constructor.name : typeof error,
        });
        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}

// Optional: Add GET endpoint for health check
export async function GET() {
    return NextResponse.json({
        status: "ok",
        service: "background-removal-trigger",
        description: "Triggers background removal for uploaded images",
    });
}
