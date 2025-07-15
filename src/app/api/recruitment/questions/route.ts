import crypto from "node:crypto";
import { withAuth } from "@/lib/auth-middleware";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import type { InterviewType } from "~/db/schema/interviews";
import { interviewTypeEnum } from "~/db/schema/interviews";
import type { JobDescription } from "~/db/schema/jobDescriptions";
import { extractKeyQuestions } from "~/lib/ai/extract-key-questions";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "~/lib/openai";

const RequestBodySchema = z.object({
  jobDescriptionText: z.string().min(50, "Job description must be at least 50 characters long."),
  interviewType: z.enum(interviewTypeEnum.enumValues, {
    errorMap: () => ({ message: "Invalid interview type." }),
  }),
  duration: z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes.")
    .max(180, "Duration cannot exceed 180 minutes."),
});

export type GeneratedQuestion = {
  id: string;
  text: string;
  isGenerated: boolean;
  reasoning?: string;
};

export const POST = withAuth(
  async (request, { user }) => {
    let parsedBody: any;
    try {
      if (!user?.id || !user.email) {
        logger.warn(
          { userId: user.id },
          "User not found in database or email missing for POST /api/recruitment/questions"
        );
        return NextResponse.json(formatErrorEntity("User not found or email missing"), {
          status: 404,
        });
      }
      const { email: userEmail } = user;

      parsedBody = await request.json();
      const validationResult = RequestBodySchema.safeParse(parsedBody);

      if (!validationResult.success) {
        logger.warn("Invalid request body for /api/recruitment/questions", {
          errors: validationResult.error.flatten(),
          user: userEmail,
        });
        return NextResponse.json(
          formatErrorEntity({
            message: "Invalid request body",
            details: validationResult.error.flatten(),
          }),
          { status: 400 }
        );
      }

      const { jobDescriptionText, interviewType, duration } = validationResult.data;

      const model = getOpenAiClient(userEmail).chat(process.env.OPENAI_CHAT_MODEL || "gpt-4o");

      const jobDescriptionData: JobDescription = {
        id: 0,
        jobId: 0,
        company: null,
        role: null,
        requiredQualifications: [],
        requiredExperience: [],
        requiredSkills: [],
        preferredQualifications: [],
        preferredSkills: [],
        responsibilities: [jobDescriptionText],
        benefits: [],
        location: null,
        employmentType: null,
        seniority: null,
        industry: null,
        keyTechnologies: [],
        keywords: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      logger.info("Generating interview questions via AI", {
        interviewType,
        duration,
        user: userEmail,
      });

      const { data: keyQuestionsResult, usage } = await extractKeyQuestions({
        model,
        jobDescriptionData,
        interviewType: interviewType as InterviewType,
        duration,
        userEmail,
      });

      const questionTexts: string[] = keyQuestionsResult.keyQuestions;
      const mappedQuestions: GeneratedQuestion[] = questionTexts.map((questionText: string) => ({
        id: crypto.randomUUID(),
        text: questionText,
        isGenerated: true,
      }));

      logger.info("Successfully generated interview questions", {
        usage,
        questionCount: mappedQuestions.length,
        user: userEmail,
      });

      return NextResponse.json(formatEntity(mappedQuestions, "questions"), {
        status: 200,
      });
    } catch (error) {
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/recruitment/questions");
        scope.setExtra(
          "requestBody",
          parsedBody ? JSON.stringify(parsedBody) : "Request body not parsed or empty"
        );
        if (error instanceof Error) scope.setExtra("errorDetails", error);
        Sentry.captureException(error);
      });

      logger.error(
        {
          message: errorMessage,
          error,
        },
        "Error in POST /api/recruitment/questions"
      );

      return NextResponse.json(
        formatErrorEntity({
          message: "Failed to generate interview questions",
          detail: errorMessage,
        }),
        { status: 500 }
      );
    }
  },
  { routeName: "POST /api/recruitment/questions" }
);
