export const VIDEO_CONFIG = {
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_OVERLAY_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_OVERLAYS: 10, // Maximum overlays per video
  PROCESSING_TIMEOUT: 120000, // 2 minutes
  TEMP_DIR: "/tmp/video-processing",
  SUPPORTED_VIDEO_FORMATS: ["mp4", "mov", "avi", "webm"],
  SUPPORTED_IMAGE_FORMATS: ["png", "jpg", "jpeg", "gif", "webp"],
  OUTPUT_VIDEO_CODEC: "libx264",
  OUTPUT_AUDIO_CODEC: "aac",
  OUTPUT_FORMAT: "mp4",
} as const;

export const R2_CONFIG = {
  BUCKET_NAME: "uploads",
  ENDPOINT: process.env.MONOREPO_S3_ENDPOINT || "",
  ACCESS_KEY_ID: process.env.MONOREPO_R2_ACCESS_KEY_ID || "",
  SECRET_ACCESS_KEY: process.env.MONOREPO_R2_ACCESS_KEY_SECRET || "",
  PUBLIC_DOMAIN: process.env.MONOREPO_PUBLIC_DOMAIN || "",
  /** Build a public URL for a given object key */
  publicUrl(key: string): string {
    return `${this.PUBLIC_DOMAIN}/${key}`;
  },
} as const;
