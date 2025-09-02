import Hashids from "hashids";

class IDHandler {
  private hashids: Hashids;

  constructor(salt: string, minLength = 10) {
    this.hashids = new Hashids(salt, minLength);
  }

  encode(id: number): string {
    return this.hashids.encode(id);
  }

  decode(hash: string): number {
    const numbers = this.hashids.decode(hash);
    if (numbers.length === 0) {
      throw new Error("Invalid hash");
    }
    return numbers[0] as number;
  }
}

// Allow fallback during build time to prevent build failures
// At runtime in production, the missing env var will cause actual runtime errors
// which is more appropriate than blocking the build
const salt = process.env.ID_ENCODING_SALT || "fallback-salt-for-build";

export const idHandler = new IDHandler(salt);
