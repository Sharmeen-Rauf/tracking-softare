import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// We fallback to a default 32-byte key in hex format to ensure it builds and works out-of-the-box,
// but production deployments should define TOKEN_ENCRYPTION_KEY in .env
const SECRET_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'b7a13c9e6d4f8a2b5c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b';

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

export function encryptToken(token: string): EncryptedData {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag
  };
}

export function decryptToken(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
