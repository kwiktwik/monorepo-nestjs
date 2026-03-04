
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import axios from "axios";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { R2_CONFIG } from "@/lib/constants/video-config";
import { db } from "@/db";
import { userImages } from "@/db/schema";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";

// Python backend URL
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_CONFIG.ENDPOINT,
  credentials: {
    accessKeyId: R2_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: R2_CONFIG.SECRET_ACCESS_KEY,
  },
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validate app ID from headers
    let appId: string;
    try {
      appId = validateAppId(request);
    } catch (error) {
      if (error instanceof AppValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode || 401 }
        );
      }
      throw error;
    }

    // 2. Authentication
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

    const contentType = request.headers.get("content-type") || "";
    const backendEndpoint = `${PYTHON_BACKEND_URL}/api/v1/image-processing/remove-bg`;

    console.log(`[POST /api/image-processing/remove-bg] Processing request for userId: ${userId}, appId: ${appId}`);

    let imageUrl: string | undefined;

    // 3. Parse Request to get Image URL
    if (contentType.includes("application/json")) {
      const body = await request.json();
      imageUrl = body.image_url;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      imageUrl = params.get("image_url") || undefined;
    } else {
      // We are dropping multipart/form-data support for direct file upload in this specific flow 
      // to simplify the "save to DB" logic which relies on an existing "original" image record usually.
      // If we need to support direct upload + remove bg, we'd need to upload original first or handle it differently.
      // For now, based on the prompt "add this info in db also", it implies linking to an upload.
      return NextResponse.json(
        { error: "Content-Type must be application/json or application/x-www-form-urlencoded with image_url" },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "image_url is required" }, { status: 400 });
    }

    console.log(`[POST /api/image-processing/remove-bg] Image URL: ${imageUrl}`);

    // 4. Call Python Backend to Remove Background
    // We send it as x-www-form-urlencoded as seen in previous analysis
    const params = new URLSearchParams();
    params.append('image_url', imageUrl);

    const pythonResponse = await axios.post(backendEndpoint, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      responseType: 'arraybuffer',
      timeout: 60000 // 60s
    });

    // 4. Upload Result to R2
    const imageBuffer = pythonResponse.data;
    const timestamp = Date.now();
    const originalFileName = imageUrl.split('/').pop()?.split('?')[0] || `image_${timestamp}`;
    const cleanFileName = originalFileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, "_");
    const newKey = `bg-removed/${userId}/${timestamp}_${cleanFileName}.png`;

    // Prepend project folder if configured (though R2_CONFIG.PROJECT_FOLDER might be for user uploads, let's allow it)
    const fullKey = R2_CONFIG.PROJECT_FOLDER
      ? `${R2_CONFIG.PROJECT_FOLDER}/${newKey}`
      : newKey;

    await r2Client.send(new PutObjectCommand({
      Bucket: R2_CONFIG.BUCKET_NAME,
      Key: fullKey,
      Body: imageBuffer,
      ContentType: "image/png",
    }));

    const removedBgImageUrl = `https://cnd.storyowl.app/${newKey}`; // Using the same domain structure as presigned-url
    console.log(`[POST /api/image-processing/remove-bg] Uploaded to R2: ${removedBgImageUrl}`);

    // 5. Update Database
    // User request: "create new entry with both image" -> always INSERT a new record
    const inserted = await db
      .insert(userImages)
      .values({
        userId,
        appId: appId,
        imageUrl,
        removedBgImageUrl,
      })
      .returning({ id: userImages.id });

    console.log(
      `[POST /api/image-processing/remove-bg] Created DB record: ${inserted[0]?.id}`
    );

    // 6. Return Response
    return NextResponse.json({
      success: true,
      id: inserted[0]?.id,
      appId: appId,
      originalUrl: imageUrl,
      removedBgImageUrl: removedBgImageUrl,
    });

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "[POST /api/image-processing/remove-bg] Python backend error:",
        error.message
      );
      return NextResponse.json(
        { error: "Background removal failed downstream" },
        { status: error.response?.status || 500 }
      );
    }
    console.error("[POST /api/image-processing/remove-bg] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
