import {
  ChangeMessageVisibilityCommand,
  type MessageAttributeValue,
  type SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/aws-serverless";
import type { SQSRecord } from "aws-lambda";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import { deleteMessage } from "./deleteMessage";

export async function handleError({
  sqsClient,
  record,
  error,
  onFailure,
}: {
  sqsClient: SQSClient;
  record: SQSRecord;
  error: Error;
  onFailure?: () => Promise<void>;
}): Promise<void> {
  const context = { handler: "handle-error" };
  const receiveCount = Number.parseInt(record.attributes.ApproximateReceiveCount, 10);

  if (receiveCount < 3) {
    logger.warn({ ...context, receiveCount, recordId: record.messageId }, "Retrying failed record");

    const changeVisibilityCommand = new ChangeMessageVisibilityCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      ReceiptHandle: record.receiptHandle,
      VisibilityTimeout: 0,
    });
    await sqsClient.send(changeVisibilityCommand);
  } else {
    logger.error(
      { ...context, receiveCount, recordId: record.messageId },
      "Max retries reached, sending to DLQ"
    );

    await sendDiscordDM({
      title: "❌ Max Retries Exceeded",
      description: "Record failed processing and will be sent to DLQ",
      metadata: {
        "Record ID": record.messageId,
        Retries: receiveCount,
        Error: error.message,
        "Stack Trace": error.stack ?? "N/A",
        Timestamp: new Date().toISOString(),
      },
    });

    Sentry.withScope((scope) => {
      scope.setExtra("context", context);
      scope.setExtra("error", error);
      scope.setExtra("record", record);
      Sentry.captureException(error);
    });

    if (onFailure) {
      await onFailure();
    }

    const transformedAttributes = Object.entries(record.messageAttributes).reduce(
      (acc, [key, value]) => {
        acc[key] = { DataType: value.dataType, StringValue: value.stringValue };
        return acc;
      },
      {} as Record<string, MessageAttributeValue>
    );

    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: process.env.DLQ_URL!,
      MessageBody: record.body,
      MessageAttributes: transformedAttributes,
    });
    await sqsClient.send(sendMessageCommand);

    await deleteMessage(sqsClient, record);
  }
}
