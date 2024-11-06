import { logger } from "@/lib/logger";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as Sentry from "@sentry/aws-serverless";
import chromium from "@sparticuz/chromium";
import { APIGatewayProxyEvent } from "aws-lambda";
import postcss from "postcss";
import puppeteer, { Browser } from "puppeteer-core";
import tailwindcss from "tailwindcss";
import { v4 as uuidv4 } from "uuid";
import { tailwindPreflightCss } from "../static/tailwind.css";
import config from "../tailwind.config";

const s3Client = new S3Client({ region: process.env.LAMBDA_AWS_REGION });

Sentry.init({
  dsn: "https://42eebd0e5ad4ed9e80f6d6d2b2978842@o4508119114514432.ingest.de.sentry.io/4508248033001552",
  // integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

async function compileTailwindFromHtml(htmlContent: string): Promise<string> {
  const css = `@tailwind base; @tailwind components; @tailwind utilities;

  ${tailwindPreflightCss}
  `;

  try {
    const result = await postcss([
      tailwindcss({
        ...config,
        content: [{ raw: htmlContent, extension: "html" }],
        corePlugins: { preflight: false },
      }),
    ]).process(css, { from: undefined });

    return result.css;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "compileTailwindFromHtml");
      scope.setExtra("error", error);
      scope.setExtra("message", error instanceof Error ? error.message : error);

      Sentry.captureException(error);
    });
    logger.error(
      { error: (error as Error).message },
      "Error during Tailwind CSS compilation"
    );
    return "";
  }
}

export const handler = Sentry.wrapHandler(
  async (event: APIGatewayProxyEvent) => {
    let browser: Browser | null = null;
    try {
      logger.info("Generating PDF");
      const { htmlContent, paperSize, margin } = JSON.parse(event.body ?? "{}");

      if (!htmlContent) {
        logger.error("HTML content is required");
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "HTML content is required" }),
        };
      }

      // Compile Tailwind CSS
      logger.info("Compiling Tailwind CSS");
      const css = await compileTailwindFromHtml(htmlContent);

      const htmlContentWithStyles = htmlContent.replace(
        "{{css_placeholder}}",
        css
      );

      logger.info("HTML content with styles");

      const MAX_RETRIES = 3;
      let retries = 0;

      while (retries < MAX_RETRIES) {
        try {
          logger.info("Launching browser");
          browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath("./bin"),
            headless: chromium.headless,
          });

          logger.info("Opening new page");

          const page = await browser.newPage();
          logger.info("Setting content");
          await page.setContent(htmlContentWithStyles, {
            waitUntil: "networkidle0",
          });

          logger.info(
            {
              margin: {
                top: `${margin}mm`,
                right: `${margin}mm`,
                bottom: `${margin}mm`,
                left: `${margin}mm`,
              },
              printBackground: true,
              format: paperSize,
            },
            "Generating PDF"
          );
          const pdfBuffer = await page.pdf({
            margin: {
              top: `${margin}mm`,
              right: `${margin}mm`,
              bottom: `${margin}mm`,
              left: `${margin}mm`,
            },
            printBackground: true,
            format: paperSize ?? "A4",
          });

          logger.info({ event: "generate-pdf" }, "PDF generated");

          // Save PDF to S3
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, "0");
          const day = String(currentDate.getDate()).padStart(2, "0");
          const pdfKey = `pdfs/${year}/${month}/${day}/${uuidv4()}.pdf`;
          s3Client.send(
            new PutObjectCommand({
              Bucket: process.env.LAMBDA_BUCKET_NAME,
              Key: pdfKey,
              Body: pdfBuffer,
              ContentType: "application/pdf",
            })
          );

          logger.info({ event: "generate-pdf" }, "PDF saved to S3");

          // Return S3 key of the saved PDF
          return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": "attachment; filename=generated.pdf",
            },
            body: Buffer.from(pdfBuffer).toString("base64"), // Convert to base64
            isBase64Encoded: true, // Indicate that it's Base64 encoded
          };
        } catch (error) {
          retries++;
          if (retries === MAX_RETRIES) throw error;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error generating PDF" }),
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
          error: (error as Error).message,
        },
        "Error generating PDF"
      );
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error generating PDF" }),
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
);
