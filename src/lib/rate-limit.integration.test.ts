import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { checkRateLimit, getIdentifier } from "./rate-limit";

describe("Rate Limiting Integration", () => {
  describe("checkRateLimit", () => {
    it("should return success when KV is not configured", async () => {
      const request = new NextRequest("http://localhost/api/test");
      const result = await checkRateLimit(request, "api");

      expect(result.success).toBe(true);
      expect(result.limit).toBe(0);
      expect(result.remaining).toBe(0);
      expect(result.reset).toBe(0);
    });
  });

  describe("getIdentifier", () => {
    it("should prioritize cf-connecting-ip header", () => {
      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          "cf-connecting-ip": "192.168.1.1",
          "x-forwarded-for": "10.0.0.1",
          "x-real-ip": "172.16.0.1",
        },
      });

      expect(getIdentifier(request)).toBe("192.168.1.1");
    });

    it("should use x-forwarded-for when cf-connecting-ip is not available", () => {
      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          "x-forwarded-for": "10.0.0.1, 10.0.0.2",
          "x-real-ip": "172.16.0.1",
        },
      });

      expect(getIdentifier(request)).toBe("10.0.0.1");
    });

    it("should use x-real-ip as fallback", () => {
      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          "x-real-ip": "172.16.0.1",
        },
      });

      expect(getIdentifier(request)).toBe("172.16.0.1");
    });

    it("should return localhost when no valid IP headers are present", () => {
      const request = new NextRequest("http://localhost/api/test");
      expect(getIdentifier(request)).toBe("127.0.0.1");
    });

    it("should reject invalid IP addresses", () => {
      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          "cf-connecting-ip": "invalid-ip",
          "x-forwarded-for": "not.an.ip.address",
          "x-real-ip": "256.256.256.256",
        },
      });

      expect(getIdentifier(request)).toBe("127.0.0.1");
    });

    it("should handle spoofed headers with invalid IPs", () => {
      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          "x-forwarded-for": "<script>alert('xss')</script>, 10.0.0.1",
          "x-real-ip": "'; DROP TABLE users; --",
        },
      });

      expect(getIdentifier(request)).toBe("127.0.0.1");
    });

    it("should handle IPv6 addresses", () => {
      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          "cf-connecting-ip": "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        },
      });

      expect(getIdentifier(request)).toBe("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
    });
  });
});
