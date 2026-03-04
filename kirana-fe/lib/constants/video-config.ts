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
  BUCKET_NAME: process.env.R2_BUCKET_NAME || "",
  PROJECT_FOLDER: process.env.R2_PROJECT_FOLDER || "", // Optional: leave empty if not using folders
  PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "", // Will be set from R2 bucket settings
  ACCOUNT_ID: process.env.R2_ACCOUNT_ID || "",
  ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || "",
  SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || "",
  // Construct endpoint from account ID
  get ENDPOINT() {
    if (!this.ACCOUNT_ID) {
      throw new Error("R2_ACCOUNT_ID environment variable is required");
    }
    return `https://${this.ACCOUNT_ID}.r2.cloudflarestorage.com`;
  },
  // Construct public URL - if PUBLIC_DOMAIN is not set, you'll need to configure R2 bucket with a custom domain
  get PUBLIC_URL() {
    if (!this.PUBLIC_DOMAIN) {
      console.warn("NEXT_PUBLIC_R2_PUBLIC_DOMAIN not set. Using R2 dev subdomain. Configure a custom domain for production.");
      // Fallback to R2 dev subdomain (you'll need to enable this in R2 dashboard)
      return `https://pub-${this.ACCOUNT_ID}.r2.dev${this.PROJECT_FOLDER ? '/' + this.PROJECT_FOLDER : ''}`;
    }
    return this.PROJECT_FOLDER 
      ? `https://${this.PUBLIC_DOMAIN}/${this.PROJECT_FOLDER}`
      : `https://${this.PUBLIC_DOMAIN}`;
  },
} as const;
