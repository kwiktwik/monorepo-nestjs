/**
 * Unit tests for EncryptionService
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  EncryptionService,
  ProviderCredentialsEncryption,
} from '../encryption.service';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;
  let configService: ConfigService;

  // Generate a valid 32-byte key for testing
  const testKey = crypto.randomBytes(32).toString('hex');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PAYMENT_ENCRYPTION_KEY') {
                return testKey;
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    encryptionService = module.get<EncryptionService>(EncryptionService);
    configService = module.get<ConfigService>(ConfigService);

    // Manually trigger onModuleInit
    encryptionService.onModuleInit();
  });

  describe('initialization', () => {
    it('should initialize successfully with a valid key', () => {
      expect(encryptionService.isAvailable()).toBe(true);
    });

    it('should not be available without a key', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EncryptionService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const service = module.get<EncryptionService>(EncryptionService);
      service.onModuleInit();

      expect(service.isAvailable()).toBe(false);
    });

    it('should not be available with an invalid key length', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EncryptionService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => 'shortkey'), // Invalid key length
            },
          },
        ],
      }).compile();

      const service = module.get<EncryptionService>(EncryptionService);
      service.onModuleInit();

      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const plaintext = 'my-secret-data';

      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'my-secret-data';

      const encrypted1 = encryptionService.encrypt(plaintext);
      const encrypted2 = encryptionService.encrypt(plaintext);

      // Different IVs should produce different ciphertext
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should include correct algorithm and version in encrypted data', () => {
      const encrypted = encryptionService.encrypt('test');

      expect(encrypted.algorithm).toBe('aes-256-gcm');
      expect(encrypted.version).toBe(1);
    });

    it('should throw error when decrypting with wrong algorithm', () => {
      const encrypted = encryptionService.encrypt('test');
      const invalidEncrypted = { ...encrypted, algorithm: 'aes-128-cbc' };

      expect(() => encryptionService.decrypt(invalidEncrypted)).toThrow(
        'Unsupported algorithm',
      );
    });

    it('should throw error when decrypting with wrong version', () => {
      const encrypted = encryptionService.encrypt('test');
      const invalidEncrypted = { ...encrypted, version: 99 };

      expect(() => encryptionService.decrypt(invalidEncrypted)).toThrow(
        'Unsupported encryption version',
      );
    });

    it('should throw error when decrypting with tampered ciphertext', () => {
      const encrypted = encryptionService.encrypt('test');
      const tamperedEncrypted = {
        ...encrypted,
        ciphertext: Buffer.from('tampered').toString('base64'),
      };

      expect(() => encryptionService.decrypt(tamperedEncrypted)).toThrow();
    });

    it('should throw error when encryption key is not available', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EncryptionService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const service = module.get<EncryptionService>(EncryptionService);
      service.onModuleInit();

      expect(() => service.encrypt('test')).toThrow('Encryption key not available');
      expect(() => service.decrypt({} as any)).toThrow('Encryption key not available');
    });
  });

  describe('encryptObject and decryptObject', () => {
    it('should encrypt and decrypt an object correctly', () => {
      const obj = {
        keyId: 'rzp_test_123',
        keySecret: 'secret123',
        webhookSecret: 'wh_secret',
      };

      const encrypted = encryptionService.encryptObject(obj);
      const decrypted = encryptionService.decryptObject<typeof obj>(encrypted);

      expect(decrypted).toEqual(obj);
    });

    it('should handle nested objects', () => {
      const obj = {
        credentials: {
          keyId: 'test',
          keySecret: 'secret',
        },
        settings: {
          enabled: true,
          timeout: 5000,
        },
      };

      const encrypted = encryptionService.encryptObject(obj);
      const decrypted = encryptionService.decryptObject<typeof obj>(encrypted);

      expect(decrypted).toEqual(obj);
    });
  });

  describe('getKeyStatus', () => {
    it('should return correct key status when available', () => {
      const status = encryptionService.getKeyStatus();

      expect(status.hasKey).toBe(true);
      expect(status.keyLength).toBe(32);
      expect(status.algorithm).toBe('aes-256-gcm');
    });

    it('should return correct key status when not available', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EncryptionService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const service = module.get<EncryptionService>(EncryptionService);
      service.onModuleInit();

      const status = service.getKeyStatus();

      expect(status.hasKey).toBe(false);
      expect(status.keyLength).toBeNull();
    });
  });

  describe('generateKey', () => {
    it('should generate a valid 32-byte key', () => {
      const key = EncryptionService.generateKey();

      expect(key).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(Buffer.from(key, 'hex').length).toBe(32);
    });

    it('should generate unique keys', () => {
      const key1 = EncryptionService.generateKey();
      const key2 = EncryptionService.generateKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe('hash', () => {
    it('should produce consistent SHA-256 hash', () => {
      const value = 'test-value';

      const hash1 = encryptionService.hash(value);
      const hash2 = encryptionService.hash(value);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex chars
    });

    it('should produce different hashes for different values', () => {
      const hash1 = encryptionService.hash('value1');
      const hash2 = encryptionService.hash('value2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createHmac and verifyHmac', () => {
    it('should create and verify HMAC signature', () => {
      const data = 'payload-to-sign';
      const secret = 'webhook-secret';

      const signature = encryptionService.createHmac(data, secret);
      const isValid = encryptionService.verifyHmac(data, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject invalid HMAC signature', () => {
      const data = 'payload-to-sign';
      const secret = 'webhook-secret';
      const wrongSecret = 'wrong-secret';

      const signature = encryptionService.createHmac(data, secret);
      const isValid = encryptionService.verifyHmac(data, signature, wrongSecret);

      expect(isValid).toBe(false);
    });

    it('should reject tampered data', () => {
      const data = 'payload-to-sign';
      const secret = 'webhook-secret';

      const signature = encryptionService.createHmac(data, secret);
      const isValid = encryptionService.verifyHmac('tampered-data', signature, secret);

      expect(isValid).toBe(false);
    });
  });
});

describe('ProviderCredentialsEncryption', () => {
  let encryptionService: EncryptionService;
  let credentialsEncryption: ProviderCredentialsEncryption;

  const testKey = crypto.randomBytes(32).toString('hex');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PAYMENT_ENCRYPTION_KEY') {
                return testKey;
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    encryptionService = module.get<EncryptionService>(EncryptionService);
    encryptionService.onModuleInit();

    credentialsEncryption = new ProviderCredentialsEncryption(encryptionService);
  });

  describe('encryptCredentials and decryptCredentials', () => {
    it('should encrypt and decrypt provider credentials', () => {
      const credentials = {
        keyId: 'rzp_test_123',
        keySecret: 'secret123',
        webhookSecret: 'wh_secret',
      };

      const encrypted = credentialsEncryption.encryptCredentials(credentials);
      const decrypted = credentialsEncryption.decryptCredentials(encrypted);

      expect(decrypted).toEqual(credentials);
    });
  });

  describe('isEncrypted', () => {
    it('should return true for valid encrypted data', () => {
      const encrypted = encryptionService.encrypt('test');

      expect(credentialsEncryption.isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for non-encrypted data', () => {
      expect(credentialsEncryption.isEncrypted(null)).toBe(false);
      expect(credentialsEncryption.isEncrypted(undefined)).toBe(false);
      expect(credentialsEncryption.isEncrypted('string')).toBe(false);
      expect(credentialsEncryption.isEncrypted({ key: 'value' })).toBe(false);
    });

    it('should return false for partial encrypted data', () => {
      const partial = {
        ciphertext: 'abc',
        iv: 'def',
        // Missing authTag, algorithm, version
      };

      expect(credentialsEncryption.isEncrypted(partial)).toBe(false);
    });
  });
});
