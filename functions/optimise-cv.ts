import {
  cvs,
  educations,
  experiences,
  links,
  optimizations,
  pageSettings,
  skills,
} from "@/db/schema";
import { feedback } from "@/db/schema/feedback";
import { evaluateCV } from "@/lib/ai/evaluate-cv";
import { optimiseCV } from "@/lib/ai/optimise-cv";
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
import { users } from "@/db/schema";
import { logger } from "@/lib/logger";

const sqs = new SQSClient({ region: process.env.LAMBDA_AWS_REGION });

// Add this function to count words in a string
function countWords(str: string): number {
  return str.trim().split(/\s+/).length;
}

export const handler = Sentry.AWSLambda.wrapHandler(async (event: SQSEvent) => {
  try {
    logger.info({ event }, "Received event");

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

        logger.info({ optimizationId }, "Processing optimization request");

        const optimization = await db.query.optimizations.findFirst({
          where: eq(optimizations.id, optimizationId),
          with: {
            user: {
              with: {
                customisation: true,
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

        const {
          data: parsedCV,
          error,
          usage: optimizeUsage,
        } = await optimiseCV(
          optimization.submittedCVText,
          optimization.jobDescriptionText,
          optimization.additionalInfo ?? "",
          optimization.user.customisation
            ? JSON.stringify(optimization.user.customisation)
            : ""
        );

        if (error || !parsedCV) {
          logger.error(
            {
              error,
            },
            "Failed to optimise CV"
          );
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to optimise CV" }),
          };
        }

        const { role, company, ...forEvaluation } = parsedCV;

        // Evaluate the optimised CV
        const {
          data: evaluationResult,
          error: evaluationError,
          usage: evaluateUsage,
        } = await evaluateCV(
          optimization.submittedCVText,
          {
            ...forEvaluation,
            isPublic: false,
            experiences: forEvaluation.experiences.map((exp) => ({
              ...exp,
              endDate: exp.endDate ?? "",
            })),
            educations: forEvaluation.educations.map((edu) => ({
              ...edu,
              endDate: edu.endDate ?? "",
            })),
          },
          optimization.jobDescriptionText,
          optimization.additionalInfo ?? ""
        );

        if (evaluationError || !evaluationResult) {
          logger.error(
            {
              error: evaluationError,
            },
            "Failed to evaluate CV"
          );
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to evaluate CV" }),
          };
        }

        // Log optimization token usage and word count
        logger.info({
          message: "MONITORING",
          metric: "OptimizationTokenUsage",
          promptTokens: optimizeUsage.prompt_tokens,
          completionTokens: optimizeUsage.completion_tokens,
          totalTokens: optimizeUsage.total_tokens,
          wordCount: countWords(JSON.stringify(parsedCV)),
        });

        // Log evaluation token usage and word count
        logger.info({
          message: "MONITORING",
          metric: "EvaluationTokenUsage",
          promptTokens: evaluateUsage.prompt_tokens,
          completionTokens: evaluateUsage.completion_tokens,
          totalTokens: evaluateUsage.total_tokens,
          wordCount: countWords(JSON.stringify(forEvaluation)),
        });

        // Use the improved CV if available, otherwise use the original optimised CV
        const finalCV = evaluationResult.improvedCV || parsedCV;

        // Save the optimised CV to the database
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

          logger.info("Inserting CV");
          const [insertedCV] = await tx
            .insert(cvs)
            .values({
              name: finalCV.name ?? "",
              email: finalCV.email ?? "",
              title: finalCV.title ?? "",
              phone: finalCV.phone ?? "",
              location: finalCV.location ?? "",
              summary: finalCV.summary ?? "",
              isPublic: finalCV.isPublic ?? false,
              optimizationId: optimizationId,
              pageSettingsId: insertedPageSettings.id,
            })
            .returning();

          const newCVId = insertedCV.id;

          if (!finalCV) {
            logger.info("No CV to insert");
            throw new Error("No CV to insert");
          }

          // Save related data
          if (finalCV.experiences && finalCV.experiences.length > 0) {
            logger.info("Inserting experiences");
            await tx
              .insert(experiences)
              .values(
                finalCV.experiences.map((exp) => ({ ...exp, cvId: newCVId }))
              );
          }
          if (finalCV.educations && finalCV.educations.length > 0) {
            logger.info("Inserting educations");
            await tx
              .insert(educations)
              .values(
                finalCV.educations.map((edu) => ({ ...edu, cvId: newCVId }))
              );
          }
          if (finalCV.skills && finalCV.skills.length > 0) {
            logger.info("Inserting skills");
            await tx
              .insert(skills)
              .values(
                finalCV.skills.map((skill) => ({ ...skill, cvId: newCVId }))
              );
          }
          if (finalCV.links && finalCV.links.length > 0) {
            logger.info("Inserting links");
            await tx
              .insert(links)
              .values(
                finalCV.links.map((link) => ({ ...link, cvId: newCVId }))
              );
          }
          if (finalCV.customSections && finalCV.customSections.length > 0) {
            logger.info(
              { customSections: finalCV.customSections },
              "Inserting custom sections"
            );
          }

          logger.info("Successfully inserted CV");

          const optimisationUpdates = {
            isCvComplete: true,
            score: Math.ceil(evaluationResult.score),
            candidate: parsedCV.name ?? "",
            company: company ?? "",
            role: role ?? "",
          };

          logger.info(
            {
              updates: optimisationUpdates,
            },
            "Updating optimization"
          );
          await tx
            .update(optimizations)
            .set(optimisationUpdates)
            .where(eq(optimizations.id, optimizationId));

          if (evaluationResult.feedback.length > 0) {
            logger.info("Inserting feedback");
            await tx.insert(feedback).values(
              evaluationResult.feedback.map((item) => ({
                optimizationId: optimizationId,
                content: item.content,
                completed: item.completed,
              }))
            );
          }

          logger.info("Updating user credits");
          // Deduct a credit from the user
          await tx
            .update(users)
            .set({
              credits: optimization.user?.credits
                ? optimization.user.credits - 1
                : 0,
            })
            .where(eq(users.id, optimization.user?.id ?? 0));

          return insertedCV;
        });

        // If the optimization is successful, delete the message from the queue
        await deleteMessage(record);

        logger.info({ optimizationId }, "Optimization completed successfully");
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Optimization request processed successfully",
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
            optimizationId,
          },
          "Error processing optimization request"
        );
        await handleError(record, error as Error, optimizationId);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "All records processed" }),
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : error,
      },
      "Error processing optimization request"
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
  optimizationId: number
): Promise<void> {
  const receiveCount = parseInt(record.attributes.ApproximateReceiveCount, 10);

  if (receiveCount < 3) {
    logger.warn({ optimizationId, receiveCount }, "Retrying optimization");
    // Explicitly return the message to the queue for retry
    const changeVisibilityCommand = new ChangeMessageVisibilityCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      ReceiptHandle: record.receiptHandle,
      VisibilityTimeout: 0, // This makes the message immediately visible again
    });
    await sqs.send(changeVisibilityCommand);
  } else {
    logger.error(
      { optimizationId, receiveCount },
      "Max retries reached, sending to DLQ"
    );

    // Update the optimization status in the database
    await db
      .update(optimizations)
      .set({ isCvComplete: true, cvError: true })
      .where(eq(optimizations.id, optimizationId));

    // Explicitly move the message to the DLQ
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

    // Delete the message from the original queue
    await deleteMessage(record);
  }
}
