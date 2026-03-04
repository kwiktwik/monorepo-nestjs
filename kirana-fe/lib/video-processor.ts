import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import axios from "axios";
import { createWriteStream, createReadStream, promises as fs } from "fs";
import { join, dirname } from "path";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { VIDEO_CONFIG, R2_CONFIG } from "./constants/video-config";
import { execSync } from "child_process";
import { accessSync, constants as fsConstants } from "fs";

// Set FFmpeg path with fallback logic
function setupFFmpegPath() {
  // Priority 1: Environment variable
  if (process.env.FFMPEG_PATH) {
    try {
      accessSync(process.env.FFMPEG_PATH, fsConstants.X_OK);
      console.log("Using FFMPEG_PATH env var:", process.env.FFMPEG_PATH);
      ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
      return;
    } catch (error) {
      console.warn("FFMPEG_PATH env var set but binary not accessible:", error);
    }
  }

  // Priority 2: ffmpeg-static (but verify it exists)
  try {
    if (ffmpegStatic && typeof ffmpegStatic === 'string') {
      // Verify the binary actually exists
      accessSync(ffmpegStatic, fsConstants.X_OK);
      console.log("Using ffmpeg-static binary:", ffmpegStatic);
      ffmpeg.setFfmpegPath(ffmpegStatic);
      return;
    }
  } catch (error) {
    console.warn("ffmpeg-static path not accessible:", ffmpegStatic, error);
  }

  // Priority 3: System FFmpeg
  try {
    const systemFFmpegPath = execSync('which ffmpeg', { encoding: 'utf-8' }).trim();
    if (systemFFmpegPath) {
      accessSync(systemFFmpegPath, fsConstants.X_OK);
      console.log("Using system FFmpeg binary:", systemFFmpegPath);
      ffmpeg.setFfmpegPath(systemFFmpegPath);
      return;
    }
  } catch (error) {
    console.warn("System FFmpeg not found:", error);
  }

  // Priority 4: Try common installation paths
  const commonPaths = [
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/opt/homebrew/bin/ffmpeg',
  ];

  for (const path of commonPaths) {
    try {
      accessSync(path, fsConstants.X_OK);
      console.log("Using FFmpeg from common path:", path);
      ffmpeg.setFfmpegPath(path);
      return;
    } catch {
      // Continue to next path
    }
  }

  // If nothing works, throw an error
  console.error("FFmpeg binary not found! Please install FFmpeg or set FFMPEG_PATH environment variable.");
  throw new Error("FFmpeg binary not found. Install FFmpeg or set FFMPEG_PATH environment variable.");
}

// Initialize FFmpeg path synchronously
try {
  setupFFmpegPath();
} catch (error) {
  console.error("Failed to setup FFmpeg:", error);
  process.exit(1);  // Fail fast at startup
}

// Initialize R2 client (compatible with S3 API)
const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_CONFIG.ENDPOINT,
  credentials: {
    accessKeyId: R2_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: R2_CONFIG.SECRET_ACCESS_KEY,
  },
});

// Position adjustment configuration
// Instead of hardcoded offsets, we adjust position based on overlay size
// This ensures the overlay is properly centered at the specified position
const POSITION_CONFIG = {
  // When true, the position percentages refer to the CENTER of the overlay
  // When false, position percentages refer to the TOP-LEFT corner
  centerPosition: false, // Disabled - top-left positioning works better
};

export type ImageShape = "CIRCLE" | "RECTANGLE" | "ROUNDED_RECTANGLE";

export interface OverlayConfig {
  // Image source (one of these is required)
  imageUrl?: string;
  imageData?: string; // Base64 encoded

  // Shape configuration
  imageShape?: ImageShape;
  shapeImageUrl?: string; // Optional separate shape image

  // Absolute positioning (legacy support - pixels)
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  // Percentage-based positioning (Android-compatible)
  // These take precedence over absolute positioning if provided
  namePercentageWidth?: number;        // Width of text/name overlay as % of video width
  imagePercentageWidth?: number;       // Width of image as % of video width
  namePercentageBottom?: number;       // Distance from bottom as % of video height
  namePercentageFromTop?: number;      // Distance from top as % of video height
  imagePercentageFromTop?: number;     // Image distance from top as % of video height
  namePercentageFromStart?: number;    // Distance from left/start as % of video width
  imagePercentageFromStart?: number;   // Image distance from left/start as % of video width

  // Timing
  startTime?: number;
  endTime?: number;
}

export interface ProcessVideoOptions {
  videoUrl: string;
  overlays: OverlayConfig[];
}

export interface ProcessVideoResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
  processingTime?: number;
}

/**
 * Validate overlay configuration
 */
export function validateOverlayConfig(
  overlays: OverlayConfig[]
): { valid: boolean; error?: string } {
  if (!Array.isArray(overlays) || overlays.length === 0) {
    return { valid: false, error: "At least one overlay is required" };
  }

  if (overlays.length > VIDEO_CONFIG.MAX_OVERLAYS) {
    return {
      valid: false,
      error: `Maximum ${VIDEO_CONFIG.MAX_OVERLAYS} overlays allowed`,
    };
  }

  for (let i = 0; i < overlays.length; i++) {
    const overlay = overlays[i];

    if (!overlay.imageUrl && !overlay.imageData) {
      return {
        valid: false,
        error: `Overlay ${i}: Either imageUrl or imageData is required`,
      };
    }

    // Check if either absolute or percentage positioning is provided
    const hasAbsolutePosition = overlay.x !== undefined && overlay.y !== undefined;
    const hasPercentagePosition =
      overlay.imagePercentageFromStart !== undefined ||
      overlay.imagePercentageFromTop !== undefined ||
      overlay.namePercentageFromStart !== undefined ||
      overlay.namePercentageFromTop !== undefined;

    if (!hasAbsolutePosition && !hasPercentagePosition) {
      return {
        valid: false,
        error: `Overlay ${i}: Either absolute (x, y) or percentage-based positioning is required`,
      };
    }

    // Validate absolute positioning if provided
    if (hasAbsolutePosition) {
      if (typeof overlay.x !== "number" || typeof overlay.y !== "number") {
        return {
          valid: false,
          error: `Overlay ${i}: x and y coordinates must be numbers`,
        };
      }

      if (overlay.x < 0 || overlay.y < 0) {
        return {
          valid: false,
          error: `Overlay ${i}: Coordinates must be non-negative`,
        };
      }
    }

    // Validate percentage values if provided
    const percentageFields = [
      'namePercentageWidth', 'imagePercentageWidth', 'namePercentageBottom',
      'namePercentageFromTop', 'imagePercentageFromTop', 'namePercentageFromStart', 'imagePercentageFromStart'
    ] as const;

    for (const field of percentageFields) {
      const value = overlay[field];
      if (value !== undefined && (typeof value !== 'number' || value < 0 || value > 100)) {
        return {
          valid: false,
          error: `Overlay ${i}: ${field} must be a number between 0 and 100`,
        };
      }
    }

    if (overlay.startTime !== undefined && overlay.startTime < 0) {
      return {
        valid: false,
        error: `Overlay ${i}: startTime must be non-negative`,
      };
    }

    if (
      overlay.endTime !== undefined &&
      overlay.startTime !== undefined &&
      overlay.endTime <= overlay.startTime
    ) {
      return {
        valid: false,
        error: `Overlay ${i}: endTime must be greater than startTime`,
      };
    }
  }

  return { valid: true };
}

/**
 * Download file from URL to local path
 */
export async function downloadFile(
  url: string,
  outputPath: string
): Promise<void> {
  // Ensure parent directory exists
  const dir = dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
    timeout: 60000, // 60 second timeout
  });

  const writer = createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

/**
 * Save base64 image data to file
 */
export async function saveBase64Image(
  base64Data: string,
  outputPath: string
): Promise<void> {
  // Remove data URL prefix if present (e.g., "data:image/png;base64,")
  const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Content, "base64");
  await fs.writeFile(outputPath, buffer);
}

/**
 * Get Content-Type based on file extension
 */
function getContentType(filePath: string): string {
  const ext = filePath.toLowerCase().split('.').pop() || '';

  const mimeTypes: Record<string, string> = {
    // Video formats
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',

    // Image formats
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',

    // Audio formats
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',

    // Default fallback
    'tmp': 'application/octet-stream',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Upload file to Cloudflare R2
 */
export async function uploadToR2(
  filePath: string,
  key: string
): Promise<string> {
  const fileStream = createReadStream(filePath);
  const stats = await fs.stat(filePath);

  // Prepend project folder to key if configured
  const fullKey = R2_CONFIG.PROJECT_FOLDER
    ? `${R2_CONFIG.PROJECT_FOLDER}/${key}`
    : key;

  // Determine Content-Type from file extension
  const contentType = getContentType(filePath);

  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: R2_CONFIG.BUCKET_NAME,
      Key: fullKey,
      Body: fileStream,
      ContentType: contentType,
      ContentLength: stats.size,
      // Add cache control for better CDN performance
      // immutable = file will never change, safe to cache forever
      CacheControl: 'public, max-age=31536000, immutable',
      // Store original key in metadata for debugging
      Metadata: {
        'original-key': key,
        'upload-timestamp': Date.now().toString(),
      },
    },
  });

  await upload.done();

  // Return CDN URL with the key
  return `https://cnd.storyowl.app/${key}`;
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(paths: string[]): Promise<void> {
  await Promise.all(
    paths.map(async (path) => {
      try {
        await fs.unlink(path);
      } catch (error) {
        console.warn(`Failed to delete temp file ${path}:`, error);
      }
    })
  );
}

/**
 * Get video dimensions using FFmpeg probe
 */
async function getVideoDimensions(
  videoPath: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );

      if (!videoStream || !videoStream.width || !videoStream.height) {
        reject(new Error("Could not determine video dimensions"));
        return;
      }

      resolve({
        width: videoStream.width,
        height: videoStream.height,
      });
    });
  });
}

/**
 * Convert percentage-based overlay config to absolute positioning
 */
function convertPercentageToAbsolute(
  overlay: OverlayConfig,
  videoWidth: number,
  videoHeight: number
): { x: number; y: number; width?: number; height?: number } {
  // Convert percentage-based positioning to absolute
  let x = 0;
  let y = 0;
  let width: number | undefined;
  let height: number | undefined;

  // Calculate X position (horizontal)
  if (overlay.imagePercentageFromStart !== undefined) {
    x = Math.round((overlay.imagePercentageFromStart / 100) * videoWidth);
  } else if (overlay.namePercentageFromStart !== undefined) {
    x = Math.round((overlay.namePercentageFromStart / 100) * videoWidth);
  }

  // Calculate Y position (vertical)
  if (overlay.imagePercentageFromTop !== undefined) {
    y = Math.round((overlay.imagePercentageFromTop / 100) * videoHeight);
  } else if (overlay.namePercentageFromTop !== undefined) {
    y = Math.round((overlay.namePercentageFromTop / 100) * videoHeight);
  } else if (overlay.namePercentageBottom !== undefined) {
    // Calculate from bottom
    y = Math.round(videoHeight - (overlay.namePercentageBottom / 100) * videoHeight);
  }

  // Calculate width
  if (overlay.imagePercentageWidth !== undefined) {
    width = Math.round((overlay.imagePercentageWidth / 100) * videoWidth);
  } else if (overlay.namePercentageWidth !== undefined) {
    width = Math.round((overlay.namePercentageWidth / 100) * videoWidth);
  }

  // Apply centering adjustment if enabled
  // When centerPosition is true, the x/y coordinates represent the CENTER of the overlay
  // So we need to shift by half the width/height to position correctly
  if (POSITION_CONFIG.centerPosition && width !== undefined) {
    x -= Math.round(width / 2);
    y -= Math.round(width / 2); // For circles, height = width
  }

  // Height will be auto-calculated by FFmpeg to maintain aspect ratio if not specified
  if (overlay.height !== undefined) {
    height = overlay.height;
  }

  return { x, y, width, height };
}


/**
 * Build FFmpeg filter chain for overlays
 */
function buildOverlayFilter(
  overlays: OverlayConfig[],
  computedPositions: Array<{ x: number; y: number; width?: number; height?: number }>,
  maskInfo: Array<{ hasMask: boolean; maskInputIndex?: number }>
): string[] {
  const filters: string[] = [];
  let currentInput = "[0:v]";

  overlays.forEach((overlay, index) => {
    const inputIndex = index + 1; // Video is 0, overlays start at 1
    const outputLabel = index === overlays.length - 1 ? "[out]" : `[tmp${index}]`;
    const position = computedPositions[index];
    const scaledLabel = `[scaled${index}]`;
    const mask = maskInfo[index];

    // Apply mask if shape image is provided
    let overlayInput = `[${inputIndex}:v]`;

    if (mask.hasMask && mask.maskInputIndex !== undefined) {
      // Use the mask image to create shaped overlay
      const maskedLabel = `[masked${index}]`;
      const maskScaledLabel = `[mask_scaled${index}]`;
      const overlayScaledLabel = `[overlay_scaled${index}]`;

      // Scale both mask and overlay to same size using scale2ref
      // This ensures they have identical dimensions for alphamerge
      filters.push(
        `[${mask.maskInputIndex}:v][${inputIndex}:v]scale2ref=w='iw':h='ih'${maskScaledLabel}${overlayScaledLabel}`
      );

      // Convert overlay to RGBA
      const overlayRGBALabel = `[overlay_rgba${index}]`;
      filters.push(`${overlayScaledLabel}format=rgba${overlayRGBALabel}`);
      // Use mask as alpha channel (convert mask to alpha)
      const maskAlphaLabel = `[mask_alpha${index}]`;
      filters.push(`${maskScaledLabel}format=gray${maskAlphaLabel}`);
      // Merge using alphamerge
      filters.push(`${overlayRGBALabel}${maskAlphaLabel}alphamerge${maskedLabel}`);
      overlayInput = maskedLabel;
    }

    // Scale the overlay image if width is specified
    if (position.width !== undefined) {
      // Scale overlay to computed width, maintaining aspect ratio (h=-1)
      const scaleFilter = `${overlayInput}scale=w=${position.width}:h=-1${scaledLabel}`;
      filters.push(scaleFilter);

      // Build overlay filter using the scaled image
      let overlayFilter = `${currentInput}${scaledLabel}overlay=x=${position.x}:y=${position.y}`;

      // Add timing if specified
      if (overlay.startTime !== undefined || overlay.endTime !== undefined) {
        const start = overlay.startTime ?? 0;
        const end = overlay.endTime ?? 999999; // Large number for "until end"
        overlayFilter += `:enable='between(t,${start},${end})'`;
      }

      overlayFilter += outputLabel;
      filters.push(overlayFilter);
    } else {
      // No scaling needed, use overlay image (masked or original)
      let overlayFilter = `${currentInput}${overlayInput}overlay=x=${position.x}:y=${position.y}`;

      // Add timing if specified
      if (overlay.startTime !== undefined || overlay.endTime !== undefined) {
        const start = overlay.startTime ?? 0;
        const end = overlay.endTime ?? 999999; // Large number for "until end"
        overlayFilter += `:enable='between(t,${start},${end})'`;
      }

      overlayFilter += outputLabel;
      filters.push(overlayFilter);
    }

    currentInput = index === overlays.length - 1 ? "[out]" : `[tmp${index}]`;
  });

  return filters;
}

/**
 * Process video with overlays
 */
export async function processVideoWithOverlays(
  options: ProcessVideoOptions
): Promise<ProcessVideoResult> {
  const startTime = Date.now();
  const tempFiles: string[] = [];

  try {
    // Ensure temp directory exists
    await fs.mkdir(VIDEO_CONFIG.TEMP_DIR, { recursive: true });

    // Generate unique filenames
    const timestamp = Date.now();
    const videoPath = join(VIDEO_CONFIG.TEMP_DIR, `video_${timestamp}.mp4`);
    const outputPath = join(VIDEO_CONFIG.TEMP_DIR, `output_${timestamp}.mp4`);
    tempFiles.push(videoPath, outputPath);

    // Download video
    console.log("Downloading video from:", options.videoUrl);
    await downloadFile(options.videoUrl, videoPath);

    // Download/save overlay images and shape masks
    const overlayPaths: string[] = [];
    const maskPaths: string[] = [];
    const maskInfo: Array<{ hasMask: boolean; maskInputIndex?: number }> = [];

    for (let i = 0; i < options.overlays.length; i++) {
      const overlay = options.overlays[i];
      const overlayPath = join(
        VIDEO_CONFIG.TEMP_DIR,
        `overlay_${timestamp}_${i}.png`
      );
      tempFiles.push(overlayPath);

      if (overlay.imageUrl) {
        console.log(`Downloading overlay ${i} from:`, overlay.imageUrl);
        await downloadFile(overlay.imageUrl, overlayPath);
      } else if (overlay.imageData) {
        console.log(`Saving overlay ${i} from base64 data`);
        await saveBase64Image(overlay.imageData, overlayPath);
      }

      overlayPaths.push(overlayPath);

      // Download shape mask if provided
      if (overlay.shapeImageUrl) {
        const maskPath = join(
          VIDEO_CONFIG.TEMP_DIR,
          `mask_${timestamp}_${i}.png`
        );
        tempFiles.push(maskPath);

        console.log(`Downloading shape mask ${i} from:`, overlay.shapeImageUrl);
        await downloadFile(overlay.shapeImageUrl, maskPath);
        maskPaths.push(maskPath);

        // Mask input index: video(0) + overlays + current mask index
        maskInfo.push({
          hasMask: true,
          maskInputIndex: 1 + options.overlays.length + maskPaths.length - 1
        });
      } else {
        maskInfo.push({ hasMask: false });
      }
    }

    // Get video dimensions for percentage-based positioning
    console.log("Getting video dimensions...");
    const videoDimensions = await getVideoDimensions(videoPath);
    console.log(`Video dimensions: ${videoDimensions.width}x${videoDimensions.height}`);

    // Convert percentage-based overlays to absolute positions
    const computedPositions = options.overlays.map((overlay) =>
      convertPercentageToAbsolute(overlay, videoDimensions.width, videoDimensions.height)
    );

    // Build FFmpeg command
    console.log("Processing video with overlays...");
    const filters = buildOverlayFilter(options.overlays, computedPositions, maskInfo);

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(videoPath);

      // Add overlay images as inputs
      overlayPaths.forEach((path) => {
        command.input(path);
      });

      // Add mask images as inputs
      maskPaths.forEach((path) => {
        command.input(path);
      });

      // Apply complex filter
      // complexFilter automatically maps the [out] stream, so we only need to map audio
      command
        .complexFilter(filters, "[out]")  // Explicitly specify output stream label
        .outputOptions([
          "-map", "0:a?",      // Include audio if present (from original video)
          "-c:v", VIDEO_CONFIG.OUTPUT_VIDEO_CODEC,
          "-c:a", VIDEO_CONFIG.OUTPUT_AUDIO_CODEC,
          "-preset", "fast",
        ])
        .output(outputPath)
        .on("start", (commandLine) => {
          console.log("FFmpeg command:", commandLine);
        })
        .on("progress", (progress) => {
          console.log(`Processing: ${progress.percent?.toFixed(2)}% done`);
        })
        .on("end", () => {
          console.log("Video processing completed");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
        })
        .run();
    });

    // Upload to R2
    console.log("Uploading to R2...");
    const r2Key = `videos/processed_${timestamp}.mp4`;
    const videoUrl = await uploadToR2(outputPath, r2Key);

    // Clean up temp files
    await cleanupTempFiles(tempFiles);

    const processingTime = Date.now() - startTime;
    console.log(`Total processing time: ${processingTime}ms`);

    return {
      success: true,
      videoUrl,
      processingTime,
    };
  } catch (error) {
    // Clean up temp files on error
    await cleanupTempFiles(tempFiles);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Video processing error:", errorMessage);

    return {
      success: false,
      error: errorMessage,
      processingTime: Date.now() - startTime,
    };
  }
}
