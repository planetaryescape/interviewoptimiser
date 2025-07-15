import { withAuth } from "@/lib/auth-middleware";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import Case from "case";
import { NextResponse } from "next/server";
import { config } from "~/config";
import { logger } from "~/lib/logger";

export const maxDuration = 60;

const API_KEY = process.env.INTERVIEWOPTIMISER_API_KEY;

export const POST = withAuth(
  async (request, { user }) => {
    try {
      const userId = user.id;
      if (!userId) {
        logger.error("User not found");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      logger.info({ event: "generate-pdf" }, "Calling PDF generation Lambda");
      const { htmlContent, paperSize, margin } = await request.json();

      const response = await fetch(config.apiGatewayUrlGeneratePdf, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY || "",
        },
        body: JSON.stringify({
          htmlContent,
          paperSize,
          margin,
          userId,
          projectName: Case.kebab(config.projectName).toLowerCase(),
        }),
      });

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
  },
  { routeName: "POST /api/generate-pdf" }
);
