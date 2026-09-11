// ==========================================
// CLIENT-SIDE CRYPTOGRAPHY SERVICE (Web Crypto API)
// ==========================================

const APP_SALT = "NEON_PIANO_SECURE_SALT_v1";

/**
 * Converts ArrayBuffer to Base64 string
 */
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts Base64 string to Uint8Array
 */
function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts ArrayBuffer to Hex string
 */
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Standard SHA-256 implementation for insecure contexts (e.g. mobile accessing via HTTP LAN IP)
const K256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function rotr(n, x) {
  return (x >>> n) | (x << (32 - n));
}

function sha256Fallback(str) {
  const utf8 = new TextEncoder().encode(str);
  const bitLen = utf8.length * 8;
  const padLen = (bitLen % 512 < 448) ? (448 - (bitLen % 512)) : (960 - (bitLen % 512));
  const totalBytes = utf8.length + (padLen / 8) + 8;
  const buf = new Uint8Array(totalBytes);
  buf.set(utf8);
  buf[utf8.length] = 0x80;

  const view = new DataView(buf.buffer);
  view.setUint32(totalBytes - 4, bitLen & 0xffffffff, false);
  view.setUint32(totalBytes - 8, Math.floor(bitLen / 0x100000000), false);

  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;

  const W = new Uint32Array(64);

  for (let chunk = 0; chunk < totalBytes; chunk += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = view.getUint32(chunk + (t * 4), false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(7, W[t - 15]) ^ rotr(18, W[t - 15]) ^ (W[t - 15] >>> 3);
      const s1 = rotr(17, W[t - 2]) ^ rotr(19, W[t - 2]) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }

    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;

    for (let t = 0; t < 64; t++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + K256[t] + W[t]) | 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H0 = (H0 + a) | 0;
    H1 = (H1 + b) | 0;
    H2 = (H2 + c) | 0;
    H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0;
    H5 = (H5 + f) | 0;
    H6 = (H6 + g) | 0;
    H7 = (H7 + h) | 0;
  }

  const res = [H0, H1, H2, H3, H4, H5, H6, H7];
  return res.map(val => (val >>> 0).toString(16).padStart(8, "0")).join("");
}

/**
 * Hashes user password with SHA-256 + salt on the client side.
 * Seamlessly works in both Secure Contexts (Web Crypto API) and Insecure Contexts (pure JS).
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function hashPassword(username, password) {
  if (!username || !password) {
    throw new Error("Username and password are required for hashing.");
  }
  
  const normalizedUser = username.trim().toLowerCase();
  const saltedInput = `${APP_SALT}::${normalizedUser}::${password.trim()}`;
  
  // Use Web Crypto API if available (HTTPS or localhost)
  if (typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.digest === "function") {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(saltedInput);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      return bufferToHex(hashBuffer);
    } catch (e) {
      console.warn("Web Crypto digest failed, using pure JS fallback:", e);
    }
  }

  // Pure JS fallback for HTTP LAN IP (e.g. mobile access)
  return sha256Fallback(saltedInput);
}

/**
 * Derives a CryptoKey for AES-GCM (256-bit) from the user's password hash.
 */
async function deriveAesKey(passwordHash) {
  if (!crypto?.subtle?.digest || !crypto?.subtle?.importKey) {
    return null;
  }
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(`AES_KEY_MATERIAL::${passwordHash}`);
  const keyDigest = await crypto.subtle.digest("SHA-256", keyMaterial);
  
  return await crypto.subtle.importKey(
    "raw",
    keyDigest,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts arbitrary game stats / data using AES-GCM on the client side.
 */
export async function encryptGameStats(dataObj, passwordHash) {
  try {
    const key = await deriveAesKey(passwordHash);
    if (!key || !crypto?.subtle?.encrypt) {
      // Insecure context fallback: encode as safe base64
      const json = JSON.stringify(dataObj);
      return {
        cipherText: btoa(unescape(encodeURIComponent(json))),
        iv: "insecure_fallback"
      };
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(dataObj));
    
    const cipherBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedData
    );
    
    return {
      cipherText: bufferToBase64(cipherBuffer),
      iv: bufferToBase64(iv)
    };
  } catch (err) {
    console.error("Encryption error:", err);
    throw new Error("Failed to encrypt stats: " + err.message);
  }
}

/**
 * Decrypts game stats on the client side.
 */
export async function decryptGameStats(cipherTextBase64, ivBase64, passwordHash) {
  try {
    if (ivBase64 === "insecure_fallback" || !crypto?.subtle?.decrypt) {
      const json = decodeURIComponent(escape(atob(cipherTextBase64)));
      return JSON.parse(json);
    }

    const key = await deriveAesKey(passwordHash);
    const iv = base64ToBuffer(ivBase64);
    const cipherBuffer = base64ToBuffer(cipherTextBase64);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      cipherBuffer
    );
    
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Decryption error:", err);
    throw new Error("Failed to decrypt stats. Invalid key or corrupted payload.");
  }
}
