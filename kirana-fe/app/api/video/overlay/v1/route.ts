import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import axios from "axios";

// Python backend URL - configure via environment variable
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

interface VideoOverlayRequest {
  videoUrl: string;
  overlays: Array<{
    imageUrl?: string;
    imageData?: string;
    imageShape?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    startTime?: number;
    endTime?: number;
    shapeImageUrl?: string;
  }>;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("[POST /api/video/overlay] Request received - proxying to Python backend");

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
    } catch {
      console.warn("[POST /api/video/overlay] Invalid JSON in request body");
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.log("[POST /api/video/overlay] Proxying request to Python backend:", {
      url: `${PYTHON_BACKEND_URL}/backend/api/v1/video/overlay`,
      videoUrl: body.videoUrl,
      overlayCount: body.overlays?.length,
      userId,
    });

    // Forward request to Python backend
    try {
      const response = await axios.post(
        `${PYTHON_BACKEND_URL}/api/v1/video/overlay`,
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
        "[POST /api/video/overlay] Python backend response received:",
        response.data,
        `(${totalTime}ms)`
      );

      return NextResponse.json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[POST /api/video/overlay] Python backend error:", {
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

// Health check endpoint - proxy to Python backend
export async function GET() {
  try {
    console.log("[GET /api/video/overlay] Health check - proxying to Python backend");
    
    const response = await axios.get(
      `${PYTHON_BACKEND_URL}/api/v1/video/overlay`,
      {
        timeout: 5000,
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("[GET /api/video/overlay] Python backend health check failed:", error);
    
    return NextResponse.json(
      {
        status: "error",
        service: "video-overlay",
        error: "Python backend unavailable",
        backendUrl: PYTHON_BACKEND_URL,
      },
      { status: 503 }
    );
  }
}
