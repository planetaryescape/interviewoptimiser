import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSet = vi.fn();
const mockGet = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({ set: mockSet, get: mockGet }),
  },
}));

vi.mock("~/lib/logger", () => ({
  logger: { warn: vi.fn() },
}));

import { getExtractionResult, setExtractionResult } from "../extraction-store";
import type { ExtractionResult } from "../extraction-store";

describe("extraction-store", () => {
  beforeEach(() => {
    process.env.KV_REST_API_URL = "https://test.upstash.io";
    process.env.KV_REST_API_TOKEN = "test-token";
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.KV_REST_API_URL = "";
    process.env.KV_REST_API_TOKEN = "";
  });

  describe("setExtractionResult", () => {
    it("stores result in Redis", async () => {
      const result: ExtractionResult = { status: "completed", extractedText: "hello" };
      await setExtractionResult("abc", result);
      expect(mockSet).toHaveBeenCalledWith("extraction:abc", JSON.stringify(result), { ex: 300 });
    });

    it("does not throw when Redis throws", async () => {
      mockSet.mockRejectedValueOnce(new Error("Connection refused"));
      await expect(setExtractionResult("abc", { status: "pending" })).resolves.toBeUndefined();
    });

    it("returns early when Redis is not configured", async () => {
      process.env.KV_REST_API_URL = "";
      await setExtractionResult("abc", { status: "pending" });
      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  describe("getExtractionResult", () => {
    it("retrieves and parses result from Redis", async () => {
      const stored: ExtractionResult = { status: "completed", extractedText: "hello" };
      mockGet.mockResolvedValueOnce(JSON.stringify(stored));
      const result = await getExtractionResult("abc");
      expect(result).toEqual(stored);
    });

    it("returns null when key is missing", async () => {
      mockGet.mockResolvedValueOnce(null);
      expect(await getExtractionResult("abc")).toBeNull();
    });

    it("returns null when Redis throws", async () => {
      mockGet.mockRejectedValueOnce(new Error("Connection refused"));
      expect(await getExtractionResult("abc")).toBeNull();
    });

    it("returns null when Redis is not configured", async () => {
      process.env.KV_REST_API_URL = "";
      expect(await getExtractionResult("abc")).toBeNull();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("returns null when JSON.parse fails on invalid data", async () => {
      mockGet.mockResolvedValueOnce("not-valid-json{{{");
      expect(await getExtractionResult("abc")).toBeNull();
    });
  });
});
