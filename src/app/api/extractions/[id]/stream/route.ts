import { withAuth } from "@/lib/auth-middleware";
import { type NextRequest, NextResponse } from "next/server";
import { getExtractionResult } from "~/lib/extraction-store";
import { logger } from "~/lib/logger";

export const maxDuration = 300;

// Leave 10s buffer so polling stops before Vercel kills the function
const maxPolls = maxDuration - 10;

export const GET = withAuth<{ id: string }>(
  async (_request: NextRequest, { params }) => {
    const extractionId = params?.id;

    if (!extractionId) {
      return NextResponse.json({ error: "Missing extraction ID" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    let cancelled = false;

    const stream = new ReadableStream({
      async start(controller) {
        let polls = 0;

        const poll = async () => {
          if (cancelled) return;

          try {
            const result = await getExtractionResult(extractionId);

            if (result?.status === "completed" || result?.status === "error") {
              if (!cancelled) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
                controller.close();
              }
              return;
            }

            if (!cancelled) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ status: "pending" })}\n\n`)
              );
            }

            polls++;
            if (polls >= maxPolls) {
              if (!cancelled) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ status: "error", error: "Extraction timed out" })}\n\n`
                  )
                );
                controller.close();
              }
              return;
            }

            setTimeout(poll, 1000);
          } catch (error) {
            logger.error({ error, extractionId }, "Error polling extraction result");
            if (!cancelled) {
              try {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ status: "error", error: "Internal error" })}\n\n`
                  )
                );
                controller.close();
              } catch {
                // Stream already closed by client disconnect
              }
            }
          }
        };

        await poll();
      },
      cancel() {
        cancelled = true;
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
