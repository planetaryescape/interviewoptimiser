import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/db";
import { users } from "~/db/schema";
import { logger } from "~/lib/logger";

const updateDefaultCvSchema = z.object({
  cvText: z.string().min(1, "CV text is required"),
  filename: z.string().max(255).optional(),
});

export const GET = withAuth(
  async (_request: NextRequest, { user }) => {
    try {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: {
          defaultCvText: true,
          defaultCvFilename: true,
        },
      });

      if (!dbUser?.defaultCvText) {
        return NextResponse.json(formatEntity(null, "cv"));
      }

      return NextResponse.json(
        formatEntity(
          {
            defaultCvText: dbUser.defaultCvText,
            defaultCvFilename: dbUser.defaultCvFilename,
          },
          "cv"
        )
      );
    } catch (error) {
      logger.error({ error }, "Error fetching default CV");
      return NextResponse.json(formatErrorEntity("Failed to fetch default CV"), { status: 500 });
    }
  },
  { routeName: "GET /api/users/default-cv" }
);

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { cvText, filename } = updateDefaultCvSchema.parse(body);

      await db
        .update(users)
        .set({
          defaultCvText: cvText,
          defaultCvFilename: filename ?? null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return NextResponse.json(
        formatEntity({ defaultCvText: cvText, defaultCvFilename: filename ?? null }, "cv")
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(formatErrorEntity(error.errors), { status: 400 });
      }
      logger.error({ error }, "Error saving default CV");
      return NextResponse.json(formatErrorEntity("Failed to save default CV"), { status: 500 });
    }
  },
  { routeName: "POST /api/users/default-cv" }
);

export const DELETE = withAuth(
  async (_request: NextRequest, { user }) => {
    try {
      await db
        .update(users)
        .set({
          defaultCvText: null,
          defaultCvFilename: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return NextResponse.json(formatEntity(null, "cv"));
    } catch (error) {
      logger.error({ error }, "Error deleting default CV");
      return NextResponse.json(formatErrorEntity("Failed to delete default CV"), { status: 500 });
    }
  },
  { routeName: "DELETE /api/users/default-cv" }
);
