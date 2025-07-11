import { describe, expect, it } from "vitest";
import { getRateLimitCategory } from "./rate-limit";

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

    it("should return 'ai' for AI and interview endpoints", () => {
      expect(getRateLimitCategory("/api/ai/completion")).toBe("ai");
      expect(getRateLimitCategory("/api/interviews/123")).toBe("ai");
    });

    it("should return 'api' for general API endpoints", () => {
      expect(getRateLimitCategory("/api/users")).toBe("api");
      expect(getRateLimitCategory("/api/jobs")).toBe("api");
      expect(getRateLimitCategory("/api/settings")).toBe("api");
    });
  });
});
