import { useInternetIdentity } from './useInternetIdentity';

export function useEncryption() {
  const { identity } = useInternetIdentity();

  const deriveKey = async (): Promise<CryptoKey> => {
    if (!identity) {
      throw new Error('No identity available for key derivation');
    }

    const principal = identity.getPrincipal().toString();
    const encoder = new TextEncoder();
    const principalBytes = encoder.encode(principal);

    // Use a fixed salt for consistent key derivation
    const salt = encoder.encode('SecureVault-2026-Salt');

    // Import the principal as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      principalBytes,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive AES-GCM key
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return key;
  };

  const encryptFile = async (file: File): Promise<Uint8Array<ArrayBuffer>> => {
    try {
      const key = await deriveKey();
      const fileBuffer = await file.arrayBuffer();

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the file
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        fileBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      // Create a new Uint8Array with proper ArrayBuffer type
      const result = new Uint8Array(combined);
      return result as Uint8Array<ArrayBuffer>;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt file');
    }
  };

  const decryptFile = async (encryptedData: Uint8Array): Promise<Uint8Array<ArrayBuffer>> => {
    try {
      const key = await deriveKey();

      // Extract IV and encrypted content
      const iv = encryptedData.slice(0, 12);
      const encryptedContent = encryptedData.slice(12);

      // Decrypt the file
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedContent
      );

      // Create a new Uint8Array with proper ArrayBuffer type
      const result = new Uint8Array(decryptedBuffer);
      return result as Uint8Array<ArrayBuffer>;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt file');
    }
  };

  return { encryptFile, decryptFile };
}
