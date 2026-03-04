import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import axios from "axios";

// Python backend URL - configure via environment variable
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

interface VideoOverlayByContentRequest {
  contentId: string;
  imageUrl?: string;
  imageData?: string;
  imagePercentageFromStart?: number;
  imagePercentageFromTop?: number;
  imagePercentageWidth?: number;
  imageSizeExperimentMultiplier?: number;
  increaseDefaultProfileSizeByValue?: number;
  imageShape?: string;
  shapeImageUrl?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("[POST /api/video/overlay/by-content-id] Request received - proxying to Python backend");

    // Check environment to bypass auth
    const isDevelopment = process.env.NODE_ENV === "development";
    let userId = "dev-user";

    if (!isDevelopment) {
      // Get the authenticated user's session
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session || !session.user) {
        console.warn(
          "[POST /api/video/overlay/by-content-id] Unauthorized - no valid session"
        );
        return NextResponse.json(
          { error: "Unauthorized - no valid session" },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }
    console.log("[POST /api/video/overlay/by-content-id] Authenticated user:", userId);

    // Parse request body
    let body: VideoOverlayByContentRequest;
    try {
      body = await request.json();
      console.log("[POST /api/video/overlay/by-content-id] Parsed Request Body from Client:", JSON.stringify(body, null, 2));
    } catch {
      console.warn("[POST /api/video/overlay/by-content-id] Invalid JSON in request body");
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.contentId) {
      console.warn("[POST /api/video/overlay/by-content-id] Missing contentId");
      return NextResponse.json(
        { error: "contentId is required" },
        { status: 400 }
      );
    }

    if (!body.imageUrl && !body.imageData) {
      console.warn("[POST /api/video/overlay/by-content-id] Missing image source");
      return NextResponse.json(
        { error: "Either imageUrl or imageData must be provided" },
        { status: 400 }
      );
    }
    // Forward request to Python backend
    try {
      const response = await axios.post(
        `${PYTHON_BACKEND_URL}/api/v1/video/overlay/by-content-id`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 300000, // 5 minutes timeout for video processing
        }
      );

      const totalTime = Date.now() - startTime;
      console.log(
        "[POST /api/video/overlay/by-content-id] Python backend response received:",
        response.data,
        `(${totalTime}ms)`
      );

      return NextResponse.json({...response.data, message: "Video processing successful"});
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[POST /api/video/overlay/by-content-id] Python backend error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        const statusCode = error.response?.status || 500;
        const errorData = error.response?.data || {
          success: false,
          error: error.message || "Python backend request failed"
        };

        return NextResponse.json(errorData, { status: statusCode });
      }

      throw error;
    }
  } catch (error: unknown) {
    console.error("[POST /api/video/overlay/by-content-id] Unexpected error:", error);
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
