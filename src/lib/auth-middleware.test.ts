import { vi } from "vitest";

// Mocks must be declared before imports
vi.mock("@clerk/nextjs/server", () => ({
  getAuth: vi.fn(),
  auth: vi.fn(),
}));

vi.mock("./auth", () => ({
  getUserFromClerkId: vi.fn(),
  invalidateUserCache: vi.fn(),
}));

vi.mock("~/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { auth, getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { getUserFromClerkId } from "./auth";
import { withAuth, withAuthAsync } from "./auth-middleware";

describe("auth-middleware", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = new NextRequest("http://localhost:3000/api/test");
  });

  describe("withAuth", () => {
    it("should return 429 when rate limit is exceeded", async () => {
      mockRequest.headers.set("X-RateLimit-Remaining", "0");

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const response = await wrappedHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded");
      expect(handler).not.toHaveBeenCalled();
    });

    it("should return 401 when clerkUserId is missing", async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: null } as any);

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const response = await wrappedHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(handler).not.toHaveBeenCalled();
    });

    it("should return 401 when clerkUserId is invalid format", async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: "invalid" } as any);

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const response = await wrappedHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(handler).not.toHaveBeenCalled();
    });

    it("should return 401 when clerkUserId is too short", async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: "user_123" } as any);

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const response = await wrappedHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(handler).not.toHaveBeenCalled();
    });

    it("should return 403 when user is not found in database", async () => {
      const validClerkUserId = "user_2abc123def456ghi789";
      vi.mocked(getAuth).mockReturnValue({ userId: validClerkUserId } as any);
      vi.mocked(getUserFromClerkId).mockResolvedValue({});

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const response = await wrappedHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Unauthorized");
      expect(getUserFromClerkId).toHaveBeenCalledWith(validClerkUserId, {
        useCache: true,
        ttl: 300,
      });
      expect(handler).not.toHaveBeenCalled();
    });

    it("should call handler with user context when authentication is successful", async () => {
      const validClerkUserId = "user_2abc123def456ghi789";
      const mockUserData = {
        id: 123,
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        minutes: 100,
        role: "user",
        stripeCustomerId: "cus_123",
      };

      vi.mocked(getAuth).mockReturnValue({ userId: validClerkUserId } as any);
      vi.mocked(getUserFromClerkId).mockResolvedValue(mockUserData);

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const wrappedHandler = withAuth(handler);

      const response = await wrappedHandler(mockRequest);

      expect(handler).toHaveBeenCalledWith(mockRequest, {
        user: mockUserData,
        clerkUserId: validClerkUserId,
      });
      expect(response.status).toBe(200);
    });

    it("should handle async params correctly", async () => {
      const validClerkUserId = "user_2abc123def456ghi789";
      const mockUserData = {
        id: 123,
        email: "test@example.com",
      };
      const mockParams = { id: "456" };

      vi.mocked(getAuth).mockReturnValue({ userId: validClerkUserId } as any);
      vi.mocked(getUserFromClerkId).mockResolvedValue(mockUserData);

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const wrappedHandler = withAuth(handler);

      const _response = await wrappedHandler(mockRequest, {
        params: Promise.resolve(mockParams),
      });

      expect(handler).toHaveBeenCalledWith(mockRequest, {
        user: mockUserData,
        clerkUserId: validClerkUserId,
        params: mockParams,
      });
    });
  });

  describe("Clerk user ID validation", () => {
    const testCases = [
      { id: "user_2abc123def456ghi789", valid: true },
      { id: "usr_2abc123def456ghi789", valid: true },
      { id: "user_123456789012345", valid: true },
      { id: "invalid_2abc123def456ghi789", valid: false },
      { id: "user_123", valid: false },
      { id: "user_", valid: false },
      { id: "", valid: false },
      { id: null, valid: false },
      { id: undefined, valid: false },
      { id: 123, valid: false },
      { id: {}, valid: false },
      { id: [], valid: false },
    ];

    for (const { id, valid } of testCases) {
      it(`should ${valid ? "accept" : "reject"} clerkUserId: ${JSON.stringify(id)}`, async () => {
        vi.mocked(getAuth).mockReturnValue({ userId: id } as any);

        if (valid) {
          vi.mocked(getUserFromClerkId).mockResolvedValue({ id: 123 });
        }

        const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
        const wrappedHandler = withAuth(handler);

        const response = await wrappedHandler(mockRequest);

        if (valid) {
          expect(handler).toHaveBeenCalled();
          expect(response.status).toBe(200);
        } else {
          expect(handler).not.toHaveBeenCalled();
          expect(response.status).toBe(401);
        }
      });
    }
  });

  describe("withAuthAsync", () => {
    it("should return 429 when rate limit is exceeded", async () => {
      mockRequest.headers.set("X-RateLimit-Remaining", "0");

      const handler = vi.fn();

      const response = await withAuthAsync(handler, mockRequest);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded");
      expect(handler).not.toHaveBeenCalled();
    });

    it("should return 401 when clerkUserId is missing", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const handler = vi.fn();

      const response = await withAuthAsync(handler, mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(handler).not.toHaveBeenCalled();
    });

    it("should return 403 when user is not found in database", async () => {
      const validClerkUserId = "user_2abc123def456ghi789";
      vi.mocked(auth).mockResolvedValue({ userId: validClerkUserId } as any);
      vi.mocked(getUserFromClerkId).mockResolvedValue({});

      const handler = vi.fn();

      const response = await withAuthAsync(handler, mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Unauthorized");
      expect(getUserFromClerkId).toHaveBeenCalledWith(validClerkUserId, {
        useCache: true,
        ttl: 300,
      });
      expect(handler).not.toHaveBeenCalled();
    });

    it("should call handler with user context when authentication is successful", async () => {
      const validClerkUserId = "user_2abc123def456ghi789";
      const mockUserData = {
        id: 123,
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        minutes: 100,
        role: "user",
        stripeCustomerId: "cus_123",
      };

      vi.mocked(auth).mockResolvedValue({ userId: validClerkUserId } as any);
      vi.mocked(getUserFromClerkId).mockResolvedValue(mockUserData);

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const response = await withAuthAsync(handler, mockRequest);

      expect(handler).toHaveBeenCalledWith(mockRequest, {
        user: mockUserData,
        clerkUserId: validClerkUserId,
      });
      expect(response.status).toBe(200);
    });

    it("should handle async params correctly", async () => {
      const validClerkUserId = "user_2abc123def456ghi789";
      const mockUserData = {
        id: 123,
        email: "test@example.com",
      };
      const mockParams = { id: "456" };

      vi.mocked(auth).mockResolvedValue({ userId: validClerkUserId } as any);
      vi.mocked(getUserFromClerkId).mockResolvedValue(mockUserData);

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const _response = await withAuthAsync(handler, mockRequest, {
        params: Promise.resolve(mockParams),
      });

      expect(handler).toHaveBeenCalledWith(mockRequest, {
        user: mockUserData,
        clerkUserId: validClerkUserId,
        params: mockParams,
      });
    });
  });

  describe("caching behavior", () => {
    it("should use cached user data when available", async () => {
      const validClerkUserId = "user_2abc123def456ghi789";
      const mockUserData = { id: 123, email: "test@example.com" };

      vi.mocked(getAuth).mockReturnValue({ userId: validClerkUserId } as any);
      vi.mocked(getUserFromClerkId).mockResolvedValue(mockUserData);

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const wrappedHandler = withAuth(handler);

      await wrappedHandler(mockRequest);
      await wrappedHandler(mockRequest);

      expect(getUserFromClerkId).toHaveBeenCalledTimes(2);
      expect(getUserFromClerkId).toHaveBeenCalledWith(validClerkUserId, {
        useCache: true,
        ttl: 300,
      });
    });
  });
});
