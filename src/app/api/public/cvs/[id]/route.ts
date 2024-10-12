import { db } from "@/db";
import { cvs, pageSettings } from "@/db/schema";
import { logger } from "@/lib/logger";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/serverless";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("GET request received at /api/public/cvs/[id]");

  try {
    const cvId = idHandler.decode(params.id);
    let userCv = await db.query.cvs.findFirst({
      where: eq(cvs.id, cvId),
      with: {
        experiences: true,
        educations: true,
        skills: true,
        links: true,
        customSections: true,
        pageSettings: true,
        optimization: {
          with: {
            sectionsOrder: true,
          },
        },
      },
    });

    if (!userCv) {
      logger.warn({ cvId }, "CV not found");
      return NextResponse.json(formatErrorEntity("CV not found"), {
        status: 404,
      });
    }

    if (!userCv.isPublic) {
      logger.warn({ cvId }, "Attempted to access non-public CV");
      return NextResponse.json(formatErrorEntity("CV not found"), {
        status: 404,
      });
    }

    // Check if pageSettings exist, if not, create default ones
    if (!userCv.pageSettings) {
      logger.info({ cvId }, "Creating default page settings for CV");
      const [defaultPageSettings] = await db
        .insert(pageSettings)
        .values({
          paperSize: "A4",
          headingFont: "font-raleway",
          bodyFont: "font-roboto",
          marginSize: "Normal",
          layout: "Polished",
        })
        .returning();

      await db
        .update(cvs)
        .set({ pageSettingsId: defaultPageSettings.id })
        .where(eq(cvs.id, cvId));

      // Fetch the CV again with the new page settings
      userCv = await db.query.cvs.findFirst({
        where: eq(cvs.id, cvId),
        with: {
          experiences: true,
          educations: true,
          skills: true,
          links: true,
          customSections: true,
          pageSettings: true,
          optimization: {
            with: {
              sectionsOrder: true,
            },
          },
        },
      });
    }

    logger.info({ cvId: userCv?.id }, "Successfully retrieved public CV");
    return NextResponse.json(formatEntity(userCv, "cv"), {
      status: 200,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/public/cvs/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/public/cvs/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
