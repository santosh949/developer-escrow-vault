/**
 * Zero-Knowledge Web Crypto Utility (AES-GCM)
 * Encrypts payloads client-side before touching the network.
 */

// Helper functions for browser-native base64 encoding/decoding
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBuffer = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Generate a random initialization vector
export const generateIV = () => crypto.getRandomValues(new Uint8Array(12));

// Derive an AES-GCM key from a user password/passphrase using PBKDF2
export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypt string data using AES-GCM
export const encryptPayload = async (key: CryptoKey, data: string): Promise<{ ciphertext: string; iv: string }> => {
  const encoder = new TextEncoder();
  const iv = generateIV();
  const encodedData = encoder.encode(data);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedData
  );

  return { 
    ciphertext: bufferToBase64(encryptedBuffer), 
    iv: bufferToBase64(iv.buffer) 
  };
};

// Decrypt base64 encrypted data using AES-GCM
export const decryptPayload = async (key: CryptoKey, ciphertextBase64: string, ivBase64: string): Promise<string> => {
  const iv = base64ToBuffer(ivBase64);
  const encryptedBuffer = base64ToBuffer(ciphertextBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};
