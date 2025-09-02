import crypto from "node:crypto";
import { kv } from "@vercel/kv";
import { logger } from "~/lib/logger";

export interface CacheConfig {
  ttl?: number;
  prefix?: string;
  tags?: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  writes: number;
  deletes: number;
}

const DEFAULT_TTL = 300;
const CACHE_PREFIX = "cache";
const STATS_PREFIX = "cache:stats";

class CacheManager {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
    if (!this.isEnabled) {
      logger.warn("Cache disabled: KV_REST_API_URL and KV_REST_API_TOKEN not configured");
    }
  }

  private generateKey(key: string, prefix?: string): string {
    const fullPrefix = prefix ? `${CACHE_PREFIX}:${prefix}` : CACHE_PREFIX;
    return `${fullPrefix}:${key}`;
  }

  private generateTagKey(tag: string): string {
    return `${CACHE_PREFIX}:tag:${tag}`;
  }

  private hashKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex").substring(0, 16);
  }

  async get<T>(key: string, config?: CacheConfig): Promise<T | null> {
    if (!this.isEnabled) return null;

    try {
      const cacheKey = this.generateKey(key, config?.prefix);
      const startTime = Date.now();

      const cached = await kv.get<T>(cacheKey);

      const elapsed = Date.now() - startTime;

      if (cached !== null) {
        await this.incrementStat("hits");
        logger.debug({ key: cacheKey, elapsed }, "Cache hit");
        return cached;
      }

      await this.incrementStat("misses");
      logger.debug({ key: cacheKey, elapsed }, "Cache miss");
      return null;
    } catch (error) {
      logger.error({ error, key }, "Cache get error");
      return null;
    }
  }

  async set<T>(key: string, value: T, config?: CacheConfig): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const cacheKey = this.generateKey(key, config?.prefix);
      const ttl = config?.ttl ?? DEFAULT_TTL;
      const startTime = Date.now();

      await kv.set(cacheKey, value, { ex: ttl });

      if (config?.tags && config.tags.length > 0) {
        for (const tag of config.tags) {
          const tagKey = this.generateTagKey(tag);
          await kv.sadd(tagKey, cacheKey);
          await kv.expire(tagKey, ttl);
        }
      }

      const elapsed = Date.now() - startTime;
      await this.incrementStat("writes");
      logger.debug({ key: cacheKey, ttl, elapsed }, "Cache set");
    } catch (error) {
      logger.error({ error, key }, "Cache set error");
    }
  }

  async delete(key: string, prefix?: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const cacheKey = this.generateKey(key, prefix);
      await kv.del(cacheKey);
      await this.incrementStat("deletes");
      logger.debug({ key: cacheKey }, "Cache delete");
    } catch (error) {
      logger.error({ error, key }, "Cache delete error");
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const tagKey = this.generateTagKey(tag);
      const keys = await kv.smembers(tagKey);

      if (keys && keys.length > 0) {
        await kv.del(...keys);
        await kv.del(tagKey);
        logger.info({ tag, count: keys.length }, "Invalidated cache by tag");
      }
    } catch (error) {
      logger.error({ error, tag }, "Cache invalidate by tag error");
    }
  }

  async invalidatePattern(pattern: string, prefix?: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const fullPrefix = prefix ? `${CACHE_PREFIX}:${prefix}` : CACHE_PREFIX;
      const searchPattern = `${fullPrefix}:${pattern}*`;

      const keys = await kv.keys(searchPattern);
      if (keys && keys.length > 0) {
        await kv.del(...keys);
        logger.info({ pattern, count: keys.length }, "Invalidated cache by pattern");
      }
    } catch (error) {
      logger.error({ error, pattern }, "Cache invalidate by pattern error");
    }
  }

  async wrap<T>(key: string, fn: () => Promise<T>, config?: CacheConfig): Promise<T> {
    const cached = await this.get<T>(key, config);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, config);
    return result;
  }

  async memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    config?: CacheConfig & { keyGenerator?: (...args: Parameters<T>) => string }
  ): Promise<T> {
    return (async (...args: Parameters<T>) => {
      const key = config?.keyGenerator
        ? config.keyGenerator(...args)
        : this.hashKey(JSON.stringify(args));

      return this.wrap(key, () => fn(...args), config);
    }) as T;
  }

  private async incrementStat(stat: keyof CacheStats): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const key = `${STATS_PREFIX}:${stat}`;
      await kv.incr(key);
    } catch (error) {
      logger.debug({ error, stat }, "Failed to increment cache stat");
    }
  }

  async getStats(): Promise<CacheStats | null> {
    if (!this.isEnabled) return null;

    try {
      const [hits, misses, writes, deletes] = await Promise.all([
        kv.get<number>(`${STATS_PREFIX}:hits`),
        kv.get<number>(`${STATS_PREFIX}:misses`),
        kv.get<number>(`${STATS_PREFIX}:writes`),
        kv.get<number>(`${STATS_PREFIX}:deletes`),
      ]).then(([h, m, w, d]) => [h ?? 0, m ?? 0, w ?? 0, d ?? 0]);

      return { hits, misses, writes, deletes };
    } catch (error) {
      logger.error({ error }, "Failed to get cache stats");
      return null;
    }
  }

  async clear(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const keys = await kv.keys(`${CACHE_PREFIX}:*`);
      if (keys && keys.length > 0) {
        await kv.del(...keys);
        logger.info({ count: keys.length }, "Cleared all cache");
      }
    } catch (error) {
      logger.error({ error }, "Cache clear error");
    }
  }
}

export const cache = new CacheManager();

export const CacheDurations = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 900,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
} as const;

export const CachePrefixes = {
  USER: "user",
  JOB: "job",
  INTERVIEW: "interview",
  REPORT: "report",
  ORGANIZATION: "org",
  PUBLIC: "public",
  LOOKUP: "lookup",
  DASHBOARD: "dashboard",
} as const;

export const CacheTags = {
  USER_DATA: "user-data",
  JOB_DATA: "job-data",
  INTERVIEW_DATA: "interview-data",
  REPORT_DATA: "report-data",
  ORG_DATA: "org-data",
  PUBLIC_DATA: "public-data",
} as const;
