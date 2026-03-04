import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { removeBackground } from '@imgly/background-removal-node';

const MAX_RETRIES = 5;
const INITIAL_DELAY_SEC = 5;

@Injectable()
export class BackgroundRemovalService {
  private readonly logger = new Logger(BackgroundRemovalService.name);
  private s3Client: S3Client | null = null;
  private bucket = 'uploads';
  private projectFolder = '';
  private publicDomain = '';

  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    private config: ConfigService,
  ) {
    this.initR2();
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

  /** Queue background removal - returns immediately, processes async */
  trigger(imageUrl: string, imageId: number, key: string): void {
    this.processBackground(imageUrl, imageId, key).catch((err) => {
      this.logger.error(
        `[Background Removal] Task failed for image_id=${imageId}:`,
        err,
      );
    });
  }

  private async processBackground(
    imageUrl: string,
    imageId: number,
    key: string,
  ): Promise<void> {
    this.logger.log(
      `[Background Removal] Task started for image_id=${imageId}`,
    );

    if (!this.s3Client) {
      this.logger.error(
        '[Background Removal] R2 not configured, skipping background removal',
      );
      return;
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const delaySec = INITIAL_DELAY_SEC * attempt;
        this.logger.log(
          `[Background Removal] Attempt ${attempt}/${MAX_RETRIES} for image ${imageId} - waiting ${delaySec}s`,
        );
        await this.sleep(delaySec * 1000);

        const downloaded = await this.downloadImage(imageUrl);
        if (!downloaded) {
          this.logger.warn(
            `[Background Removal] Download failed for ${imageId}, retrying...`,
          );
          continue;
        }

        // Pass a Blob with explicit MIME type - @imgly/background-removal-node
        // fails with "Unsupported format" when given a raw Buffer (blob.type is empty)
        const inputBlob = new Blob([new Uint8Array(downloaded.buffer)], {
          type: downloaded.mimeType,
        });

        this.logger.log(
          `[Background Removal] Removing background for image ${imageId} (${downloaded.mimeType})`,
        );

        const resultBlob = await removeBackground(inputBlob);
        const outputBuffer = Buffer.from(await resultBlob.arrayBuffer());

        if (!key || key.trim() === '') {
          this.logger.error(
            `[Background Removal] No key provided for image ${imageId}, failing.`,
          );
          return;
        }

        const keyWithoutExt = key.includes('.')
          ? key.replace(/\.[^.]+$/, '')
          : key;
        const bgRemovedKey = `${keyWithoutExt}_no_bg.png`;
        const fullKey = this.projectFolder
          ? `${this.projectFolder}/${bgRemovedKey}`
          : bgRemovedKey;

        this.logger.log(`[Background Removal] Uploading to R2: ${fullKey}`);
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: fullKey,
            Body: outputBuffer,
            ContentType: 'image/png',
          }),
        );

        const publicUrl = `${this.publicDomain.replace(/\/$/, '')}/${fullKey}`;
        this.logger.log(`[Background Removal] Public URL: ${publicUrl}`);

        // First verify the image exists
        const existingImage = await this.db
          .select({ id: schema.userImages.id })
          .from(schema.userImages)
          .where(eq(schema.userImages.id, imageId))
          .limit(1);

        this.logger.log(
          `[Background Removal] Checking image ${imageId}, found: ${JSON.stringify(existingImage)}`,
        );

        if (existingImage.length === 0) {
          this.logger.warn(
            `[Background Removal] Image ${imageId} not found in database`,
          );
          continue;
        }

        const result = await this.db
          .update(schema.userImages)
          .set({ removedBgImageUrl: publicUrl })
          .where(eq(schema.userImages.id, imageId))
          .returning({ id: schema.userImages.id });

        if (result.length > 0) {
          this.logger.log(
            `[Background Removal] ✅ Database updated for image_id=${imageId}`,
          );
          return;
        }
        this.logger.warn(
          `[Background Removal] ⚠️ No row updated for image_id=${imageId} (row may have been deleted)`,
        );
      } catch (err) {
        this.logger.error(
          `[Background Removal] Attempt ${attempt}/${MAX_RETRIES} failed for image ${imageId}:`,
          err,
        );
        if (attempt >= MAX_RETRIES) {
          this.logger.error(
            `[Background Removal] ❌ All retries exhausted for image ${imageId}`,
          );
          return;
        }
      }
    }
  }

  private async downloadImage(
    imageUrl: string,
  ): Promise<{ buffer: Buffer; mimeType: string } | null> {
    try {
      const res = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) {
        this.logger.error(
          `[Background Removal] Download failed: ${res.status} ${imageUrl}`,
        );
        return null;
      }
      const ab = await res.arrayBuffer();
      const buffer = Buffer.from(ab);
      const contentType = res.headers.get('content-type') || '';
      const mimeType =
        this.getMimeFromContentType(contentType) ||
        this.detectMimeFromBuffer(buffer);
      if (!mimeType) {
        this.logger.error(
          `[Background Removal] Could not determine image format for ${imageUrl}`,
        );
        return null;
      }
      return { buffer, mimeType };
    } catch (err) {
      this.logger.error(`[Background Removal] Download error:`, err);
      return null;
    }
  }

  private getMimeFromContentType(contentType: string): string | null {
    const normalized = contentType.split(';')[0].trim().toLowerCase();
    if (
      normalized === 'image/png' ||
      normalized === 'image/jpeg' ||
      normalized === 'image/jpg' ||
      normalized === 'image/webp'
    ) {
      return normalized === 'image/jpg' ? 'image/jpeg' : normalized;
    }
    return null;
  }

  private detectMimeFromBuffer(buffer: Buffer): string | null {
    if (buffer.length < 12) return null;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return 'image/png';
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    // WebP: RIFF....WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return 'image/webp';
    }
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
