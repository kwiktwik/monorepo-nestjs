import { join } from "path";
import { promises as fs } from "fs";
import { downloadFile, uploadToR2, cleanupTempFiles } from "@/lib/video-processor";
import { VIDEO_CONFIG } from "@/lib/constants/video-config";
import { nanoid } from "nanoid";

/**
 * Checks if a URL is a Crafto media URL that needs migration
 */
export function isCraftoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("https://media.crafto.app") || url.startsWith("http://media.crafto.app");
}

/**
 * Get file extension from Content-Type header
 */
function getExtensionFromContentType(contentType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
  };

  // Extract base content type (remove charset, etc.)
  const baseType = contentType.split(';')[0].trim().toLowerCase();
  return mimeToExt[baseType] || 'tmp';
}

/**
 * Detect file extension from URL and Content-Type
 */
async function detectExtension(url: string): Promise<string> {
  // First try to extract from URL
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastSegment = pathname.split('/').filter(Boolean).pop() || '';
    const extMatch = lastSegment.match(/\.([a-zA-Z0-9]+)$/);
    if (extMatch) {
      return extMatch[1];
    }
  } catch (e) {
    // URL parsing failed, try simple extraction
    const parts = url.split('?')[0].split('/');
    const lastPart = parts[parts.length - 1];
    const dotIndex = lastPart.lastIndexOf('.');
    if (dotIndex > 0) {
      const ext = lastPart.substring(dotIndex + 1);
      if (ext) return ext;
    }
  }

  // If no extension in URL, try HEAD request to get Content-Type
  try {
    const axios = (await import('axios')).default;
    const response = await axios.head(url, { timeout: 5000 });
    const contentType = response.headers['content-type'];
    if (contentType) {
      const ext = getExtensionFromContentType(contentType);
      if (ext !== 'tmp') {
        console.log(`[Migration] Detected extension '${ext}' from Content-Type: ${contentType}`);
        return ext;
      }
    }
  } catch (error) {
    console.warn(`[Migration] Could not fetch Content-Type from ${url}:`, error);
  }

  // Fallback to 'tmp'
  return 'tmp';
}

/**
 * Migrates a single Crafto media URL to R2
 * If the URL is not a Crafto URL, it returns the original URL
 * For videos, applies streaming optimization (faststart) to fix iOS/Android playback
 */
export async function migrateCraftoUrl(url: string): Promise<string> {
  if (!isCraftoUrl(url)) {
    return url;
  }

  const tempFiles: string[] = [];
  try {
    // Ensure temp directory exists
    await fs.mkdir(VIDEO_CONFIG.TEMP_DIR, { recursive: true });

    // Detect proper file extension
    const ext = await detectExtension(url);

    const filename = `migration_${nanoid()}.${ext}`;
    const tempPath = join(VIDEO_CONFIG.TEMP_DIR, filename);
    tempFiles.push(tempPath);

    console.log(`[Migration] Downloading ${url} to ${tempPath}`);
    await downloadFile(url, tempPath);

    // Optimize videos for streaming (fixes iOS Safari playback issues)
    const isVideo = ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext.toLowerCase());

    if (isVideo) {
      console.log(`[Migration] Optimizing video for streaming (adding faststart)...`);
      const optimizedPath = join(VIDEO_CONFIG.TEMP_DIR, `optimized_${filename}`);
      tempFiles.push(optimizedPath);

      try {
        // Import dynamically to avoid issues if ffmpeg is not available
        const { optimizeVideoForStreaming } = await import('./video-optimizer');
        await optimizeVideoForStreaming(tempPath, optimizedPath);

        // Upload optimized version
        const r2Key = `migrated/${filename}`;
        console.log(`[Migration] Uploading optimized video to R2 key: ${r2Key}`);
        const r2Url = await uploadToR2(optimizedPath, r2Key);

        console.log(`[Migration] Success: ${url} -> ${r2Url} (optimized)`);
        return r2Url;
      } catch (optimizeError) {
        console.warn(`[Migration] Video optimization failed, uploading original:`, optimizeError);
        // Fallback: upload original if optimization fails
        const r2Key = `migrated/${filename}`;
        const r2Url = await uploadToR2(tempPath, r2Key);
        console.log(`[Migration] Success: ${url} -> ${r2Url} (original, not optimized)`);
        return r2Url;
      }
    } else {
      // Non-video files: upload as-is
      const r2Key = `migrated/${filename}`;
      console.log(`[Migration] Uploading to R2 key: ${r2Key}`);
      const r2Url = await uploadToR2(tempPath, r2Key);

      console.log(`[Migration] Success: ${url} -> ${r2Url}`);
      return r2Url;
    }
  } catch (error) {
    console.error(`[Migration] Failed to migrate ${url}:`, error);
    // In case of error, return original URL so the app doesn't break
    return url;
  } finally {
    await cleanupTempFiles(tempFiles);
  }
}

