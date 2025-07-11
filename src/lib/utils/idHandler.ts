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

const salt = process.env.ID_ENCODING_SALT;
if (!salt) {
  throw new Error("ID_ENCODING_SALT environment variable is required");
}

export const idHandler = new IDHandler(salt);
