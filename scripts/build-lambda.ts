import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import * as esbuild from "esbuild";

const functionName = process.argv[2];
if (!functionName) {
  console.error("Please provide a function name");
  process.exit(1);
}

async function build() {
  try {
    await esbuild.build({
      entryPoints: [`functions/${functionName}.ts`],
      bundle: true,
      platform: "node",
      target: "node20",
      sourcemap: true,
      minify: false,
      external: ["@aws-sdk/*", "aws-lambda"],
      inject: ["./scripts/react-shim.js"],
      loader: {
        ".tsx": "tsx",
        ".ts": "tsx",
        ".node": "file",
      },
      outfile: `functions/dist/${functionName}/index.js`,
      plugins: [
        sentryEsbuildPlugin({
          org: "interviewoptimiser",
          project: functionName,
          authToken: process.env.SENTRY_AUTH_TOKEN,
        }),
      ],
    });
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
