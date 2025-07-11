import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateCSRFToken,
  isCSRFExemptPath,
  isCSRFProtectedMethod,
  validateCSRFToken,
} from "./csrf";

describe("CSRF Protection", () => {
  describe("generateCSRFToken", () => {
    it("should generate a token with three parts", async () => {
      const token = await generateCSRFToken();
      const parts = token.split(".");
      expect(parts).toHaveLength(3);
    });

    it("should generate unique tokens", async () => {
      const token1 = await generateCSRFToken();
      const token2 = await generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("validateCSRFToken", () => {
    it("should validate a freshly generated token", async () => {
      const token = await generateCSRFToken();
      expect(await validateCSRFToken(token)).toBe(true);
    });

    it("should reject invalid token format", async () => {
      expect(await validateCSRFToken("invalid")).toBe(false);
      expect(await validateCSRFToken("part1.part2")).toBe(false);
      expect(await validateCSRFToken("")).toBe(false);
    });

    it("should reject tampered tokens", async () => {
      const token = await generateCSRFToken();
      const parts = token.split(".");
      const tamperedToken = `${parts[0]}.${parts[1]}.tampered`;
      expect(await validateCSRFToken(tamperedToken)).toBe(false);
    });

    it("should reject expired tokens", async () => {
      // Mock Date.now to simulate an old token
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() - 25 * 60 * 60 * 1000); // 25 hours ago

      const oldToken = await generateCSRFToken();

      Date.now = originalNow;
      expect(await validateCSRFToken(oldToken)).toBe(false);
    });
  });

  describe("isCSRFProtectedMethod", () => {
    it("should protect state-changing methods", () => {
      expect(isCSRFProtectedMethod("POST")).toBe(true);
      expect(isCSRFProtectedMethod("PUT")).toBe(true);
      expect(isCSRFProtectedMethod("PATCH")).toBe(true);
      expect(isCSRFProtectedMethod("DELETE")).toBe(true);
    });

    it("should not protect safe methods", () => {
      expect(isCSRFProtectedMethod("GET")).toBe(false);
      expect(isCSRFProtectedMethod("HEAD")).toBe(false);
      expect(isCSRFProtectedMethod("OPTIONS")).toBe(false);
    });

    it("should be case insensitive", () => {
      expect(isCSRFProtectedMethod("post")).toBe(true);
      expect(isCSRFProtectedMethod("Post")).toBe(true);
    });
  });

  describe("isCSRFExemptPath", () => {
    it("should exempt webhook paths", () => {
      expect(isCSRFExemptPath("/api/webhooks/auth")).toBe(true);
      expect(isCSRFExemptPath("/api/webhooks/stripe")).toBe(true);
      expect(isCSRFExemptPath("/api/webhooks/emails")).toBe(true);
    });

    it("should exempt health check paths", () => {
      expect(isCSRFExemptPath("/api/health")).toBe(true);
      expect(isCSRFExemptPath("/api/ping")).toBe(true);
      expect(isCSRFExemptPath("/api/status")).toBe(true);
    });

    it("should exempt OG image path", () => {
      expect(isCSRFExemptPath("/api/og")).toBe(true);
    });

    it("should not exempt regular API paths", () => {
      expect(isCSRFExemptPath("/api/jobs")).toBe(false);
      expect(isCSRFExemptPath("/api/users")).toBe(false);
      expect(isCSRFExemptPath("/api/interviews")).toBe(false);
    });
  });
});
