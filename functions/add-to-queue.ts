import { logger } from "@/lib/logger";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/aws-serverless";
import { APIGatewayProxyEvent } from "aws-lambda";

const sqs = new SQSClient({ region: process.env.LAMBDA_AWS_REGION });

Sentry.init({
  dsn: "https://41ab3356fbe3426d1b12f4e58a128415@o4508119114514432.ingest.de.sentry.io/4508248020615248",
  // integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

export const handler = Sentry.wrapHandler(
  async (event: APIGatewayProxyEvent) => {
    try {
      logger.info({ event }, "Received request to add to queue");

      if (!event.body) {
        throw new Error("Missing request body");
      }

      const { interviewId, queueType, userId, reportId } = JSON.parse(
        event.body
      );

      if (!interviewId) {
        logger.error({ event }, "Missing interviewId");
        throw new Error("Missing interviewId");
      }

      if (!queueType) {
        logger.error({ event }, "Missing queueType");
        throw new Error("Missing queueType");
      }

      if (!reportId) {
        logger.error({ event }, "Missing reportId");
        throw new Error("Missing reportId");
      }

      let queueUrl: string;
      switch (queueType) {
        case "generate-report":
          logger.info("Adding to generate-report queue");
          queueUrl = process.env.GENERATE_REPORT_QUEUE_URL!;
          break;
        default:
          logger.error({ queueType }, "Invalid queueType");
          throw new Error("Invalid queueType");
      }

      const message = {
        interviewId: interviewId,
        userId: userId,
        reportId: reportId,
      };

      logger.info({ message, queueUrl }, "Sending message to queue");

      const sendMessageCommand = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
      });

      logger.info({ sendMessageCommand }, "Sending message to queue");

      await sqs.send(sendMessageCommand);

      logger.info(
        { interviewId, queueType },
        "Message added to queue successfully"
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Message added to queue successfully",
        }),
      };
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "handler");
        scope.setExtra("error", error);
        scope.setExtra("event", event);
        scope.setExtra(
          "message",
          error instanceof Error ? error.message : error
        );

        Sentry.captureException(error);
      });
      logger.error(
        {
          error: error instanceof Error ? error.message : error,
        },
        "Error adding message to queue"
      );
      throw error;
    }
  }
);
