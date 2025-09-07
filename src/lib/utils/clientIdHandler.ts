/**
 * Client-safe ID handler for working with pre-encoded IDs
 * This doesn't encode/decode IDs but provides utilities for working with them
 */

export const clientIdHandler = {
  /**
   * For client-side usage, we expect IDs to already be encoded from the server
   * This function returns the ID as-is if it's already a string (encoded),
   * or converts a number to string for backward compatibility
   */
  formatId(id: string | number | undefined | null): string {
    if (!id && id !== 0) return "";

    // If it's already a string, assume it's pre-encoded from server
    if (typeof id === "string") return id;

    // If it's a number, convert to string
    // This handles cases where we're working with local/temporary IDs
    return String(id);
  },

  /**
   * Check if an ID looks like a valid encoded ID
   */
  isValidId(id: string | number | undefined | null): boolean {
    if (!id && id !== 0) return false;
    const idStr = String(id);
    return idStr.length > 0;
  },

  /**
   * Extract numeric ID for local storage operations
   * Returns null if not a valid numeric ID
   */
  extractNumericId(id: string): number | null {
    const numericId = Number.parseInt(id, 10);
    return Number.isNaN(numericId) ? null : numericId;
  },
};
