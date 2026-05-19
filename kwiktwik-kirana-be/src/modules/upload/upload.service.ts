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
  private publicDomain = '';

  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    private config: ConfigService,
  ) {
    this.initIfConfigured();
  }

  private initIfConfigured() {
    const endpoint = this.config.get<string>('MONOREPO_S3_ENDPOINT');
    const accessKeyId = this.config.get<string>('MONOREPO_R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('MONOREPO_R2_ACCESS_KEY_SECRET');

    if (endpoint && accessKeyId && secretAccessKey) {
      this.publicDomain =
        this.config.get<string>('MONOREPO_PUBLIC_DOMAIN') || '';

      this.s3Client = new S3Client({
        region: 'auto',
        endpoint,
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
        'R2 storage not configured. Set MONOREPO_S3_ENDPOINT, MONOREPO_R2_ACCESS_KEY_ID, MONOREPO_R2_ACCESS_KEY_SECRET in .env',
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

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    const publicUrl = `${this.publicDomain.replace(/\/$/, '')}/${key}`;

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
    } catch {
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

  async getChatMediaPresignedUrl(
    userId: string,
    appId: string,
    dto: {
      fileName: string;
      contentType: string;
      expiresIn?: number;
      conversationId?: string;
    },
  ): Promise<{
    success: boolean;
    uploadUrl: string;
    publicUrl: string;
    key: string;
    expiresIn: number;
    expiresAt: string;
  }> {
    if (!this.s3Client) {
      throw new InternalServerErrorException(
        'R2 storage not configured. Set MONOREPO_S3_ENDPOINT, MONOREPO_R2_ACCESS_KEY_ID, MONOREPO_R2_ACCESS_KEY_SECRET in .env',
      );
    }

    const { fileName, contentType, expiresIn = 3600, conversationId } = dto;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ];

    if (!allowedTypes.includes(contentType)) {
      throw new BadRequestException(
        `Invalid content type. Allowed: ${allowedTypes.join(', ')}`,
      );
    }

    let fileType: string;
    if (contentType.startsWith('image/')) {
      fileType = 'images';
    } else if (contentType.startsWith('video/')) {
      fileType = 'videos';
    } else if (contentType.startsWith('audio/')) {
      fileType = 'audio';
    } else {
      fileType = 'files';
    }

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const conversationFolder = conversationId ? `${conversationId}/` : '';
    const key = `${appId}/${userId}/chat/${fileType}/${conversationFolder}${timestamp}_${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    const publicUrl = `${this.publicDomain.replace(/\/$/, '')}/${key}`;

    return {
      success: true,
      uploadUrl: presignedUrl,
      publicUrl,
      key,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }
}
