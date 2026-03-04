import ffmpeg from "fluent-ffmpeg";

/**
 * Optimize video for streaming by moving moov atom to beginning
 * This is a FAST operation that doesn't re-encode the video
 * 
 * The moov atom contains video metadata. When it's at the end of the file,
 * browsers (especially iOS Safari) must download the entire file before playback.
 * Moving it to the beginning enables immediate streaming.
 */
export async function optimizeVideoForStreaming(
    inputPath: string,
    outputPath: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-c', 'copy',              // Copy streams without re-encoding (fast!)
                '-movflags', '+faststart'  // Move moov atom to beginning
            ])
            .output(outputPath)
            .on('start', (cmd: string) => {
                console.log('[VideoOptimizer] FFmpeg command:', cmd);
            })
            .on('end', () => {
                console.log('[VideoOptimizer] Video optimized successfully (faststart applied)');
                resolve();
            })
            .on('error', (err: Error) => {
                console.error('[VideoOptimizer] Optimization error:', err);
                reject(err);
            })
            .run();
    });
}

/**
 * Full re-encode for maximum compatibility across all devices
 * This is SLOW but ensures the video works on iOS Safari, Android, and all browsers
 * 
 * Use this if faststart optimization alone doesn't fix playback issues
 */
export async function reencodeForCompatibility(
    inputPath: string,
    outputPath: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                // Video codec: H.264 baseline profile (maximum compatibility)
                '-c:v', 'libx264',
                '-profile:v', 'baseline',  // Most compatible profile
                '-level', '3.0',            // Supports up to 640x480 @ 30fps
                '-pix_fmt', 'yuv420p',      // Required for iOS

                // Audio codec: AAC (universal support)
                '-c:a', 'aac',
                '-b:a', '128k',

                // Streaming optimization - CRITICAL for iOS
                '-movflags', '+faststart',

                // Quality settings
                '-crf', '23',       // Constant Rate Factor (18-28, lower = better quality)
                '-preset', 'medium', // Encoding speed vs compression
            ])
            .output(outputPath)
            .on('start', (cmd: string) => {
                console.log('[VideoOptimizer] FFmpeg re-encode command:', cmd);
            })
            .on('progress', (progress: { percent?: number }) => {
                if (progress.percent) {
                    console.log(`[VideoOptimizer] Re-encoding: ${progress.percent.toFixed(1)}%`);
                }
            })
            .on('end', () => {
                console.log('[VideoOptimizer] Video re-encoded successfully');
                resolve();
            })
            .on('error', (err: Error) => {
                console.error('[VideoOptimizer] Re-encoding error:', err);
                reject(err);
            })
            .run();
    });
}

/**
 * Check if a video has faststart enabled (moov atom at beginning)
 * Returns true if optimized, false if needs optimization
 */
export async function checkFaststart(videoPath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err: Error | null, metadata: any) => {
            if (err) {
                reject(err);
                return;
            }

            // Check format tags for faststart indicator
            // Note: This is a heuristic, not 100% accurate
            const format = metadata?.format;
            if (!format) {
                resolve(false);
                return;
            }

            // If the file is very small or format.start_time is 0, it likely has faststart
            // This is not perfect but gives us a hint
            const hasFaststart = format.start_time === 0 || format.start_time === '0.000000';
            resolve(hasFaststart);
        });
    });
}

/**
 * Get video codec information
 */
export async function getVideoCodecInfo(videoPath: string): Promise<{
    codec: string;
    profile?: string;
    level?: number;
    pixelFormat?: string;
}> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err: Error | null, metadata: any) => {
            if (err) {
                reject(err);
                return;
            }

            const videoStream = metadata?.streams?.find(
                (stream: any) => stream.codec_type === 'video'
            );

            if (!videoStream) {
                reject(new Error('No video stream found'));
                return;
            }

            resolve({
                codec: videoStream.codec_name || 'unknown',
                profile: videoStream.profile,
                level: videoStream.level,
                pixelFormat: videoStream.pix_fmt,
            });
        });
    });
}
