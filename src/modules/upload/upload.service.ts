import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { Inject } from '@nestjs/common';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PresignedUrlDto } from './dto/presigned-url.dto';

@Injectable()
export class UploadService {
  private s3Client: S3Client | null = null;
  private bucket = 'uploads';
  private projectFolder = '';
  private publicDomain = '';

  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    private config: ConfigService,
  ) {
    this.initIfConfigured();
  }

  private initIfConfigured() {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');

    if (accountId && accessKeyId && secretAccessKey) {
      this.bucket = this.config.get<string>('R2_BUCKET_NAME') || 'uploads';
      this.projectFolder = this.config.get<string>('R2_PROJECT_FOLDER') || '';
      this.publicDomain =
        this.config.get<string>('R2_PUBLIC_DOMAIN') ||
        `https://pub-${accountId}.r2.dev`;

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

  async getPresignedUrl(
    userId: string,
    appId: string,
    dto: PresignedUrlDto,
  ): Promise<{
    success: boolean;
    uploadUrl: string;
    publicUrl: string;
    key: string;
    imageId?: number;
    expiresIn: number;
    expiresAt: string;
  }> {
    if (!this.s3Client) {
      throw new InternalServerErrorException(
        'R2 storage not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env',
      );
    }
    const { fileName, contentType = 'image/jpeg', expiresIn = 3600 } = dto;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedTypes.includes(contentType)) {
      throw new BadRequestException(
        `Invalid content type. Allowed: ${allowedTypes.join(', ')}`,
      );
    }

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${appId}/${userId}/user-images/${timestamp}_${sanitizedFileName}`;
    const fullKey = this.projectFolder ? `${this.projectFolder}/${key}` : key;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fullKey,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    // publicUrl path must match the object key (use fullKey, not key) so reads work
    const publicUrl = `${this.publicDomain.replace(/\/$/, '')}/${fullKey}`;

    let imageId: number | undefined;
    try {
      const [inserted] = await this.db
        .insert(schema.userImages)
        .values({
          userId,
          appId,
          imageUrl: publicUrl,
        })
        .returning({ id: schema.userImages.id });
      imageId = inserted?.id;
    } catch (err) {
      // Non-fatal - client can still upload
    }

    return {
      success: true,
      uploadUrl: presignedUrl,
      publicUrl,
      key,
      imageId,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }
}
