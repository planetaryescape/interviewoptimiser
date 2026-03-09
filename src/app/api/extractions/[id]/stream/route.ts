import { withAuth } from "@/lib/auth-middleware";
import { type NextRequest, NextResponse } from "next/server";
import { getExtractionResult } from "~/lib/extraction-store";
import { logger } from "~/lib/logger";

export const maxDuration = 300;

export const GET = withAuth<{ id: string }>(
  async (_request: NextRequest, { params }) => {
    const extractionId = params?.id;

    if (!extractionId) {
      return NextResponse.json({ error: "Missing extraction ID" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const maxPolls = 300; // 300 polls * 1s = 5min max
        let polls = 0;

        const poll = async () => {
          try {
            const result = await getExtractionResult(extractionId);

            if (result?.status === "completed" || result?.status === "error") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
              controller.close();
              return;
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ status: "pending" })}\n\n`)
            );

            polls++;
            if (polls >= maxPolls) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ status: "error", error: "Extraction timed out" })}\n\n`
                )
              );
              controller.close();
              return;
            }

            setTimeout(poll, 1000);
          } catch (error) {
            logger.error({ error, extractionId }, "Error polling extraction result");
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ status: "error", error: "Internal error" })}\n\n`
              )
            );
            controller.close();
          }
        };

        await poll();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  },
  { routeName: "GET /api/extractions/[id]/stream" }
);
