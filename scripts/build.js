/* eslint-disable @typescript-eslint/no-require-imports */
const { sentryEsbuildPlugin } = require("@sentry/esbuild-plugin");
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const functionsDir = path.resolve(__dirname, "../functions");
const terraformDir = path.resolve(__dirname, "../terraform");

const buildService = (functionName) => {
  const functionPath = path.join(functionsDir, functionName);
  const entryFile = path.join(functionPath, "index.ts");

  console.log(`Building ${functionName}...`);

  esbuild
    .build({
      entryPoints: [entryFile],
      outfile: `${terraformDir}/artifacts/${functionName}/index.js`,
      bundle: true,
      minify: false,
      sourcemap: true,
      platform: "node",
      target: "node20",
      external: ["@aws-sdk/*", "aws-lambda"],
      inject: ["./scripts/react-shim.js"],
      loader: {
        ".tsx": "tsx",
        ".ts": "tsx",
        ".node": "file",
      },
      plugins: [
        sentryEsbuildPlugin({
          org: "interviewoptimiser",
          project: functionName,
          authToken: process.env.SENTRY_AUTH_TOKEN,
        }),
      ],
    })
    .then(() => {
      console.log(`✅ Successfully built ${functionName}`);
    })
    .catch((error) => {
      console.error(`❌ Failed to build ${functionName}:`, error);
      process.exit(1);
    });
};

const directoriesToExclude = ["utils", "lib", "bin"];

const functions = fs.readdirSync(functionsDir).filter((file) => {
  if (directoriesToExclude.includes(file)) return false;
  return fs.statSync(path.join(functionsDir, file)).isDirectory();
});

functions.forEach(buildService);
