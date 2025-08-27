/* eslint-disable @typescript-eslint/no-require-imports */
const { sentryEsbuildPlugin } = require("@sentry/esbuild-plugin");
const esbuild = require("esbuild");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const functionsDir = path.resolve(__dirname, "../functions");
const terraformDir = path.resolve(__dirname, "../terraform");

// Function to get current git commit SHA
const getGitCommitSha = () => {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch (_e) {
    console.warn("Could not get git commit SHA. Sentry release might not be set correctly.");
    return undefined;
  }
};

const release = getGitCommitSha(); // Determine release once

/**
 * Builds the specified service by bundling its code and preparing it for deployment.
 *
 * @param {string} functionName - The name of the function directory to build.
 * @returns {Promise<void>}
 */
const buildService = async (functionName) => {
  const functionPath = path.join(functionsDir, functionName);
  const entryFile = path.join(functionPath, "index.ts");

  console.log(`Building ${functionName}...`);

  try {
    await esbuild.build({
      entryPoints: [entryFile],
      outfile: `${terraformDir}/artifacts/${functionName}/index.js`,
      bundle: true,
      minify: false,
      sourcemap: true, // 'external' is also a good option, true implies external for bundle
      platform: "node",
      target: "node20",
      external: ["@aws-sdk/*", "aws-lambda"],
      inject: ["./scripts/react-shim.js"], // Make sure this path is correct relative to CWD or use absolute
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
          release: release, // Explicitly set the release
          finalize: true, // Finalize the release after uploading artifacts
          debug: true, // Enable debug logging from the plugin
          telemetry: false,
          errorHandler: (err, _invocation) => {
            // Add error handler for plugin issues
            console.error(`Sentry Esbuild Plugin Error for ${functionName}:`, err.message);
            // Optionally, you can re-throw or exit to fail the build
            // throw err;
            // process.exit(1);
          },
        }),
      ],
    });
    console.log(`✅ Successfully built ${functionName} for release ${release || "unknown"}`);
  } catch (error) {
    console.error(`❌ Failed to build ${functionName}:`, error);
    process.exit(1);
  }
};

const directoriesToExclude = ["utils", "lib", "bin"];

const functions = fs.readdirSync(functionsDir).filter((file) => {
  if (directoriesToExclude.includes(file)) return false;
  return fs.statSync(path.join(functionsDir, file)).isDirectory();
});

// Run builds sequentially to avoid overwhelming the system
(async () => {
  for (const functionName of functions) {
    await buildService(functionName);
  }
})();
