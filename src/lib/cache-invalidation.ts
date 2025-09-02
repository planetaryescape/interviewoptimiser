import { logger } from "~/lib/logger";
import { CachePrefixes, CacheTags, cache } from "./cache";

export const cacheInvalidation = {
  async invalidateUser(userId: string) {
    try {
      await Promise.all([
        cache.delete(`user:${userId}`, CachePrefixes.USER),
        cache.invalidateByTag(`user:${userId}`),
        cache.invalidateByTag(CacheTags.USER_DATA),
      ]);
      logger.info({ userId }, "Invalidated user cache");
    } catch (error) {
      logger.error({ error, userId }, "Failed to invalidate user cache");
    }
  },

  async invalidateJob(jobId: string, userId?: string) {
    try {
      const promises = [
        cache.delete(`job:${jobId}`, CachePrefixes.JOB),
        cache.invalidateByTag(`job:${jobId}`),
      ];

      if (userId) {
        promises.push(
          cache.invalidatePattern(`jobs:${userId}`, CachePrefixes.JOB),
          cache.invalidateByTag(`user-jobs:${userId}`)
        );
      }

      await Promise.all(promises);
      logger.info({ jobId, userId }, "Invalidated job cache");
    } catch (error) {
      logger.error({ error, jobId, userId }, "Failed to invalidate job cache");
    }
  },

  async invalidateInterview(interviewId: string, jobId?: string, userId?: string) {
    try {
      const promises = [
        cache.delete(`interview:${interviewId}`, CachePrefixes.INTERVIEW),
        cache.invalidateByTag(`interview:${interviewId}`),
      ];

      if (jobId) {
        promises.push(
          cache.delete(`job:${jobId}`, CachePrefixes.JOB),
          cache.invalidateByTag(`job:${jobId}`)
        );
      }

      if (userId) {
        promises.push(
          cache.invalidatePattern(`interviews:${userId}`, CachePrefixes.INTERVIEW),
          cache.invalidateByTag(`user-interviews:${userId}`)
        );
      }

      await Promise.all(promises);
      logger.info({ interviewId, jobId, userId }, "Invalidated interview cache");
    } catch (error) {
      logger.error({ error, interviewId, jobId, userId }, "Failed to invalidate interview cache");
    }
  },

  async invalidateReport(reportId: string, interviewId?: string, userId?: string) {
    try {
      const promises = [
        cache.delete(`report:${reportId}`, CachePrefixes.REPORT),
        cache.invalidateByTag(`report:${reportId}`),
      ];

      if (interviewId) {
        promises.push(
          cache.delete(`interview:${interviewId}`, CachePrefixes.INTERVIEW),
          cache.invalidateByTag(`interview:${interviewId}`)
        );
      }

      if (userId) {
        promises.push(
          cache.invalidatePattern(`reports:${userId}`, CachePrefixes.REPORT),
          cache.invalidateByTag(`user-reports:${userId}`)
        );
      }

      await Promise.all(promises);
      logger.info({ reportId, interviewId, userId }, "Invalidated report cache");
    } catch (error) {
      logger.error({ error, reportId, interviewId, userId }, "Failed to invalidate report cache");
    }
  },

  async invalidateOrganization(organizationId: string) {
    try {
      await Promise.all([
        cache.delete(`org:${organizationId}`, CachePrefixes.ORGANIZATION),
        cache.invalidateByTag(`org:${organizationId}`),
        cache.invalidateByTag(CacheTags.ORG_DATA),
        cache.invalidatePattern(`org-members:${organizationId}`, CachePrefixes.ORGANIZATION),
      ]);
      logger.info({ organizationId }, "Invalidated organization cache");
    } catch (error) {
      logger.error({ error, organizationId }, "Failed to invalidate organization cache");
    }
  },

  async invalidateAll() {
    try {
      await cache.clear();
      logger.info("Cleared all cache");
    } catch (error) {
      logger.error({ error }, "Failed to clear all cache");
    }
  },
};
