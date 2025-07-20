import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseIdParam(value: string | null | undefined, fieldName = "ID"): number {
  if (!value) {
    throw new Error(`${fieldName} is required`);
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${fieldName}: must be a valid number`);
  }

  if (parsed < 1) {
    throw new Error(`Invalid ${fieldName}: must be a positive number`);
  }

  return parsed;
}
