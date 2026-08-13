import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** Hash a plaintext password. Passwords must never be stored as plain text. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Compare a plaintext password against a stored hash. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}