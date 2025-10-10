import { formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { logger } from "~/lib/logger";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(
  error: unknown,
  context: string,
  additionalContext?: Record<string, unknown>
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;
  const userMessage = isAppError ? error.message : "Internal server error";

  Sentry.withScope((scope) => {
    scope.setExtra("context", context);
    if (additionalContext) {
      for (const [key, value] of Object.entries(additionalContext)) {
        scope.setExtra(key, value);
      }
    }
    scope.setExtra("error", error);
    Sentry.captureException(error);
  });

  logger.error(
    {
      message: errorMessage,
      error,
      context,
      ...additionalContext,
    },
    `Error in ${context}`
  );

  return NextResponse.json(formatErrorEntity(userMessage), {
    status: statusCode,
  });
}

export function createApiHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  context: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  }) as T;
}
