/* ============================================================
   ENCRYPTION SERVICE (Client-Side E2E Simulation)
   ============================================================

   We use Web Crypto API (crypto.subtle) for AES-GCM encryption.

   IMPORTANT:
   - This is symmetric encryption.
   - Both users share the same key (stored in localStorage).
   - This simulates E2E encryption but is NOT production-grade.

   In real-world E2E (like WhatsApp):
   - Each user has public/private key pair.
   - Shared secret derived using Diffie-Hellman.
   - Session keys rotate frequently.
   - Double ratchet algorithm used.
============================================================ */


/* ============================================================
   1️⃣ Generate or Reuse Shared Key
   ============================================================ */

export async function getSharedKey() {
  /*
    Check if key already exists in localStorage.
    This ensures both tabs reuse the same encryption key.
  */
  const storedKey = localStorage.getItem("shared-chat-key");

  if (storedKey) {
    /*
      Keys must be in CryptoKey format.
      localStorage only stores strings.
      So we:
        1. Parse JSON
        2. Convert to Uint8Array
        3. Import back into CryptoKey format
    */
    const rawKey = Uint8Array.from(JSON.parse(storedKey));

    return await crypto.subtle.importKey(
      "raw",                 // raw binary format
      rawKey,                // actual key bytes
      { name: "AES-GCM" },   // algorithm
      true,                  // extractable (can export again)
      ["encrypt", "decrypt"] // allowed operations
    );
  }

  /*
    If no key exists:
    Generate new 256-bit AES-GCM key.
  */
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 }, // 256-bit strong encryption
    true,                             // extractable
    ["encrypt", "decrypt"]
  );

  /*
    Export key so we can persist it.
    Web Crypto API returns CryptoKey object,
    which cannot be stored directly.
  */
  const exported = await crypto.subtle.exportKey("raw", key);

  /*
    Store key bytes in localStorage.
    Convert Uint8Array → normal array → JSON string.
  */
  localStorage.setItem(
    "shared-chat-key",
    JSON.stringify(Array.from(new Uint8Array(exported)))
  );

  return key;
}


/* ============================================================
   2️⃣ Encrypt Message
   ============================================================ */

export async function encryptMessage(key, text) {
  /*
    Convert string → binary format.
    Encryption works on bytes, not strings.
  */
  const encoder = new TextEncoder();

  /*
    Generate random IV (Initialization Vector).
    AES-GCM requires unique IV per encryption.

    Why?
    - Prevents replay attacks
    - Prevents identical ciphertext for same plaintext
    - Critical for security

    12 bytes (96 bits) is recommended size for GCM.
  */
  const iv = crypto.getRandomValues(new Uint8Array(12));

  /*
    Perform encryption.

    AES-GCM:
    - Symmetric encryption
    - Authenticated encryption (integrity check included)
  */
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, // algorithm + IV
    key,                     // symmetric key
    encoder.encode(text)     // plaintext bytes
  );

  /*
    Return both:
    - iv (required for decryption)
    - encrypted data

    We convert them to arrays because:
    BroadcastChannel cannot send ArrayBuffer directly in some cases.
  */
  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  };
}


/* ============================================================
   3️⃣ Decrypt Message
   ============================================================ */

export async function decryptMessage(key, encryptedData) {
  /*
    Extract IV and encrypted bytes.
  */
  const { iv, data } = encryptedData;

  /*
    Decrypt using same algorithm and key.
    If:
      - Key is wrong
      - IV is wrong
      - Data corrupted
    → crypto.subtle.decrypt will throw OperationError
  */
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(data)
  );

  /*
    Convert decrypted bytes back to string.
  */
  return new TextDecoder().decode(decrypted);
}

// 🔐 Important Security Notes (Interview Gold)

// You should know these if asked:

// ❗ Why This Is NOT Real WhatsApp-Level E2E

// Because:

// Key is stored in localStorage (not secure)

// No public/private key exchange

// No forward secrecy

// No key rotation

// No identity verification

// No server-side key exchange protocol

// 🟢 What Production E2E Would Look Like

// Generate public/private key pair

// Exchange public keys via server

// Derive shared secret using Diffie-Hellman

// Use derived key for AES session encryption

// Rotate keys periodically

// Use Double Ratchet algorithm (Signal Protocol)

// 🧠 If Interviewer Asks:

// Why AES-GCM?

// You say:

// Fast

// Authenticated encryption

// Prevents tampering

// Standard in modern systems

// Supported natively by Web Crypto API

// Why random IV every time?

// Because reusing IV with AES-GCM breaks security and allows ciphertext attacks.

// Why 256-bit key?

// Higher entropy → brute force infeasible.