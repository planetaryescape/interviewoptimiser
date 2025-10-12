import { withAuth } from "@/lib/auth-middleware";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import { encodeCustomisation } from "@/lib/utils/encodeHelpers";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { createInsertSchema } from "drizzle-zod";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { customisations } from "~/db/schema";
import { logger } from "~/lib/logger";

const updateCustomisationSchema = createInsertSchema(customisations).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const PUT = withAuth<{ id: string }>(
  async (request, { user, params }) => {
    try {
      // Decode hash ID to numeric
      const customisationId = idHandler.safeDecode(params!.id);
      if (customisationId === null) {
        return NextResponse.json(formatErrorEntity("Invalid customisation ID"), {
          status: 404,
        });
      }

      const body = await request.json();
      const validatedData = updateCustomisationSchema.parse(body);

      const data = {
        ...validatedData,
        customInstructions: sanitiseUserInputText(validatedData.customInstructions),
      };

      const [updatedCustomization] = await db
        .insert(customisations)
        .values({
          ...data,
          id: customisationId,
          userId: user.id,
        })
        .onConflictDoUpdate({
          target: [customisations.id],
          set: data,
        })
        .returning();

      if (!updatedCustomization) {
        logger.warn({ userId: user.id }, "Failed to update customisation");
        return NextResponse.json(formatErrorEntity("Failed to update customisation"), {
          status: 500,
        });
      }

      logger.info({ updatedCustomization }, "Successfully updated customisation");

      // Encode IDs before sending to client
      const encodedCustomisation = encodeCustomisation(updatedCustomization);
      return NextResponse.json(formatEntity(encodedCustomisation, "customisation"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "PUT /api/customisations/[id]");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in PUT /api/customisations/[id]"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "PUT /api/customisations/[id]" }
);
