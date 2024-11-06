import BackupFailedEmail from "@/emails/backup-failed";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as Sentry from "@sentry/aws-serverless";
import { spawn } from "child_process";
import { format } from "date-fns";
import fs from "fs";
import path from "path";
import { Transform } from "stream";

const s3Client = new S3Client({ region: process.env.LAMBDA_AWS_REGION });

Sentry.init({
  dsn: "https://ac1da005fbc6900ac345791d50395035@o4508119114514432.ingest.de.sentry.io/4508248026972240",
  // integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

function spawnPgDump(
  pgDumpDir: string,
  args: string[],
  env: NodeJS.ProcessEnv
) {
  const pgDumpPath = path.join(pgDumpDir, "pg_dump");
  if (!fs.existsSync(pgDumpPath)) {
    throw new Error("pg_dump not found at " + pgDumpPath);
  }

  return spawn(pgDumpPath, args, { env });
}

function buildArgs(plain: boolean = false) {
  return plain ? ["--no-owner", "--no-acl"] : ["-Fc", "-Z1"];
}

async function performBackup(plain = false) {
  // Parse DATABASE_URL to get components
  const dbUrl = new URL(process.env.DATABASE_URL!);

  // Set file name
  const timestamp = format(new Date(), "yyyy-MM-dd-HH-mm-ss");
  const fileFormat = plain ? ".sql" : ".backup";
  const fileName = `${dbUrl.pathname.slice(1)}-${timestamp}${fileFormat}`;

  return new Promise<{ fileName: string; stream: Transform; stderr: string }>(
    (resolve, reject) => {
      let headerChecked = false;
      let stderr = "";

      // Get path to pg_dump binary and bin directory
      const binPath = path.join(process.env.LAMBDA_TASK_ROOT!, "bin");

      // Spawn pg_dump process
      const args = buildArgs(plain);
      const env = {
        NODE_ENV: process.env.NODE_ENV,
        LD_LIBRARY_PATH: binPath,
        PGDATABASE: dbUrl.pathname.slice(1),
        PGUSER: dbUrl.username,
        PGPASSWORD: decodeURIComponent(dbUrl.password),
        PGHOST: dbUrl.hostname,
        PGPORT: dbUrl.port,
      };

      const pgDumpProcess = spawnPgDump(binPath, args, env);

      // Collect error output
      pgDumpProcess.stderr.on("data", (data) => {
        stderr += data.toString("utf8");
      });

      pgDumpProcess.on("error", (err) => {
        reject(new Error(`Failed to start pg_dump: ${err.message}`));
      });

      pgDumpProcess.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error(`pg_dump process failed: ${stderr}`));
        }
        if (!headerChecked && !plain) {
          return reject(new Error("pg_dump gave us an unexpected response"));
        }
        return null;
      });

      // Create transform stream to verify backup content
      const transformer = new Transform({
        transform(chunk, enc, callback) {
          this.push(chunk);
          if (!headerChecked) {
            headerChecked = true;
            const content = chunk.toString("utf8");
            if (plain || content.startsWith("PGDMP")) {
              resolve({ fileName, stream: transformer, stderr });
            } else {
              reject(new Error("pg_dump gave us an unexpected response"));
            }
          }
          callback();
        },
      });

      // Pipe pg_dump to transformer
      pgDumpProcess.stdout.pipe(transformer);
    }
  );
}

export const handler = Sentry.wrapHandler(async () => {
  try {
    logger.info("Starting database backup process");

    const { fileName, stream, stderr } = await performBackup(true);

    if (stderr) {
      logger.warn({ stderr }, "Warnings during pg_dump");
    }

    // Create an array to store chunks
    const chunks: Buffer[] = [];

    // Collect chunks from the stream
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    // Concatenate all chunks
    const fileContent = Buffer.concat(chunks);

    // Upload to S3
    const backupKey = `backups/database/${format(new Date(), "yyyy")}/${format(
      new Date(),
      "MM"
    )}/${fileName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.LAMBDA_BUCKET_NAME,
        Key: backupKey,
        Body: fileContent,
        ContentType: "application/sql",
      })
    );

    logger.info(
      { backupKey, size: fileContent.length },
      "Database backup completed successfully"
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Database backup completed successfully",
        backupKey,
        size: fileContent.length,
      }),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "backup-database");
      scope.setExtra("error", error);
      scope.setExtra("message", error instanceof Error ? error.message : error);
      Sentry.captureException(error);
    });

    logger.error(
      { error: error instanceof Error ? error.message : error },
      "Error during database backup"
    );

    // Send email notification about the failure
    try {
      await resend.emails.send({
        from: `${config.projectName} <notifications@${config.domain}>`,
        to: config.supportEmail,
        subject: "Database Backup Failed",
        react: BackupFailedEmail({
          error: error instanceof Error ? error.message : String(error),
          timestamp: format(new Date(), "PPpp"),
        }),
      });

      logger.info("Backup failure notification email sent");
    } catch (emailError) {
      logger.error(
        { error: emailError },
        "Failed to send backup failure notification email"
      );
    }

    throw error;
  }
});
