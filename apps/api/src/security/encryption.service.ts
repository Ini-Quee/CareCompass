import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor(private configService: ConfigService) {}

  /**
   * Encrypt sensitive data
   */
  encrypt(plaintext: string): string {
    const encryptionKey = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, encryptionKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Format: iv:tag:ciphertext (all hex encoded)
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    const encryptionKey = this.getEncryptionKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const ciphertext = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, encryptionKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Encrypt an object (JSON serialization + encryption)
   */
  encryptObject(obj: any): string {
    const json = JSON.stringify(obj);
    return this.encrypt(json);
  }

  /**
   * Decrypt an object (decryption + JSON parsing)
   */
  decryptObject<T>(encryptedData: string): T {
    const json = this.decrypt(encryptedData);
    return JSON.parse(json);
  }

  /**
   * Get encryption key from config
   */
  private getEncryptionKey(): Buffer {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    
    if (!key) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    // Derive a key from the configured secret
    return crypto.scryptSync(key, 'carecompass-salt', this.keyLength);
  }

  /**
   * Rotate encryption key (re-encrypt data with new key)
   */
  async rotateEncryption(data: string, oldKey: string, newKey: string): Promise<string> {
    // Decrypt with old key
    const tempService = new EncryptionService({
      get: () => oldKey,
    } as any);
    
    const plaintext = tempService.decrypt(data);

    // Encrypt with new key
    return this.encrypt(plaintext);
  }
}
