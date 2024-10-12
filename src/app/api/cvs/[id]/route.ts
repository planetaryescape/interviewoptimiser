import { db } from "@/db";
import {
  CustomSection,
  customSections,
  cvs,
  Education,
  educations,
  Experience,
  experiences,
  Link,
  links,
  pageSettings,
  Skill,
  skills,
} from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/serverless";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("GET request received at /api/cvs/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/cvs/[id]");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

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

    logger.info({ cvId: userCv?.id }, "Successfully retrieved CV");
    return NextResponse.json(formatEntity(userCv, "cv"), {
      status: 200,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/cvs/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/cvs/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("PUT request received at /api/cvs/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/cvs/[id]");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const cvId = idHandler.decode(params.id);
    const updatedCV = await request.json();

    const result = await db.transaction(async (tx) => {
      logger.info("Starting transaction");
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        id: _id,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        optimization: _updatedOptimization,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pageSettings: _updatedPageSettings,

        experiences: updatedExperiences,
        educations: updatedEducations,
        skills: updatedSkills,
        links: updatedLinks,
        customSections: updatedCustomSections,
        ...cvData
      } = updatedCV;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt: _c, updatedAt: _u, ...updateData } = cvData;

      // Update main CV data
      logger.info(
        {
          cvData: {
            ...updateData,
            summary: cvData.summary?.slice(0, 100),
          },
        },
        "Updating CV"
      );
      const [updatedCVResult] = await tx
        .update(cvs)
        .set({
          ...updateData,
        })
        .where(eq(cvs.id, cvId))
        .returning();

      // Update experiences
      logger.info("Updating experiences");
      if (updatedExperiences && updatedExperiences.length > 0) {
        await tx.delete(experiences).where(eq(experiences.cvId, cvId));
        await tx.insert(experiences).values(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          updatedCV.experiences.map(({ id: _, ...exp }: Experience) => ({
            ...exp,
            cvId,
          }))
        );
      }

      // Update educations
      logger.info("Updating educations");
      if (updatedEducations && updatedEducations.length > 0) {
        await tx.delete(educations).where(eq(educations.cvId, cvId));
        await tx.insert(educations).values(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          updatedCV.educations.map(({ id: _, ...edu }: Education) => ({
            ...edu,
            cvId,
          }))
        );
      }

      // Update skills
      logger.info("Updating skills");
      if (updatedSkills && updatedSkills.length > 0) {
        await tx.delete(skills).where(eq(skills.cvId, cvId));
        await tx.insert(skills).values(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          updatedCV.skills.map(({ id: _, ...skill }: Skill) => ({
            ...skill,
            cvId,
          }))
        );
      }

      // Update links
      logger.info("Updating links");
      if (updatedLinks && updatedLinks.length > 0) {
        await tx.delete(links).where(eq(links.cvId, cvId));
        await tx.insert(links).values(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          updatedCV.links.map(({ id: _, ...link }: Link) => ({
            ...link,
            cvId,
          }))
        );
      }

      // Update custom sections
      logger.info("Updating custom sections");
      if (updatedCustomSections && updatedCustomSections.length > 0) {
        await tx.delete(customSections).where(eq(customSections.cvId, cvId));
        await tx.insert(customSections).values(
          updatedCustomSections.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ id: _, ...section }: CustomSection) => ({
              ...section,
              cvId,
            })
          )
        );
      }

      return updatedCVResult;
    });

    logger.info({ cvId: result.id }, "Successfully updated CV");
    return NextResponse.json(formatEntity(result, "cv"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "PUT /api/cvs/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in PUT /api/cvs/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
