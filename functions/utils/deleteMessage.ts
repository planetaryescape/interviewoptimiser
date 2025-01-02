import { logger } from "@/lib/logger";
import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { SQSRecord } from "aws-lambda";

export async function deleteMessage(
  sqsClient: SQSClient,
  record: SQSRecord
): Promise<void> {
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL!,
    ReceiptHandle: record.receiptHandle,
  });
  await sqsClient.send(deleteCommand);
  logger.info("Message deleted from queue");
}
