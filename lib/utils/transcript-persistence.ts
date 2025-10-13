/**
 * Transcript persistence utilities for localStorage backup
 * Ensures interview data is not lost due to network issues
 */

import { clientLogger } from "~/lib/pino-client-logger";

const logger = clientLogger.child({ component: "transcript-persistence" });
const STORAGE_PREFIX = "interview_transcript_";
const SYNCED_PREFIX = "interview_synced_";

interface TranscriptBackup {
  interviewId: string;
  userId?: string;
  transcript: any[];
  lastSaved: string;
  synced: boolean;
}

class TranscriptPersistence {
  /**
   * Save transcript to localStorage as backup
   */
  async saveToLocalStorage(
    interviewId: string,
    userId: string | undefined,
    messages: any[]
  ): Promise<void> {
    try {
      const backup: TranscriptBackup = {
        interviewId,
        userId,
        transcript: messages,
        lastSaved: new Date().toISOString(),
        synced: false,
      };

      localStorage.setItem(`${STORAGE_PREFIX}${interviewId}`, JSON.stringify(backup));
    } catch (error) {
      logger.error({ error, interviewId }, "Failed to save to localStorage");
      // Don't throw - localStorage failures shouldn't break the app
    }
  }

  /**
   * Load transcript from localStorage
   */
  async loadFromLocalStorage(interviewId: string): Promise<TranscriptBackup | null> {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${interviewId}`);
      if (!stored) return null;

      return JSON.parse(stored) as TranscriptBackup;
    } catch (error) {
      logger.error({ error, interviewId }, "Failed to load from localStorage");
      return null;
    }
  }

  /**
   * Mark transcript as successfully synced to server
   */
  async markAsSynced(interviewId: string): Promise<void> {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${interviewId}`);
      if (!stored) return;

      const backup = JSON.parse(stored) as TranscriptBackup;
      backup.synced = true;

      localStorage.setItem(`${STORAGE_PREFIX}${interviewId}`, JSON.stringify(backup));
      localStorage.setItem(`${SYNCED_PREFIX}${interviewId}`, new Date().toISOString());
    } catch (error) {
      logger.error({ error, interviewId }, "Failed to mark as synced");
    }
  }

  /**
   * Check if transcript has been synced
   */
  async isSynced(interviewId: string): Promise<boolean> {
    try {
      const syncTime = localStorage.getItem(`${SYNCED_PREFIX}${interviewId}`);
      return !!syncTime;
    } catch (error) {
      logger.error({ error, interviewId }, "Failed to check sync status");
      return false;
    }
  }

  /**
   * Clear transcript from localStorage after successful server save
   */
  async clearBackup(interviewId: string): Promise<void> {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${interviewId}`);
      localStorage.removeItem(`${SYNCED_PREFIX}${interviewId}`);
    } catch (error) {
      logger.error({ error, interviewId }, "Failed to clear backup");
    }
  }

  /**
   * Get all unsync'd interview IDs (for recovery)
   */
  async getUnsyncedInterviews(): Promise<string[]> {
    try {
      const keys = Object.keys(localStorage);
      const interviewKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));

      const unsynced: string[] = [];
      for (const key of interviewKeys) {
        const interviewId = key.replace(STORAGE_PREFIX, "");
        const synced = await this.isSynced(interviewId);
        if (!synced) {
          unsynced.push(interviewId);
        }
      }

      return unsynced;
    } catch (error) {
      logger.error({ error }, "Failed to get unsynced interviews");
      return [];
    }
  }
}

export const transcriptPersistence = new TranscriptPersistence();
