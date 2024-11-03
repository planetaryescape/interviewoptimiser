import { interviews, reports, statistics } from "@/db/schema";
import {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  MessageAttributeValue,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/serverless";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { generateInterviewAnalysis } from "@/lib/ai/interview-analysis";
import { getUserFromId } from "@/lib/auth";
import { logger } from "@/lib/logger";

const sqs = new SQSClient({ region: process.env.LAMBDA_AWS_REGION });

export const handler = Sentry.AWSLambda.wrapHandler(async (event: SQSEvent) => {
  try {
    logger.info({ event }, "Received event");

    if (!event.Records?.length) {
      logger.error(
        { event },
        "Invalid event structure: Records is not an array"
      );
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid event structure" }),
      };
    }

    for (const record of event.Records) {
      let interviewId: number = 0;
      try {
        const { interviewId: id, reportId, userId } = JSON.parse(record.body);
        interviewId = id;

        const user = await getUserFromId(userId);
        logger.info({ interviewId }, "Processing interview report request");

        const interview = await db
          .select()
          .from(interviews)
          .where(eq(interviews.id, interviewId))
          .then(([interview]) => interview);

        const report = await db
          .select({
            transcript: reports.transcript,
          })
          .from(reports)
          .where(eq(reports.id, reportId))
          .then(([report]) => report);

        if (!interview) {
          logger.error({ interviewId }, "Interview not found");
          return {
            statusCode: 404,
            body: JSON.stringify({ error: "Interview not found" }),
          };
        }

        if (!report) {
          logger.error({ reportId }, "Report not found");
          return {
            statusCode: 404,
            body: JSON.stringify({ error: "Report not found" }),
          };
        }

        const generatedReport = await generateInterviewAnalysis(
          interview,
          report.transcript ?? "",
          user?.email
        );

        if (!generatedReport) {
          logger.error("No interview report returned");
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate report" }),
          };
        }

        await db.transaction(async (tx) => {
          await tx
            .update(reports)
            .set({
              interviewId,
              ...generatedReport,
              areasOfStrength: JSON.stringify(generatedReport.areasOfStrength),
              areasForImprovement: JSON.stringify(
                generatedReport.areasForImprovement
              ),
              actionableNextSteps: JSON.stringify(
                generatedReport.actionableNextSteps
              ),
              isCompleted: true,
            })
            .where(eq(reports.id, reportId));

          await tx
            .update(interviews)
            .set({
              candidate: generatedReport.candidateName,
              company: generatedReport.companyName,
              role: generatedReport.roleName,
              completed: true,
            })
            .where(eq(interviews.id, interviewId));

          await tx
            .update(statistics)
            .set({
              interviewsCount: sql`${statistics.interviewsCount} + 1`,
            })
            .where(eq(statistics.id, 1));
        });

        logger.info(
          { interviewId },
          "Successfully generated and saved interview report"
        );

        await deleteMessage(record);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Interview report generated successfully",
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
            interviewId,
          },
          "Error processing interview report request"
        );

        await handleError(record, error as Error, interviewId);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "All records processed" }),
    };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : error },
      "Error processing interview report request"
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
});

async function deleteMessage(record: SQSRecord): Promise<void> {
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL!,
    ReceiptHandle: record.receiptHandle,
  });
  await sqs.send(deleteCommand);
  logger.info("Message deleted from queue");
}

async function handleError(
  record: SQSRecord,
  error: Error,
  interviewId: number
): Promise<void> {
  const receiveCount = parseInt(record.attributes.ApproximateReceiveCount, 10);

  if (receiveCount < 3) {
    logger.warn({ interviewId, receiveCount }, "Retrying interview report");
    const changeVisibilityCommand = new ChangeMessageVisibilityCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      ReceiptHandle: record.receiptHandle,
      VisibilityTimeout: 0,
    });
    await sqs.send(changeVisibilityCommand);
  } else {
    logger.error(
      { interviewId, receiveCount },
      "Max retries reached, sending to DLQ"
    );

    await db
      .update(interviews)
      .set({ completed: true })
      .where(eq(interviews.id, interviewId));

    const transformedAttributes = Object.entries(
      record.messageAttributes
    ).reduce((acc, [key, value]) => {
      acc[key] = { DataType: value.dataType, StringValue: value.stringValue };
      return acc;
    }, {} as Record<string, MessageAttributeValue>);

    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: process.env.DLQ_URL!,
      MessageBody: record.body,
      MessageAttributes: transformedAttributes,
    });
    await sqs.send(sendMessageCommand);

    await deleteMessage(record);
  }
}
