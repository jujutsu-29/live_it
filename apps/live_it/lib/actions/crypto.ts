"use server"

import crypto from 'crypto';

const ALGORITHM = process.env.ALGORITHM!;
const ENCRYPTION_KEY = Buffer.from(process.env.STREAM_KEY_ENCRYPTION_KEY!, 'hex'); 
const IV_LENGTH = 16;


export async function encrypt(text: string): Promise<string> {
  const iv = crypto.randomBytes(IV_LENGTH); 
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv) as crypto.CipherGCM;
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format: Expected iv:authTag:data");
    }
    const iv = Buffer.from(parts[0], 'hex'); 
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];

    if (iv.length !== IV_LENGTH) {
        throw new Error("Invalid IV length recovered from stored text");
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv) as crypto.DecipherGCM;

    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return ""; 
  }
}


