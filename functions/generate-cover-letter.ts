import { coverLetters, optimizations, pageSettings, users } from "@/db/schema";
import { generateCoverLetter } from "@/lib/ai/generate-cover-letter";
import {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  MessageAttributeValue,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/serverless";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { logger } from "@/lib/logger";

const sqs = new SQSClient({ region: process.env.LAMBDA_AWS_REGION });

export const handler = Sentry.AWSLambda.wrapHandler(async (event: SQSEvent) => {
  try {
    logger.info({ event }, "Function started");

    if (!event.Records || !Array.isArray(event.Records)) {
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
      let optimizationId: number = 0;
      try {
        const message = JSON.parse(record.body);
        optimizationId = message.optimizationId;

        logger.info(
          { optimizationId },
          "Processing cover letter generation request"
        );

        const optimization = await db.query.optimizations.findFirst({
          where: eq(optimizations.id, optimizationId),
          with: {
            user: true,
            cv: {
              with: {
                experiences: true,
                educations: true,
                customSections: true,
                skills: true,
                links: true,
              },
            },
          },
        });

        if (!optimization) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: "Optimization not found" }),
          };
        }

        if (!optimization.user || optimization.user.credits <= 0) {
          return {
            statusCode: 403,
            body: JSON.stringify({ error: "Not enough credits" }),
          };
        }

        if (!optimization.cv) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: "CV not found" }),
          };
        }

        const { data: generatedCoverLetter, error } = await generateCoverLetter(
          {
            ...optimization.cv,
            isPublic: false,
            experiences: optimization.cv.experiences.map((exp) => ({
              ...exp,
              endDate: exp.endDate ?? "",
            })),
            educations: optimization.cv.educations.map((edu) => ({
              ...edu,
              endDate: edu.endDate ?? "",
            })),
          },
          optimization.jobDescriptionText,
          optimization.additionalInfo ?? ""
        );

        if (error || !generatedCoverLetter) {
          logger.error(
            {
              error,
            },
            "Failed to generate cover letter"
          );
          throw new Error("Failed to generate cover letter");
        }

        await db.transaction(async (tx) => {
          logger.info("Creating default page settings");
          const [insertedPageSettings] = await tx
            .insert(pageSettings)
            .values({
              paperSize: "A4",
              headingFont: "font-raleway",
              bodyFont: "font-roboto",
              marginSize: "Normal",
              layout: "Polished",
            })
            .returning();

          logger.info("Inserting cover letter");
          const [insertedCoverLetter] = await tx
            .insert(coverLetters)
            .values({
              optimizationId: optimizationId,
              content: generatedCoverLetter.content,
              pageSettingsId: insertedPageSettings.id, // Use the ID of the newly created page settings
            })
            .returning();

          logger.info("Updating optimization");
          await tx
            .update(optimizations)
            .set({
              isCoverLetterComplete: true,
            })
            .where(eq(optimizations.id, optimizationId));

          logger.info("Updating user credits");
          await tx
            .update(users)
            .set({ credits: optimization.user.credits - 1 })
            .where(eq(users.id, optimization.user.id));

          return insertedCoverLetter;
        });

        // If the cover letter generation is successful, delete the message from the queue
        await deleteMessage(record);

        logger.info(
          { optimizationId },
          "Cover letter generation completed successfully"
        );
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Cover letter generation request processed successfully",
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
            logStream: process.env.LOG_STREAM_NAME,
          },
          "Error in function execution"
        );
        await handleError(record, error as Error, optimizationId);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "All records processed" }),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "handler");
      scope.setExtra("error", error);
      scope.setExtra("message", error instanceof Error ? error.message : error);

      Sentry.captureException(error);
    });
    logger.error(
      {
        error: error instanceof Error ? error.message : error,
      },
      "Error in function execution"
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
}

async function handleError(
  record: SQSRecord,
  error: Error,
  optimizationId: number
): Promise<void> {
  const receiveCount = parseInt(record.attributes.ApproximateReceiveCount, 10);

  if (receiveCount < 3) {
    logger.warn(
      { optimizationId, receiveCount },
      "Retrying cover letter generation"
    );
    const changeVisibilityCommand = new ChangeMessageVisibilityCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      ReceiptHandle: record.receiptHandle,
      VisibilityTimeout: 0,
    });
    await sqs.send(changeVisibilityCommand);
  } else {
    logger.error(
      { optimizationId, receiveCount },
      "Max retries reached, sending to DLQ"
    );

    await db
      .update(optimizations)
      .set({ isCoverLetterComplete: true, coverLetterError: true })
      .where(eq(optimizations.id, optimizationId));

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
