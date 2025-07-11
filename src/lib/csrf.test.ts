import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateCSRFToken,
  isCSRFExemptPath,
  isCSRFProtectedMethod,
  validateCSRFToken,
} from "./csrf";

describe("CSRF Protection", () => {
  describe("generateCSRFToken", () => {
    it("should generate a token with three parts", () => {
      const token = generateCSRFToken();
      const parts = token.split(".");
      expect(parts).toHaveLength(3);
    });

    it("should generate unique tokens", () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("validateCSRFToken", () => {
    it("should validate a freshly generated token", () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken(token)).toBe(true);
    });

    it("should reject invalid token format", () => {
      expect(validateCSRFToken("invalid")).toBe(false);
      expect(validateCSRFToken("part1.part2")).toBe(false);
      expect(validateCSRFToken("")).toBe(false);
    });

    it("should reject tampered tokens", () => {
      const token = generateCSRFToken();
      const parts = token.split(".");
      const tamperedToken = `${parts[0]}.${parts[1]}.tampered`;
      expect(validateCSRFToken(tamperedToken)).toBe(false);
    });

    it("should reject expired tokens", () => {
      // Mock Date.now to simulate an old token
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() - 25 * 60 * 60 * 1000); // 25 hours ago

      const oldToken = generateCSRFToken();

      Date.now = originalNow;
      expect(validateCSRFToken(oldToken)).toBe(false);
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
