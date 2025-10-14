import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { getIdentifier, getRateLimitCategory } from "./rate-limit";

describe("Rate Limiting", () => {
  describe("getRateLimitCategory", () => {
    it("should return 'auth' for auth webhook endpoints", () => {
      expect(getRateLimitCategory("/api/webhooks/auth")).toBe("auth");
      expect(getRateLimitCategory("/api/webhooks/auth/callback")).toBe("auth");
    });

    it("should return 'webhook' for other webhook endpoints", () => {
      expect(getRateLimitCategory("/api/webhooks/stripe")).toBe("webhook");
      expect(getRateLimitCategory("/api/webhooks/emails")).toBe("webhook");
    });

    it("should return 'publicApi' for public API endpoints", () => {
      expect(getRateLimitCategory("/api/public/stats")).toBe("publicApi");
      expect(getRateLimitCategory("/api/public/data")).toBe("publicApi");
    });

    it("should return 'fileUpload' for upload endpoints", () => {
      expect(getRateLimitCategory("/api/upload")).toBe("fileUpload");
      expect(getRateLimitCategory("/api/extract")).toBe("fileUpload");
      expect(getRateLimitCategory("/api/files/upload")).toBe("fileUpload");
    });

    it("should return 'report' for report endpoints", () => {
      expect(getRateLimitCategory("/api/reports/123")).toBe("report");
      expect(getRateLimitCategory("/api/analyze/data")).toBe("report");
    });

    it("should return 'interviewUpdate' for interview update endpoints", () => {
      expect(getRateLimitCategory("/api/interviews/123")).toBe("interviewUpdate");
      expect(getRateLimitCategory("/api/interviews/abc-def")).toBe("interviewUpdate");
    });

    it("should return 'ai' for AI endpoints", () => {
      expect(getRateLimitCategory("/api/ai/completion")).toBe("ai");
    });

    it("should return 'api' for general API endpoints", () => {
      expect(getRateLimitCategory("/api/users")).toBe("api");
      expect(getRateLimitCategory("/api/jobs")).toBe("api");
      expect(getRateLimitCategory("/api/settings")).toBe("api");
    });
  });

  describe("getIdentifier", () => {
    it("should validate IPv4 addresses", () => {
      const validRequest = new NextRequest("http://localhost/api/test", {
        headers: { "cf-connecting-ip": "192.168.1.1" },
      });
      expect(getIdentifier(validRequest)).toBe("192.168.1.1");

      const invalidRequest = new NextRequest("http://localhost/api/test", {
        headers: { "cf-connecting-ip": "256.256.256.256" },
      });
      expect(getIdentifier(invalidRequest)).toBe("127.0.0.1");
    });

    it("should validate IPv6 addresses", () => {
      const validRequest = new NextRequest("http://localhost/api/test", {
        headers: { "cf-connecting-ip": "2001:db8::8a2e:370:7334" },
      });
      expect(getIdentifier(validRequest)).toBe("2001:db8::8a2e:370:7334");

      const invalidRequest = new NextRequest("http://localhost/api/test", {
        headers: { "cf-connecting-ip": "gggg::1" },
      });
      expect(getIdentifier(invalidRequest)).toBe("127.0.0.1");
    });

    it("should reject malicious input", () => {
      const xssRequest = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "<script>alert('xss')</script>" },
      });
      expect(getIdentifier(xssRequest)).toBe("127.0.0.1");

      const sqlRequest = new NextRequest("http://localhost/api/test", {
        headers: { "x-real-ip": "'; DROP TABLE users; --" },
      });
      expect(getIdentifier(sqlRequest)).toBe("127.0.0.1");
    });
  });
});
