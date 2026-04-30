/**
 * Encryption Service
 * 
 * Provides encryption and decryption for sensitive data like provider credentials.
 * Uses AES-256-GCM for secure encryption with authentication.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Base64 encoded ciphertext */
  readonly ciphertext: string;
  /** Base64 encoded initialization vector */
  readonly iv: string;
  /** Base64 encoded authentication tag */
  readonly authTag: string;
  /** Algorithm used for encryption */
  readonly algorithm: string;
  /** Version for future migrations */
  readonly version: number;
}

/**
 * Encryption key status
 */
export interface EncryptionKeyStatus {
  readonly hasKey: boolean;
  readonly keyLength: number | null;
  readonly algorithm: string;
}

/**
 * Encryption service for securing sensitive data
 * 
 * Features:
 * - AES-256-GCM encryption with authentication
 * - Random IV for each encryption
 * - Key rotation support via versioning
 * - Secure key derivation from environment
 */
@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyVersion = 1;
  private encryptionKey: Buffer | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize encryption key on module init
   */
  onModuleInit(): void {
    const keyHex = this.configService.get<string>('PAYMENT_ENCRYPTION_KEY');
    
    if (!keyHex) {
      this.logger.warn(
        'PAYMENT_ENCRYPTION_KEY not set. Encryption service will not be available. ' +
        'Generate a key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
      return;
    }

    try {
      this.encryptionKey = Buffer.from(keyHex, 'hex');
      
      if (this.encryptionKey.length !== 32) {
        throw new Error(
          `Invalid key length: ${this.encryptionKey.length} bytes. Expected 32 bytes for AES-256.`
        );
      }

      this.logger.log('Encryption service initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize encryption key: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      this.encryptionKey = null;
    }
  }

  /**
   * Encrypt a plaintext string
   */
  encrypt(plaintext: string): EncryptedData {
    this.ensureKeyAvailable();

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey!, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      algorithm: this.algorithm,
      version: this.keyVersion,
    };
  }

  /**
   * Decrypt an encrypted data object
   */
  decrypt(encrypted: EncryptedData): string {
    this.ensureKeyAvailable();

    // Validate algorithm
    if (encrypted.algorithm !== this.algorithm) {
      throw new Error(
        `Unsupported algorithm: ${encrypted.algorithm}. Expected: ${this.algorithm}`
      );
    }

    // Validate version
    if (encrypted.version !== this.keyVersion) {
      throw new Error(
        `Unsupported encryption version: ${encrypted.version}. Expected: ${this.keyVersion}`
      );
    }

    const iv = Buffer.from(encrypted.iv, 'base64');
    const authTag = Buffer.from(encrypted.authTag, 'base64');

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey!,
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Encrypt a JSON object
   */
  encryptObject<T>(obj: T): EncryptedData {
    return this.encrypt(JSON.stringify(obj));
  }

  /**
   * Decrypt a JSON object
   */
  decryptObject<T>(encrypted: EncryptedData): T {
    const decrypted = this.decrypt(encrypted);
    return JSON.parse(decrypted) as T;
  }

  /**
   * Check if encryption is available
   */
  isAvailable(): boolean {
    return this.encryptionKey !== null;
  }

  /**
   * Get encryption key status (without exposing the key)
   */
  getKeyStatus(): EncryptionKeyStatus {
    return {
      hasKey: this.encryptionKey !== null,
      keyLength: this.encryptionKey?.length ?? null,
      algorithm: this.algorithm,
    };
  }

  /**
   * Generate a new encryption key (for setup/migration)
   * Returns hex-encoded 32-byte key
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a value using SHA-256
   * Useful for creating request hashes for idempotency
   */
  hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  /**
   * Create HMAC signature
   * Useful for webhook signature verification
   */
  createHmac(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHmac(data: string, signature: string, secret: string): boolean {
    const expected = this.createHmac(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }

  /**
   * Ensure encryption key is available
   */
  private ensureKeyAvailable(): void {
    if (!this.encryptionKey) {
      throw new Error(
        'Encryption key not available. Set PAYMENT_ENCRYPTION_KEY environment variable.'
      );
    }
  }
}

/**
 * Provider credentials encryption helper
 */
export class ProviderCredentialsEncryption {
  constructor(private readonly encryptionService: EncryptionService) {}

  /**
   * Encrypt provider credentials
   */
  encryptCredentials(credentials: Record<string, unknown>): EncryptedData {
    return this.encryptionService.encryptObject(credentials);
  }

  /**
   * Decrypt provider credentials
   */
  decryptCredentials(encrypted: EncryptedData): Record<string, unknown> {
    return this.encryptionService.decryptObject(encrypted);
  }

  /**
   * Check if credentials are encrypted
   */
  isEncrypted(value: unknown): value is EncryptedData {
    return (
      typeof value === 'object' &&
      value !== null &&
      'ciphertext' in value &&
      'iv' in value &&
      'authTag' in value &&
      'algorithm' in value &&
      'version' in value
    );
  }
}
