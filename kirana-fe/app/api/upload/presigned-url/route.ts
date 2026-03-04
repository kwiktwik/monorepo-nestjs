import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2_CONFIG } from "@/lib/constants/video-config";
import { db } from "@/db";
import { userImages } from "@/db/schema";
import { validateAppId } from "@/lib/utils/app-validator";

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_CONFIG.ENDPOINT,
  credentials: {
    accessKeyId: R2_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: R2_CONFIG.SECRET_ACCESS_KEY,
  },
});

interface PresignedUrlRequest {
  fileName: string;
  contentType?: string;
  expiresIn?: number; // in seconds, default 3600 (1 hour)
}

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
    console.log("[POST /api/upload/presigned-url] Request for userId:", userId, "appId:", appId);

    // Parse request body
    let body: PresignedUrlRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { fileName, contentType = "image/jpeg", expiresIn = 3600 } = body;

    // Validate required fields
    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 }
      );
    }

    // Validate file extension
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    // Validate content type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid content type. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate expiration time (max 7 days)
    if (expiresIn > 604800) {
      return NextResponse.json(
        { error: "expiresIn cannot exceed 604800 seconds (7 days)" },
        { status: 400 }
      );
    }



    // Generate unique key with App ID and user ID prefix
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${appId}/${userId}/user-images/${timestamp}_${sanitizedFileName}`;

    // Prepend project folder if configured
    const fullKey = R2_CONFIG.PROJECT_FOLDER
      ? `${R2_CONFIG.PROJECT_FOLDER}/${key}`
      : key;



    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.BUCKET_NAME,
      Key: fullKey,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn,
    });

    // Construct the public URL that will be accessible after upload
    const publicUrl = `https://cnd.storyowl.app/${key}`;



    // Create new entry on each upload; background removal will UPDATE this row (removed_bg_image_url)
    try {
      console.log(`[POST /api/upload/presigned-url] Creating user_images entry for userId: ${userId}, appId: ${appId}`);

      const [insertedImage] = await db.insert(userImages).values({
        userId,
        appId,
        imageUrl: publicUrl,
        createdAt: new Date(),
      }).returning();

      console.log(`[POST /api/upload/presigned-url] Created user_images entry with ID: ${insertedImage.id}`);

      return NextResponse.json({
        success: true,
        uploadUrl: presignedUrl,
        publicUrl: publicUrl,
        key: key,
        imageId: insertedImage.id,
        expiresIn: expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      });
    } catch (dbError) {
      console.error(`[POST /api/upload/presigned-url] Failed to save to DB (non-fatal):`, dbError);
      return NextResponse.json({
        success: true,
        uploadUrl: presignedUrl,
        publicUrl: publicUrl,
        key: key,
        expiresIn: expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      });
    }
  } catch (error: unknown) {
    console.error(`[POST /api/upload/presigned-url] Unexpected error:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
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
    service: "presigned-url-generator",
    supportedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
    maxExpiresIn: 604800, // 7 days in seconds
    defaultExpiresIn: 3600, // 1 hour in seconds
  });
}
