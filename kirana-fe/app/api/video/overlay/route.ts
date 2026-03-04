import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import {
  processVideoWithOverlays,
  validateOverlayConfig,
  type OverlayConfig,
} from "@/lib/video-processor";
import { VIDEO_CONFIG } from "@/lib/constants/video-config";

interface VideoOverlayRequest {
  videoUrl: string;
  overlays: OverlayConfig[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("[POST /api/video/overlay] Request received");

    // Get the authenticated user's session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      console.warn("[POST /api/video/overlay] Unauthorized - no valid session");
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("[POST /api/video/overlay] Authenticated user:", userId);

    // Parse request body
    let body: VideoOverlayRequest;
    try {
      body = await request.json();
    } catch (error) {
      console.warn("[POST /api/video/overlay] Invalid JSON in request body");
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { videoUrl, overlays } = body;

    // Process overlays - map imageShape from "BLURRED CIRCLE" to "CIRCLE" if needed
    const processedOverlays = overlays.map((overlay) => {
      const processed: OverlayConfig = { ...overlay };

      // Map imageShape (handle "BLURRED CIRCLE" -> "CIRCLE")
      if (overlay.imageShape && typeof overlay.imageShape === "string") {
        const shapeMap: Record<
          string,
          "CIRCLE" | "RECTANGLE" | "ROUNDED_RECTANGLE"
        > = {
          "BLURRED CIRCLE": "CIRCLE",
          BLURRED_CIRCLE: "CIRCLE",
          CIRCLE: "CIRCLE",
          RECTANGLE: "RECTANGLE",
          ROUNDED_RECTANGLE: "ROUNDED_RECTANGLE",
        };
        const mappedShape = shapeMap[overlay.imageShape.toUpperCase()];
        if (mappedShape) {
          processed.imageShape = mappedShape;
        }
      }

      return processed;
    });

    // Validate required fields
    if (!videoUrl) {
      console.warn("[POST /api/video/overlay] Missing videoUrl");
      return NextResponse.json(
        { error: "videoUrl is required" },
        { status: 400 }
      );
    }

    if (!overlays || !Array.isArray(overlays)) {
      console.warn("[POST /api/video/overlay] Missing or invalid overlays");
      return NextResponse.json(
        { error: "overlays array is required" },
        { status: 400 }
      );
    }

    // Validate video URL format
    try {
      new URL(videoUrl);
    } catch (error) {
      console.warn("[POST /api/video/overlay] Invalid video URL format");
      return NextResponse.json(
        { error: "Invalid video URL format" },
        { status: 400 }
      );
    }

    // Validate overlay configuration
    const validation = validateOverlayConfig(processedOverlays);
    if (!validation.valid) {
      console.warn(
        "[POST /api/video/overlay] Invalid overlay config:",
        validation.error
      );
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.log("[POST /api/video/overlay] Processing video with overlays:", {
      videoUrl,
      overlayCount: processedOverlays.length,
      userId,
    });

    // Process video
    const result = await processVideoWithOverlays({
      videoUrl,
      overlays: processedOverlays,
    });

    if (!result.success) {
      console.error(
        "[POST /api/video/overlay] Video processing failed:",
        result.error
      );
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Video processing failed",
        },
        { status: 500 }
      );
    }

    const totalTime = Date.now() - startTime;
    console.log(
      "[POST /api/video/overlay] Video processed successfully:",
      result.videoUrl,
      `(${totalTime}ms)`
    );

    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      processingTime: totalTime,
    });
  } catch (error: unknown) {
    console.error("[POST /api/video/overlay] Unexpected error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const totalTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        processingTime: totalTime,
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "video-overlay",
    maxVideoSize: VIDEO_CONFIG.MAX_VIDEO_SIZE,
    maxOverlays: VIDEO_CONFIG.MAX_OVERLAYS,
    supportedVideoFormats: VIDEO_CONFIG.SUPPORTED_VIDEO_FORMATS,
    supportedImageFormats: VIDEO_CONFIG.SUPPORTED_IMAGE_FORMATS,
  });
}
