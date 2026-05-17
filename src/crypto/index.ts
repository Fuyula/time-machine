const ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export const generateSalt = (): Uint8Array<ArrayBuffer> =>
  crypto.getRandomValues(
    new Uint8Array(SALT_LENGTH) as Uint8Array<ArrayBuffer>,
  );

export const generateIV = (): Uint8Array<ArrayBuffer> =>
  crypto.getRandomValues(new Uint8Array(IV_LENGTH) as Uint8Array<ArrayBuffer>);
export const deriveKey = async (
  pin: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

export const encrypt = async (
  data: unknown,
  key: CryptoKey,
): Promise<{ blob: string; iv: string }> => {
  const iv = generateIV();
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  );

  return {
    blob: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
};

export const decrypt = async (
  blob: string,
  iv: string,
  key: CryptoKey,
): Promise<unknown> => {
  const encrypted = Uint8Array.from(atob(blob), (c) => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    encrypted,
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
};
