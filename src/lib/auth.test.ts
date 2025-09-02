import { vi } from "vitest";

// Mock Vercel KV
vi.mock("@vercel/kv", () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

// Mock database
vi.mock("~/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}));

vi.mock("~/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import { kv } from "@vercel/kv";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "~/db";
import { logger } from "~/lib/logger";
import { type UserData, getUserFromClerkId, invalidateUserCache } from "./auth";

describe("auth functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    vi.stubEnv("KV_REST_API_URL", "https://test.kv.vercel-storage.com");
    vi.stubEnv("KV_REST_API_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getUserFromClerkId", () => {
    const mockClerkUserId = "user_test123456789";
    const mockUserData: UserData = {
      id: 123,
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      minutes: 100,
      role: "user",
      stripeCustomerId: "cus_test",
    };

    it("should return empty object when clerkUserId is not provided", async () => {
      const result = await getUserFromClerkId("");
      expect(result).toEqual({});
    });

    it("should return cached user data when available", async () => {
      vi.mocked(kv.get).mockResolvedValue(mockUserData);

      const result = await getUserFromClerkId(mockClerkUserId);

      expect(kv.get).toHaveBeenCalledWith(`user:${mockClerkUserId}`);
      expect(result).toEqual(mockUserData);
      expect(logger.debug).toHaveBeenCalledWith(
        { clerkUserId: mockClerkUserId },
        "User data retrieved from cache"
      );
      expect(db.select).not.toHaveBeenCalled();
    });

    it("should fetch from database when cache misses", async () => {
      vi.mocked(kv.get).mockResolvedValue(null);
      const mockDbResult = [
        {
          id: mockUserData.id,
          minutes: mockUserData.minutes,
          role: mockUserData.role,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          stripeCustomerId: mockUserData.stripeCustomerId,
        },
      ];

      const mockDbQuery = {
        limit: vi.fn(() => Promise.resolve(mockDbResult)),
      };
      const mockWhere = {
        where: vi.fn(() => mockDbQuery),
      };
      const mockFrom = {
        from: vi.fn(() => mockWhere),
      };
      vi.mocked(db.select).mockReturnValue(mockFrom as any);

      const result = await getUserFromClerkId(mockClerkUserId);

      expect(kv.get).toHaveBeenCalledWith(`user:${mockClerkUserId}`);
      expect(db.select).toHaveBeenCalled();
      expect(kv.set).toHaveBeenCalledWith(`user:${mockClerkUserId}`, mockUserData, { ex: 300 });
      expect(result).toEqual(mockUserData);
    });

    it("should not cache when useCache is false", async () => {
      const mockDbResult = [
        {
          id: mockUserData.id,
          minutes: mockUserData.minutes,
          role: mockUserData.role,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          stripeCustomerId: mockUserData.stripeCustomerId,
        },
      ];

      const mockDbQuery = {
        limit: vi.fn(() => Promise.resolve(mockDbResult)),
      };
      const mockWhere = {
        where: vi.fn(() => mockDbQuery),
      };
      const mockFrom = {
        from: vi.fn(() => mockWhere),
      };
      vi.mocked(db.select).mockReturnValue(mockFrom as any);

      const result = await getUserFromClerkId(mockClerkUserId, { useCache: false });

      expect(kv.get).not.toHaveBeenCalled();
      expect(kv.set).not.toHaveBeenCalled();
      expect(result).toEqual(mockUserData);
    });

    it("should handle cache retrieval errors gracefully", async () => {
      vi.mocked(kv.get).mockRejectedValue(new Error("Cache error"));
      const mockDbResult = [
        {
          id: mockUserData.id,
          minutes: mockUserData.minutes,
          role: mockUserData.role,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          stripeCustomerId: mockUserData.stripeCustomerId,
        },
      ];

      const mockDbQuery = {
        limit: vi.fn(() => Promise.resolve(mockDbResult)),
      };
      const mockWhere = {
        where: vi.fn(() => mockDbQuery),
      };
      const mockFrom = {
        from: vi.fn(() => mockWhere),
      };
      vi.mocked(db.select).mockReturnValue(mockFrom as any);

      const result = await getUserFromClerkId(mockClerkUserId);

      expect(logger.warn).toHaveBeenCalledWith(
        { error: expect.any(Error), clerkUserId: mockClerkUserId },
        "Cache retrieval failed, falling back to database"
      );
      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockUserData);
    });

    it("should handle cache set errors gracefully", async () => {
      vi.mocked(kv.get).mockResolvedValue(null);
      vi.mocked(kv.set).mockRejectedValue(new Error("Cache set error"));
      const mockDbResult = [
        {
          id: mockUserData.id,
          minutes: mockUserData.minutes,
          role: mockUserData.role,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          stripeCustomerId: mockUserData.stripeCustomerId,
        },
      ];

      const mockDbQuery = {
        limit: vi.fn(() => Promise.resolve(mockDbResult)),
      };
      const mockWhere = {
        where: vi.fn(() => mockDbQuery),
      };
      const mockFrom = {
        from: vi.fn(() => mockWhere),
      };
      vi.mocked(db.select).mockReturnValue(mockFrom as any);

      const result = await getUserFromClerkId(mockClerkUserId);

      expect(logger.warn).toHaveBeenCalledWith(
        { error: expect.any(Error), clerkUserId: mockClerkUserId },
        "Failed to cache user data"
      );
      expect(result).toEqual(mockUserData);
    });

    it("should return empty object when user not found in database", async () => {
      vi.mocked(kv.get).mockResolvedValue(null);
      const mockDbQuery = {
        limit: vi.fn(() => Promise.resolve([])),
      };
      const mockWhere = {
        where: vi.fn(() => mockDbQuery),
      };
      const mockFrom = {
        from: vi.fn(() => mockWhere),
      };
      vi.mocked(db.select).mockReturnValue(mockFrom as any);

      const result = await getUserFromClerkId(mockClerkUserId);

      expect(result).toEqual({});
      expect(kv.set).not.toHaveBeenCalled();
    });

    it("should use custom TTL when provided", async () => {
      vi.mocked(kv.get).mockResolvedValue(null);
      vi.mocked(kv.set).mockResolvedValue(undefined);
      const mockDbResult = [
        {
          id: mockUserData.id,
          minutes: mockUserData.minutes,
          role: mockUserData.role,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          stripeCustomerId: mockUserData.stripeCustomerId,
        },
      ];

      const mockDbQuery = {
        limit: vi.fn(() => Promise.resolve(mockDbResult)),
      };
      const mockWhere = {
        where: vi.fn(() => mockDbQuery),
      };
      const mockFrom = {
        from: vi.fn(() => mockWhere),
      };
      vi.mocked(db.select).mockReturnValue(mockFrom as any);

      await getUserFromClerkId(mockClerkUserId, { useCache: true, ttl: 600 });

      expect(kv.set).toHaveBeenCalledWith(`user:${mockClerkUserId}`, mockUserData, { ex: 600 });
      expect(logger.debug).toHaveBeenCalledWith(
        { clerkUserId: mockClerkUserId, ttl: 600 },
        "User data cached"
      );
    });

    it("should not use cache when environment variables are missing", async () => {
      vi.unstubAllEnvs();
      const mockDbResult = [
        {
          id: mockUserData.id,
          minutes: mockUserData.minutes,
          role: mockUserData.role,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          stripeCustomerId: mockUserData.stripeCustomerId,
        },
      ];

      const mockDbQuery = {
        limit: vi.fn(() => Promise.resolve(mockDbResult)),
      };
      const mockWhere = {
        where: vi.fn(() => mockDbQuery),
      };
      const mockFrom = {
        from: vi.fn(() => mockWhere),
      };
      vi.mocked(db.select).mockReturnValue(mockFrom as any);

      const result = await getUserFromClerkId(mockClerkUserId);

      expect(kv.get).not.toHaveBeenCalled();
      expect(kv.set).not.toHaveBeenCalled();
      expect(result).toEqual(mockUserData);
    });

    it("should validate cached data before returning", async () => {
      // Test with invalid cached data (not an object)
      vi.mocked(kv.get).mockResolvedValue("invalid string");
      const mockDbResult = [
        {
          id: mockUserData.id,
          minutes: mockUserData.minutes,
          role: mockUserData.role,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          stripeCustomerId: mockUserData.stripeCustomerId,
        },
      ];

      const mockDbQuery = {
        limit: vi.fn(() => Promise.resolve(mockDbResult)),
      };
      const mockWhere = {
        where: vi.fn(() => mockDbQuery),
      };
      const mockFrom = {
        from: vi.fn(() => mockWhere),
      };
      vi.mocked(db.select).mockReturnValue(mockFrom as any);

      const result = await getUserFromClerkId(mockClerkUserId);

      expect(db.select).toHaveBeenCalled(); // Should fall back to DB
      expect(result).toEqual(mockUserData);
    });
  });

  describe("invalidateUserCache", () => {
    const mockClerkUserId = "user_test123456789";

    it("should delete cache key when cache is enabled", async () => {
      await invalidateUserCache(mockClerkUserId);

      expect(kv.del).toHaveBeenCalledWith(`user:${mockClerkUserId}`);
      expect(logger.debug).toHaveBeenCalledWith(
        { clerkUserId: mockClerkUserId },
        "User cache invalidated"
      );
    });

    it("should handle cache deletion errors gracefully", async () => {
      vi.mocked(kv.del).mockRejectedValue(new Error("Delete error"));

      await invalidateUserCache(mockClerkUserId);

      expect(logger.warn).toHaveBeenCalledWith(
        { error: expect.any(Error), clerkUserId: mockClerkUserId },
        "Failed to invalidate user cache"
      );
    });

    it("should not attempt deletion when cache is disabled", async () => {
      vi.unstubAllEnvs();

      await invalidateUserCache(mockClerkUserId);

      expect(kv.del).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
