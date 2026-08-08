import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password using bcrypt with 12 salt rounds.
 * 12 rounds is the industry-recommended balance between security and performance.
 *
 * @param plainPassword - The raw password string from the user
 * @returns The hashed password string to store in the database
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compares a plain-text password against a stored bcrypt hash.
 *
 * @param plainPassword  - The raw password provided during login
 * @param hashedPassword - The hash stored in the database
 * @returns true if the passwords match, false otherwise
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
