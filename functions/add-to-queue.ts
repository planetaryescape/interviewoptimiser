import { logger } from "@/lib/logger";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/serverless";
import { APIGatewayProxyEvent } from "aws-lambda";

const sqs = new SQSClient({ region: process.env.LAMBDA_AWS_REGION });

export const handler = Sentry.AWSLambda.wrapHandler(
  async (event: APIGatewayProxyEvent) => {
    try {
      logger.info({ event }, "Received request to add to queue");

      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing request body" }),
        };
      }

      const { optimizationId, queueType } = JSON.parse(event.body);

      if (!optimizationId || !queueType) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: "Missing optimizationId or queueType",
          }),
        };
      }

      let queueUrl: string;
      switch (queueType) {
        case "optimise-cv":
          logger.info("Adding to optimise-cv queue");
          queueUrl = process.env.OPTIMISE_CV_QUEUE_URL!;
          break;
        case "generate-cover-letter":
          logger.info("Adding to generate-cover-letter queue");
          queueUrl = process.env.GENERATE_COVER_LETTER_QUEUE_URL!;
          break;
        default:
          logger.error({ queueType }, "Invalid queueType");
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid queueType" }),
          };
      }

      const message = {
        optimizationId: optimizationId,
      };

      logger.info({ message, queueUrl }, "Sending message to queue");

      const sendMessageCommand = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
      });

      logger.info({ sendMessageCommand }, "Sending message to queue");

      await sqs.send(sendMessageCommand);

      logger.info(
        { optimizationId, queueType },
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
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error instanceof Error ? error.message : error,
        }),
      };
    }
  }
);
