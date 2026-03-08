import crypto from 'crypto';

/**
 * EncryptionService (OOP Implementation)
 * Provides AES-256-CBC encryption/decryption for sensitive tokens.
 */
export class EncryptionService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key: Buffer;
    private readonly ivLength = 16;

    constructor() {
        // Blueprint: ENCRYPTION_KEY must be a 32-char hex string (64 chars total)
        const secret = process.env.ENCRYPTION_KEY;
        if (!secret) throw new Error('ENCRYPTION_KEY is missing in env');
        this.key = Buffer.from(secret, 'hex');
    }

    /**
     * Encrypts plain text into iv:encrypted format.
     */
    public encrypt(text: string): string {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    /**
     * Decrypts iv:encrypted format back into plain text.
     */
    public decrypt(text: string): string {
        const [ivHex, encryptedHex] = text.split(':');
        if (!ivHex || !encryptedHex) throw new Error('Invalid encryption format');

        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedHex, 'hex')),
            decipher.final(),
        ]);
        return decrypted.toString();
    }
}

// Export a singleton instance for common use
export const encryptionService = new EncryptionService();
