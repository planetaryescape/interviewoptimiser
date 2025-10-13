import pino from "pino";

// Client-side logger for browser environments
// Uses console transport since we can't write to files in the browser
export const clientLogger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || "info",
  browser: {
    asObject: true,
    transmit: {
      send(_level, logEvent) {
        // In production, could send to external logging service
        if (process.env.NODE_ENV === "development") {
          // biome-ignore lint/suspicious/noConsole: Client logging requires console
          console.log(logEvent);
        }
      },
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
