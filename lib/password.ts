import bcrypt from "bcryptjs";

const ROUNDS = 10;

export function isBcryptHash(value: string): boolean {
  return /^\$2[aby]?\$\d{2}\$/.test(value);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

/**
 * Supports legacy plaintext accounts created by the original Express app.
 * Returns `legacy: true` so the caller can transparently re-hash the value.
 */
export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<{ ok: boolean; legacy: boolean }> {
  if (isBcryptHash(stored)) {
    return { ok: await bcrypt.compare(plain, stored), legacy: false };
  }
  return { ok: stored === plain, legacy: true };
}
