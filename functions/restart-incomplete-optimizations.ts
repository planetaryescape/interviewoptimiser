import { db } from "@/db";
import { optimizations } from "@/db/schema";
import { logger } from "@/lib/logger";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/serverless";
import { and, eq, lt } from "drizzle-orm";

const sqs = new SQSClient({ region: process.env.LAMBDA_AWS_REGION });

export const handler = Sentry.AWSLambda.wrapHandler(async () => {
  try {
    logger.info("Checking for incomplete optimizations");

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const incompleteOptimizations = await db
      .select({ id: optimizations.id })
      .from(optimizations)
      .where(
        and(
          eq(optimizations.isCvComplete, false),
          lt(optimizations.createdAt, fiveMinutesAgo)
        )
      );

    logger.info(
      {
        message: "MONITORING",
        count: incompleteOptimizations.length,
        unit: "Count",
        metric: "MissedOptimizations",
        lambda: "RestartIncompleteOptimizations",
      },
      "Missed optimizations metric"
    );

    for (const optimization of incompleteOptimizations) {
      logger.info(
        {
          optimizationId: optimization.id,
        },
        "Restarting optimization"
      );

      const message = {
        optimizationId: optimization.id,
      };

      const sendMessageCommand = new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify(message),
      });

      try {
        await sqs.send(sendMessageCommand);
        logger.info(
          { optimizationId: optimization.id },
          "Sent optimization to SQS queue"
        );
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "restartIncompleteOptimizations");
          scope.setExtra("error", error);
          Sentry.captureException(error);
        });
        logger.error(
          { error, optimizationId: optimization.id },
          "Error sending message to SQS queue"
        );
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Restarted ${incompleteOptimizations.length} optimizations`,
      }),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "restartIncompleteOptimizations");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error({ error }, "Error restarting incomplete optimizations");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
});
