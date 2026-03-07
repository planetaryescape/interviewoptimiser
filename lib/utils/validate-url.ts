import { logger } from "~/lib/logger";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "[::0]",
  "metadata.google.internal",
  "169.254.169.254", // AWS/GCP metadata
  "100.100.100.200", // Alibaba metadata
]);

const BLOCKED_TLD = new Set(["local", "internal", "localhost", "intranet"]);

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Validates a URL for safe server-side fetching (SSRF protection).
 * Returns the validated URL string or null if blocked.
 */
export function validateUrlForFetch(input: string): {
  valid: boolean;
  url: string | null;
  error: string | null;
} {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { valid: false, url: null, error: "Invalid URL format" };
  }

  // Protocol check
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return {
      valid: false,
      url: null,
      error: `Protocol "${parsed.protocol}" is not allowed. Use http: or https:`,
    };
  }

  // Hostname checks
  const hostname = parsed.hostname.toLowerCase();

  if (!hostname || hostname.trim() === "") {
    return { valid: false, url: null, error: "URL must have a hostname" };
  }

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    logger.warn({ hostname }, "SSRF: blocked hostname");
    return { valid: false, url: null, error: "This hostname is not allowed" };
  }

  // Block private/reserved IP ranges
  if (isPrivateIp(hostname)) {
    logger.warn({ hostname }, "SSRF: blocked private IP");
    return {
      valid: false,
      url: null,
      error: "Private/internal IP addresses are not allowed",
    };
  }

  // Block internal TLDs
  const parts = hostname.split(".");
  const tld = parts[parts.length - 1];
  if (BLOCKED_TLD.has(tld)) {
    logger.warn({ hostname, tld }, "SSRF: blocked internal TLD");
    return { valid: false, url: null, error: "Internal domains are not allowed" };
  }

  // Block URLs with credentials
  if (parsed.username || parsed.password) {
    return { valid: false, url: null, error: "URLs with credentials are not allowed" };
  }

  return { valid: true, url: parsed.href, error: null };
}

/**
 * Client-side URL format check (no SSRF logic needed, just basic validity).
 */
export function isValidHttpUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isPrivateIp(hostname: string): boolean {
  // IPv4 private ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    // 10.0.0.0/8
    if (a === 10) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 127.0.0.0/8
    if (a === 127) return true;
    // 169.254.0.0/16 (link-local)
    if (a === 169 && b === 254) return true;
    // 0.0.0.0/8
    if (a === 0) return true;
  }

  // IPv6 loopback/private (bracket notation)
  if (hostname.startsWith("[")) {
    const ipv6 = hostname.slice(1, -1).toLowerCase();
    if (
      ipv6 === "::1" ||
      ipv6 === "::0" ||
      ipv6 === "" ||
      ipv6.startsWith("fe80:") ||
      ipv6.startsWith("fc00:") ||
      ipv6.startsWith("fd")
    ) {
      return true;
    }
  }

  return false;
}
