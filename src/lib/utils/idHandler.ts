import Hashids from "hashids";

class IDHandler {
  private hashids: Hashids | null = null;

  private getHashids(): Hashids {
    if (!this.hashids) {
      // Only initialize on server-side
      if (typeof window === "undefined") {
        const salt = process.env.ID_ENCODING_SALT;
        if (!salt) {
          throw new Error("ID_ENCODING_SALT environment variable is required");
        }
        this.hashids = new Hashids(salt, 10);
      } else {
        // On client-side, throw error - IDs should already be encoded from server
        throw new Error(
          "ID encoding/decoding should only happen on the server. Client should receive already-encoded IDs."
        );
      }
    }
    return this.hashids;
  }

  encode(id: number): string {
    return this.getHashids().encode(id);
  }

  decode(hash: string): number {
    const numbers = this.getHashids().decode(hash);
    if (numbers.length === 0) {
      throw new Error("Invalid hash");
    }
    return numbers[0] as number;
  }

  // Safe decode that returns null instead of throwing
  safeDecode(hash: string): number | null {
    try {
      return this.decode(hash);
    } catch {
      return null;
    }
  }

  // Client-safe methods that don't require the salt
  isValidHash(hash: string): boolean {
    // Basic validation that doesn't require decoding
    return typeof hash === "string" && hash.length >= 10;
  }
}

export const idHandler = new IDHandler();
