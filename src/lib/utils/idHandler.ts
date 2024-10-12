import Hashids from "hashids";

class IDHandler {
  private hashids: Hashids;

  constructor(salt: string, minLength: number = 10) {
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

export const idHandler = new IDHandler("qT6uuo!8J@ZuhwE6qzU@P.h34jZ-*J@");
