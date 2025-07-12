import { createHash } from "crypto";
import { config } from "~/config";

/**
 * Creates a secure hash of an email address for tracking deleted users
 * Uses SHA-256 with a salt from environment variables
 */
export function hashEmail(email: string): string {
  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim();
  
  // Use a secret salt from config or environment
  // This prevents rainbow table attacks and ensures hashes are unique to our system
  const salt = process.env.EMAIL_HASH_SALT || config.projectName + "-deleted-users-salt";
  
  // Create SHA-256 hash with salt
  const hash = createHash("sha256");
  hash.update(salt + normalizedEmail);
  
  return hash.digest("hex");
}

/**
 * Check if an email matches a hash
 */
export function verifyEmailHash(email: string, hash: string): boolean {
  return hashEmail(email) === hash;
}