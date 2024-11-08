import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.INTERVIEWOPTIMISER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      logger.error("Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.error("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logger.info({ event: "generate-pdf" }, "Calling PDF generation Lambda");
    const { htmlContent, paperSize, margin } = await req.json();

    const response = await fetch(
      "https://ex0jrlkyi3.execute-api.eu-west-2.amazonaws.com/prod/generate-pdf",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY || "",
        },
        body: JSON.stringify({ htmlContent, paperSize, margin, userId }),
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      logger.error({ errorResponse }, "Error generating PDF");
      throw new Error("Failed to generate PDF");
    }

    // Get the base64 encoded PDF string from Lambda response
    const base64Pdf = await response.text();

    // Convert base64 string back to binary format
    const pdfBuffer = Buffer.from(base64Pdf, "base64");

    // Return the binary PDF to the browser
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=generated.pdf",
      },
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/generate-pdf");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error generating PDF"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
