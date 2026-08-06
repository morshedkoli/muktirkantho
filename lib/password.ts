import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;

/**
 * Constant-time comparison for two secrets of unknown length. Hashing first
 * normalizes the length so `timingSafeEqual` never throws and the comparison
 * doesn't leak how many leading characters matched.
 */
export function safeEqual(a: string, b: string) {
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${digest}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, storedDigest] = storedHash.split(":");
  if (!salt || !storedDigest) return false;

  const digest = scryptSync(password, salt, KEY_LEN);
  const storedBuffer = Buffer.from(storedDigest, "hex");

  if (digest.length !== storedBuffer.length) return false;
  return timingSafeEqual(digest, storedBuffer);
}
