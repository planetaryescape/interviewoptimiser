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

export async function generateCSRFToken(): Promise<string> {
  const tokenBytes = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const timestamp = Date.now();
  const data = `${token}.${timestamp}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(CSRF_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${data}.${signature}`;
}

export async function validateCSRFToken(token: string): Promise<boolean> {
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

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(CSRF_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signature === expectedSignature;
}

export async function getCSRFToken(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return null;
  }

  return (await validateCSRFToken(cookieToken)) ? cookieToken : null;
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
