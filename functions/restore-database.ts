import BackupFailedEmail from "@/emails/backup-failed";
import { config } from "@/lib/config";
import { sendDiscordDM } from "@/lib/discord";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import * as Sentry from "@sentry/aws-serverless";
import { spawn } from "child_process";
import { format, isValid, parseISO } from "date-fns";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { initSentry } from "./lib/sentry";

initSentry();

const s3Client = new S3Client({ region: process.env.LAMBDA_AWS_REGION });

async function getLatestBackupKey(): Promise<string> {
  const prefix = "backups/database/";

  const listCommand = new ListObjectsV2Command({
    Bucket: process.env.LAMBDA_BUCKET_NAME!,
    Prefix: prefix,
  });

  const response = await s3Client.send(listCommand);

  if (!response.Contents || response.Contents.length === 0) {
    throw new Error("No backups found");
  }

  // Sort backups by the timestamp in their names
  const sortedBackups = response.Contents.filter((obj) =>
    obj.Key?.endsWith(".sql")
  ) // Only consider SQL backups
    .sort((a, b) => {
      const getDateFromKey = (key: string = "") => {
        const match = key.match(/(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/);
        return match
          ? parseISO(`${match[1].replace(/-/g, "T")}Z`)
          : new Date(0);
      };

      const dateA = getDateFromKey(a.Key);
      const dateB = getDateFromKey(b.Key);

      return isValid(dateB) && isValid(dateA)
        ? dateB.getTime() - dateA.getTime()
        : 0;
    });

  if (!sortedBackups[0].Key) {
    throw new Error("No valid backup files found");
  }

  logger.info({ backupKey: sortedBackups[0].Key }, "Found latest backup");
  return sortedBackups[0].Key;
}

function spawnPgRestore(
  binDir: string,
  args: string[],
  env: NodeJS.ProcessEnv
) {
  const pgRestorePath = path.join(binDir, "pg_restore");
  if (!fs.existsSync(pgRestorePath)) {
    throw new Error("pg_restore not found at " + pgRestorePath);
  }

  return spawn(pgRestorePath, args, { env });
}

async function performRestore(backupKey: string, databaseUrl?: string) {
  // Use provided database URL or fall back to environment variable
  const dbUrl = new URL(databaseUrl || process.env.DATABASE_URL!);

  // Get path to pg_restore binary and bin directory
  const binPath = path.join(process.env.LAMBDA_TASK_ROOT!, "bin");

  // Download backup file from S3
  const getObjectResponse = await s3Client.send(
    new GetObjectCommand({
      Bucket: process.env.LAMBDA_BUCKET_NAME!,
      Key: backupKey,
    })
  );

  if (!getObjectResponse.Body) {
    throw new Error("Failed to get backup file from S3");
  }

  const backupStream = getObjectResponse.Body as Readable;

  return new Promise<string>((resolve, reject) => {
    let stderr = "";

    // Set up pg_restore environment
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      LD_LIBRARY_PATH: binPath,
      PGDATABASE: dbUrl.pathname.slice(1),
      PGUSER: dbUrl.username,
      PGPASSWORD: decodeURIComponent(dbUrl.password),
      PGHOST: dbUrl.hostname,
      PGPORT: dbUrl.port,
    };

    // Spawn pg_restore process with additional options
    const pgRestoreArgs = [
      "--clean", // Clean (drop) database objects before recreating
      "--if-exists", // Add IF EXISTS to drop commands
      "--no-owner", // Skip restoration of object ownership
      "--no-privileges", // Skip restoration of access privileges (grant/revoke)
      "--no-comments", // Do not restore comments
      "--verbose", // Verbose mode
    ];

    const pgRestoreProcess = spawnPgRestore(binPath, pgRestoreArgs, env);

    // Collect error output
    pgRestoreProcess.stderr.on("data", (data) => {
      stderr += data.toString("utf8");
    });

    pgRestoreProcess.on("error", (err) => {
      reject(new Error(`Failed to start pg_restore: ${err.message}`));
    });

    pgRestoreProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`pg_restore process failed: ${stderr}`));
      }
      resolve(stderr);
    });

    // Pipe backup data to pg_restore
    backupStream.pipe(pgRestoreProcess.stdin);
  });
}

export const handler = Sentry.wrapHandler(
  async (event: { backupKey?: string; databaseUrl?: string }) => {
    try {
      let backupKey = event.backupKey;

      if (!backupKey) {
        logger.info("No backup key provided, fetching latest backup");
        backupKey = await getLatestBackupKey();
      }

      logger.info({ backupKey }, "Starting database restore process");

      const stderr = await performRestore(backupKey, event.databaseUrl);

      if (stderr) {
        logger.warn({ stderr }, "Warnings during restore");
      }

      logger.info("Database restore completed successfully");

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Database restore completed successfully",
          backupKey,
        }),
      };
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "restore-database");
        scope.setExtra("error", error);
        scope.setExtra(
          "message",
          error instanceof Error ? error.message : error
        );
        Sentry.captureException(error);
      });

      logger.error(
        { error: error instanceof Error ? error.message : error },
        "Error during database restore"
      );

      // Send email notification about the failure
      try {
        await resend.emails.send({
          from: `${config.projectName} <notifications@${config.domain}>`,
          to: config.supportEmail,
          subject: "Database Restore Failed",
          react: BackupFailedEmail({
            error: error instanceof Error ? error.message : String(error),
            timestamp: format(new Date(), "PPpp"),
          }),
        });

        logger.info("Restore failure notification email sent");

        await sendDiscordDM({
          title: "❌ Database restore failed",
          metadata: {
            Error: error instanceof Error ? error.message : String(error),
            Timestamp: format(new Date(), "PPpp"),
          },
        });
      } catch (emailError) {
        logger.error(
          { error: emailError },
          "Failed to send restore failure notification email"
        );
      }

      throw error;
    }
  }
);

export default handler;
