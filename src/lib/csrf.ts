import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_SECRET = process.env.CSRF_SECRET || "development-csrf-secret-change-in-production";

export interface CSRFTokenData {
  token: string;
  timestamp: number;
}

export function generateCSRFToken(): string {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  const timestamp = Date.now();
  const data = `${token}.${timestamp}`;

  const signature = createHmac("sha256", CSRF_SECRET).update(data).digest("hex");

  return `${data}.${signature}`;
}

export function validateCSRFToken(token: string): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [tokenPart, timestampStr, signature] = parts;
  const timestamp = Number.parseInt(timestampStr, 10);

  if (Number.isNaN(timestamp)) return false;

  const tokenAge = Date.now() - timestamp;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  if (tokenAge > maxAge) return false;

  const data = `${tokenPart}.${timestampStr}`;
  const expectedSignature = createHmac("sha256", CSRF_SECRET).update(data).digest("hex");

  return signature === expectedSignature;
}

export async function getCSRFToken(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return null;
  }

  return validateCSRFToken(cookieToken) ? cookieToken : null;
}

export async function setCSRFCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Allow JavaScript access for including in headers
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

export function isCSRFProtectedMethod(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

export function isCSRFExemptPath(pathname: string): boolean {
  const exemptPaths = [
    "/api/webhooks/auth",
    "/api/webhooks/stripe",
    "/api/webhooks/emails",
    "/api/og",
    "/api/health",
    "/api/ping",
    "/api/status",
  ];

  return exemptPaths.some((path) => pathname.startsWith(path));
}
