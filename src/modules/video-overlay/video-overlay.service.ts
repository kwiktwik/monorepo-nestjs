import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const TEMP_DIR =
  process.env.VIDEO_TEMP_DIR || path.join(os.tmpdir(), 'video-processing');
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_OVERLAYS = 10;
const PROCESSING_TIMEOUT_MS = 120_000; // 2 minutes
const SUPPORTED_VIDEO_FORMATS = ['mp4', 'mov', 'avi', 'webm'];
const SUPPORTED_IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

const SHAPE_MAP: Record<string, string> = {
  'BLURRED CIRCLE': 'CIRCLE',
  BLURRED_CIRCLE: 'CIRCLE',
  CIRCLE: 'CIRCLE',
  'BLURRED CIRCLE SHAPE FINAL': 'CIRCLE',
  BLURRED_CIRCLE_SHAPE_FINAL: 'CIRCLE',
  'PIN SHAPE BLURRED': 'CIRCLE',
  PIN_SHAPE_BLURRED: 'CIRCLE',
  'BLURRED SQUARE': 'SQUARE',
  BLURRED_SQUARE: 'SQUARE',
  SQUARE: 'SQUARE',
  'BLURRED SQUARE SHAPE FINAL': 'SQUARE',
  BLURRED_SQUARE_SHAPE_FINAL: 'SQUARE',
  FLOWER: 'FLOWER',
  'BLURRED FLOWER': 'FLOWER',
  BLURRED_FLOWER: 'FLOWER',
  'FLOWER SHAPE FINAL': 'FLOWER',
  'BLURRED RECTANGLE': 'RECTANGLE',
  BLURRED_RECTANGLE: 'RECTANGLE',
  RECTANGLE: 'RECTANGLE',
  'BLURRED RECTANGLE SHAPE FINAL': 'RECTANGLE',
  BLURRED_RECTANGLE_SHAPE_FINAL: 'RECTANGLE',
  ROUNDED_RECTANGLE: 'ROUNDED_RECTANGLE',
  ROUNDED_SQUARE: 'ROUNDED_RECTANGLE',
  'ROUNDED RECTANGLE SHAPE FINAL': 'ROUNDED_RECTANGLE',
  'EXP 3': 'CIRCLE',
  EXP_3: 'CIRCLE',
};

interface OverlayConfig {
  imageUrl?: string;
  imageData?: string;
  imageShape?: string;
  shapeImageUrl?: string;
  imagePercentageFromStart?: number;
  imagePercentageFromTop?: number;
  imagePercentageWidth?: number;
  namePercentageFromStart?: number;
  namePercentageFromTop?: number;
  namePercentageBottom?: number;
  namePercentageWidth?: number;
  startTime?: number;
  endTime?: number;
}

interface ProcessedOverlay extends OverlayConfig {
  imageUrl?: string;
  imageData?: string;
  imageShape: string;
}

interface Position {
  x: number;
  y: number;
  width: number | null;
  height: number | null;
}

@Injectable()
export class VideoOverlayService {
  private s3Client: S3Client | null = null;
  private bucket = 'uploads';
  private projectFolder = '';
  private publicDomain = 'https://cnd.storyowl.app';

  private processedVideoCache = new Map<
    string,
    { url: string; timestamp: number }
  >();
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MAX_CACHE_SIZE = 500;

  private cacheCleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    private config: ConfigService,
  ) {
    this.initR2();
    this.cacheCleanupInterval = setInterval(
      () => this.evictExpiredCache(),
      60 * 60 * 1000, // every hour
    );
  }

  onModuleDestroy() {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }
  }

  private getCacheKey(contentId: number, imageUrl?: string): string {
    return `${contentId}:${imageUrl ?? ''}`;
  }

  private getCachedVideo(key: string): string | null {
    const entry = this.processedVideoCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > VideoOverlayService.CACHE_TTL_MS) {
      this.processedVideoCache.delete(key);
      return null;
    }
    return entry.url;
  }

  private setCachedVideo(key: string, url: string): void {
    if (this.processedVideoCache.size >= VideoOverlayService.MAX_CACHE_SIZE) {
      const oldest = this.processedVideoCache.keys().next().value;
      if (oldest) this.processedVideoCache.delete(oldest);
    }
    this.processedVideoCache.set(key, { url, timestamp: Date.now() });
  }

  private evictExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.processedVideoCache) {
      if (now - entry.timestamp > VideoOverlayService.CACHE_TTL_MS) {
        this.processedVideoCache.delete(key);
      }
    }
  }

  private initR2() {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');

    if (accountId && accessKeyId && secretAccessKey) {
      this.bucket = this.config.get<string>('R2_BUCKET_NAME') || 'uploads';
      this.projectFolder = this.config.get<string>('R2_PROJECT_FOLDER') || '';
      this.publicDomain =
        this.config.get<string>('R2_PUBLIC_DOMAIN') ??
        'https://cnd.storyowl.app';

      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'video-overlay',
      maxVideoSize: MAX_VIDEO_SIZE,
      maxOverlays: MAX_OVERLAYS,
      supportedVideoFormats: SUPPORTED_VIDEO_FORMATS,
      supportedImageFormats: SUPPORTED_IMAGE_FORMATS,
    };
  }

  async processByContentId(
    contentId: number,
    imageUrl: string | undefined,
    imageData: string | undefined,
    overrides: {
      imagePercentageFromStart?: number;
      imagePercentageFromTop?: number;
      imagePercentageWidth?: number;
      imageShape?: string;
      shapeImageUrl?: string;
    },
  ): Promise<{
    success: boolean;
    videoUrl?: string;
    processingTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    if (!imageUrl && !imageData) {
      throw new BadRequestException(
        'Either imageUrl or imageData must be provided',
      );
    }

    const cacheKey = this.getCacheKey(contentId, imageUrl);
    const cachedUrl = this.getCachedVideo(cacheKey);
    if (cachedUrl) {
      return {
        success: true,
        videoUrl: cachedUrl,
        processingTime: Date.now() - startTime,
      };
    }

    if (!this.s3Client) {
      return {
        success: false,
        error: 'R2 storage not configured',
        processingTime: Date.now() - startTime,
      };
    }

    const rows = await this.db
      .select({
        id: schema.quotes.id,
        videoUrl: schema.quotes.videoUrl,
        rawJson: schema.quotes.rawJson,
      })
      .from(schema.quotes)
      .where(eq(schema.quotes.id, BigInt(contentId)))
      .limit(1);

    const content = rows[0];
    if (!content) {
      throw new BadRequestException(`Content with ID ${contentId} not found`);
    }

    const videoUrl = content.videoUrl;
    if (!videoUrl) {
      throw new BadRequestException(`Content ${contentId} has no video URL`);
    }

    const rawJson = content.rawJson as Record<string, unknown> | null;
    if (!rawJson) {
      throw new BadRequestException(
        `Content ${contentId} has no overlay configuration (raw_json is null)`,
      );
    }

    let overlaysData = (rawJson.overlays as OverlayConfig[]) ?? [];
    if (overlaysData.length === 0 && rawJson.imageGuidelines) {
      const guidelines = rawJson.imageGuidelines as Record<string, unknown>;
      overlaysData = [
        {
          imageShape: (guidelines.imageShape as string) ?? 'SQUARE',
          imagePercentageFromStart:
            (guidelines.imagePercentageFromStart as number) ?? 50,
          imagePercentageFromTop:
            (guidelines.imagePercentageFromTop as number) ?? 50,
          imagePercentageWidth:
            (guidelines.imagePercentageWidth as number) ?? 30,
          startTime: 0,
          endTime: undefined,
          shapeImageUrl: guidelines.shapeImageUrl as string | undefined,
        },
      ];
    }

    if (overlaysData.length === 0) {
      throw new BadRequestException(
        `Content ${contentId} has no overlays or imageGuidelines in raw_json`,
      );
    }

    const processedOverlays: ProcessedOverlay[] = overlaysData.map((o) => {
      const overlay: ProcessedOverlay = {
        ...o,
        imageUrl: imageUrl ?? o.imageUrl,
        imageData: imageData ?? o.imageData,
        imageShape: this.mapShape(
          overrides.imageShape ?? o.imageShape ?? 'CIRCLE',
        ),
      };
      if (overrides.imagePercentageFromStart != null)
        overlay.imagePercentageFromStart = overrides.imagePercentageFromStart;
      if (overrides.imagePercentageFromTop != null)
        overlay.imagePercentageFromTop = overrides.imagePercentageFromTop;
      if (overrides.imagePercentageWidth != null)
        overlay.imagePercentageWidth = overrides.imagePercentageWidth;
      if (overrides.shapeImageUrl != null)
        overlay.shapeImageUrl = overrides.shapeImageUrl;
      if (overlay.imageShape !== 'FLOWER' && overlay.shapeImageUrl) {
        overlay.shapeImageUrl = undefined;
      }
      return overlay;
    });

    const validation = this.validateOverlays(processedOverlays);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    try {
      const result = await this.processVideoWithOverlays(
        videoUrl,
        processedOverlays,
      );
      if (result.success && result.videoUrl) {
        this.setCachedVideo(cacheKey, result.videoUrl);
      }
      if (!result.success) {
        throw new InternalServerErrorException(result.error);
      }
      return {
        ...result,
        processingTime: Date.now() - startTime,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: errorMsg,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private mapShape(shape: string): string {
    const upper = shape.toUpperCase().replace(/-/g, ' ').replace(/ +/g, ' ');
    return SHAPE_MAP[upper] ?? 'CIRCLE';
  }

  private validateOverlays(overlays: ProcessedOverlay[]): {
    valid: boolean;
    error?: string;
  } {
    if (!overlays.length)
      return { valid: false, error: 'At least one overlay is required' };
    if (overlays.length > MAX_OVERLAYS)
      return {
        valid: false,
        error: `Maximum ${MAX_OVERLAYS} overlays allowed`,
      };
    for (let i = 0; i < overlays.length; i++) {
      const o = overlays[i];
      if (!o.imageUrl && !o.imageData) {
        return {
          valid: false,
          error: `Overlay ${i}: Either imageUrl or imageData is required`,
        };
      }
      const hasPercent =
        o.imagePercentageFromStart != null ||
        o.imagePercentageFromTop != null ||
        o.namePercentageFromStart != null ||
        o.namePercentageFromTop != null;
      if (!hasPercent) {
        return {
          valid: false,
          error: `Overlay ${i}: Percentage-based positioning is required`,
        };
      }
    }
    return { valid: true };
  }

  private convertToPosition(
    overlay: ProcessedOverlay,
    w: number,
    h: number,
  ): Position {
    let x = 0,
      y = 0,
      width: number | null = null;
    if (overlay.imagePercentageFromStart != null)
      x = Math.floor((overlay.imagePercentageFromStart / 100) * w);
    else if (overlay.namePercentageFromStart != null)
      x = Math.floor((overlay.namePercentageFromStart / 100) * w);
    if (overlay.imagePercentageFromTop != null)
      y = Math.floor((overlay.imagePercentageFromTop / 100) * h);
    else if (overlay.namePercentageFromTop != null)
      y = Math.floor((overlay.namePercentageFromTop / 100) * h);
    else if (overlay.namePercentageBottom != null)
      y = Math.floor(h - (overlay.namePercentageBottom / 100) * h);
    if (overlay.imagePercentageWidth != null)
      width = Math.floor((overlay.imagePercentageWidth / 100) * w);
    else if (overlay.namePercentageWidth != null)
      width = Math.floor((overlay.namePercentageWidth / 100) * w);
    return { x, y, width, height: null };
  }

  private async downloadFile(url: string, outPath: string): Promise<void> {
    const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok)
      throw new InternalServerErrorException(`Download failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(outPath, buf);
  }

  private async saveBase64Image(data: string, outPath: string): Promise<void> {
    let b64 = data;
    if (data.includes(',') && data.startsWith('data:')) {
      b64 = data.split(',', 2)[1] ?? data;
    }
    const buf = Buffer.from(b64, 'base64');
    await fs.writeFile(outPath, buf);
  }

  private async getVideoDimensions(
    videoPath: string,
  ): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height',
        '-of',
        'json',
        videoPath,
      ]);
      let out = '';
      let err = '';
      ffprobe.stdout?.on('data', (d) => (out += d.toString()));
      ffprobe.stderr?.on('data', (d) => (err += d.toString()));
      ffprobe.on('close', (code) => {
        if (code !== 0) {
          reject(
            new InternalServerErrorException(`ffprobe failed: ${err || out}`),
          );
          return;
        }
        try {
          const parsed = JSON.parse(out) as {
            streams?: Array<{ width?: number; height?: number }>;
          };
          const stream = parsed.streams?.[0];
          if (!stream?.width || !stream?.height)
            reject(new InternalServerErrorException('No video stream'));
          else resolve([stream.width, stream.height]);
        } catch {
          reject(
            new InternalServerErrorException('Failed to parse ffprobe output'),
          );
        }
      });
      ffprobe.on('error', reject);
    });
  }

  private runFfmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('ffmpeg', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const timeout = setTimeout(() => {
        proc.kill('SIGKILL');
        reject(new ServiceUnavailableException('FFmpeg timeout'));
      }, PROCESSING_TIMEOUT_MS);
      let stderr = '';
      proc.stderr?.on('data', (d) => (stderr += d.toString()));
      proc.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) resolve();
        else
          reject(
            new InternalServerErrorException(
              `FFmpeg failed (${code}): ${stderr.slice(-500)}`,
            ),
          );
      });
      proc.on('error', (e) => {
        clearTimeout(timeout);
        reject(e);
      });
    });
  }

  private buildOverlayFilters(
    overlays: ProcessedOverlay[],
    positions: Position[],
    maskInfo: { hasMask: boolean; maskInputIndex?: number }[],
    mainInput: string,
    videoW: number,
    videoH: number,
  ): string[] {
    const filters: string[] = [];
    let currentInput = mainInput;
    const targetW = Math.min(videoW, 1920);
    const targetH = Math.min(videoH, 1920);
    const scaleFilter =
      targetW !== videoW || targetH !== videoH
        ? `[0:v]scale=${targetW}:${targetH}[vscaled]`
        : null;
    if (scaleFilter) {
      filters.push(scaleFilter);
      currentInput = '[vscaled]';
    }

    for (let i = 0; i < overlays.length; i++) {
      const overlay = overlays[i];
      const pos = positions[i];
      const mask = maskInfo[i];
      const inputIdx = i + 1;
      const outLabel = i === overlays.length - 1 ? '[out]' : `[tmp${i}]`;
      const width = pos.width ?? 200;

      if (mask.hasMask && mask.maskInputIndex != null) {
        const maskIdx = mask.maskInputIndex;
        const scaled = `[scaled${i}]`;
        const maskScaled = `[mask_scaled${i}]`;
        const rgba = `[overlay_rgba${i}]`;
        const alpha = `[mask_alpha${i}]`;
        const masked = `[masked${i}]`;
        filters.push(
          `[${inputIdx}:v]scale=${width}:${width}:force_original_aspect_ratio=increase,crop=${width}:${width}${scaled}`,
        );
        filters.push(`[${maskIdx}:v]scale=${width}:${width}${maskScaled}`);
        filters.push(`${scaled}format=rgba${rgba}`);
        filters.push(`${maskScaled}format=gray${alpha}`);
        filters.push(`${rgba}${alpha}alphamerge${masked}`);
        filters.push(
          `${currentInput}${masked}overlay=x=${pos.x}:y=${pos.y}:format=auto${outLabel}`,
        );
      } else if (
        overlay.imageShape &&
        ['CIRCLE', 'SQUARE', 'FLOWER'].includes(overlay.imageShape)
      ) {
        const scaled = `[overlay_scaled${i}]`;
        const rgba = `[overlay_rgba${i}]`;
        let maskedLabel: string;
        filters.push(
          `[${inputIdx}:v]scale=w=${width}:h=${width}:force_original_aspect_ratio=decrease,pad=${width}:${width}:(ow-iw)/2:(oh-ih)/2:color=black@0.0${scaled}`,
        );
        filters.push(`${scaled}format=rgba${rgba}`);
        if (
          overlay.imageShape === 'CIRCLE' ||
          overlay.imageShape === 'FLOWER'
        ) {
          maskedLabel = `[masked${i}]`;
          filters.push(
            `${rgba}geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='alpha(X,Y)*if(lte(hypot(X-W/2,Y-H/2),min(W,H)/2),1,0)'${maskedLabel}`,
          );
        } else {
          maskedLabel = rgba;
        }
        const enableExpr =
          overlay.startTime != null || overlay.endTime != null
            ? `:enable='between(t,${overlay.startTime ?? 0},${overlay.endTime ?? 999999})'`
            : '';
        filters.push(
          `${currentInput}${maskedLabel}overlay=x=${pos.x}:y=${pos.y}:format=auto${enableExpr}${outLabel}`,
        );
      } else {
        const scaled = `[scaled${i}]`;
        if (pos.width != null) {
          filters.push(`[${inputIdx}:v]scale=w=${pos.width}:h=-1${scaled}`);
          filters.push(
            `${currentInput}${scaled}overlay=x=${pos.x}:y=${pos.y}:format=auto${outLabel}`,
          );
        } else {
          filters.push(
            `${currentInput}[${inputIdx}:v]overlay=x=${pos.x}:y=${pos.y}:format=auto${outLabel}`,
          );
        }
      }
      currentInput = outLabel;
    }
    return filters;
  }

  private async processVideoWithOverlays(
    videoUrl: string,
    overlays: ProcessedOverlay[],
  ): Promise<{
    success: boolean;
    videoUrl?: string;
    processingTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    const timestamp = Date.now();
    await fs.mkdir(TEMP_DIR, { recursive: true });

    const videoPath = path.join(TEMP_DIR, `video_${timestamp}.mp4`);
    const outputPath = path.join(TEMP_DIR, `output_${timestamp}.mp4`);
    const tempFiles: string[] = [videoPath, outputPath];

    try {
      await this.downloadFile(videoUrl, videoPath);
      const [videoW, videoH] = await this.getVideoDimensions(videoPath);
      const targetW = Math.min(videoW, 1920);
      const targetH = Math.min(videoH, 1920);

      const overlayPaths: string[] = [];
      const maskPaths: string[] = [];
      const maskInfo: { hasMask: boolean; maskInputIndex?: number }[] = [];

      for (let i = 0; i < overlays.length; i++) {
        const o = overlays[i];
        const overlayPath = path.join(
          TEMP_DIR,
          `overlay_${timestamp}_${i}.png`,
        );
        tempFiles.push(overlayPath);
        if (o.imageUrl) {
          await this.downloadFile(o.imageUrl, overlayPath);
        } else if (o.imageData) {
          await this.saveBase64Image(o.imageData, overlayPath);
        }
        overlayPaths.push(overlayPath);

        if (o.shapeImageUrl) {
          const maskPath = path.join(TEMP_DIR, `mask_${timestamp}_${i}.png`);
          tempFiles.push(maskPath);
          await this.downloadFile(o.shapeImageUrl, maskPath);
          maskPaths.push(maskPath);
          maskInfo.push({
            hasMask: true,
            maskInputIndex: 1 + overlays.length + maskPaths.length - 1,
          });
        } else {
          maskInfo.push({ hasMask: false });
        }
      }

      const positions = overlays.map((o) =>
        this.convertToPosition(o, targetW, targetH),
      );
      const mainInput =
        targetW !== videoW || targetH !== videoH ? '[vscaled]' : '[0:v]';
      const filterStrings = this.buildOverlayFilters(
        overlays,
        positions,
        maskInfo,
        mainInput,
        targetW,
        targetH,
      );

      const args = ['-i', videoPath];
      for (const p of overlayPaths) args.push('-i', p);
      for (const p of maskPaths) args.push('-i', p);
      args.push(
        '-filter_complex',
        filterStrings.join(';'),
        '-map',
        '[out]',
        '-map',
        '0:a?',
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-r',
        '30',
        '-movflags',
        '+faststart',
        '-pix_fmt',
        'yuv420p',
        '-preset',
        'fast',
        '-y',
        outputPath,
      );

      await this.runFfmpeg(args);

      const r2Key = `videos/processed_${timestamp}.mp4`;
      const fullKey = this.projectFolder
        ? `${this.projectFolder}/${r2Key}`
        : r2Key;
      const body = await fs.readFile(outputPath);
      await this.s3Client!.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: fullKey,
          Body: body,
          ContentType: 'video/mp4',
        }),
      );

      const publicUrl = `${this.publicDomain.replace(/\/$/, '')}/${fullKey}`;

      return {
        success: true,
        videoUrl: publicUrl,
        processingTime: Date.now() - startTime,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: errorMsg,
        processingTime: Date.now() - startTime,
      };
    } finally {
      for (const f of tempFiles) {
        try {
          await fs.unlink(f).catch(() => {});
        } catch {
          // ignore
        }
      }
    }
  }
}
