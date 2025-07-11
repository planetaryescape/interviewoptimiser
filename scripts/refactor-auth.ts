#!/usr/bin/env bun

/**
 * Script to refactor API routes from using getAuth() pattern to withAuth middleware
 * Usage: bun run scripts/refactor-auth.ts
 */

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const apiRoutes = [
  "src/app/api/admin/jobs/route.ts",
  "src/app/api/changelogs/route.ts",
  "src/app/api/changelogs/[id]/route.ts",
  "src/app/api/create-black-friday-checkout/route.ts",
  "src/app/api/create-checkout-session/route.ts",
  "src/app/api/customisations/[id]/route.ts",
  "src/app/api/extract/candidate-details/route.ts",
  "src/app/api/extract/job-description/route.ts",
  "src/app/api/extract/questions/route.ts",
  "src/app/api/feature-requests/route.ts",
  "src/app/api/feature-requests/[id]/route.ts",
  "src/app/api/generate-pdf/route.ts",
  "src/app/api/interviews/route.ts",
  "src/app/api/interviews/[id]/route.ts",
  "src/app/api/interviews/[id]/audio-reconstruction/route.ts",
  "src/app/api/invitations/route.ts",
  "src/app/api/invitations/[id]/route.ts",
  "src/app/api/job-descriptions/[jobId]/route.ts",
  "src/app/api/jobs/route.ts",
  "src/app/api/jobs/[jobId]/route.ts",
  "src/app/api/jobs/[jobId]/interviews/route.ts",
  "src/app/api/jobs/[jobId]/interviews/[interviewId]/route.ts",
  // Skip these as they're already done:
  // "src/app/api/jobs/[jobId]/reports/route.ts",
  "src/app/api/jobs/[jobId]/reports/[reportId]/route.ts",
  "src/app/api/lookups/countries/route.ts",
  "src/app/api/organization-members/route.ts",
  "src/app/api/organizations/route.ts",
  "src/app/api/organizations/[id]/route.ts",
  "src/app/api/organizations/[id]/members/route.ts",
  "src/app/api/organizations/[id]/members/[memberId]/route.ts",
  "src/app/api/page-settings/[id]/route.ts",
  "src/app/api/recruitment/questions/route.ts",
  "src/app/api/report/route.ts",
  // Skip this as it's already done:
  // "src/app/api/reports/[id]/route.ts",
  "src/app/api/reports/[id]/question-analyses/route.ts",
  "src/app/api/reviews/route.ts",
  "src/app/api/users/route.ts",
  "src/app/api/users/minutes/decrement/route.ts",
];

interface RefactorResult {
  file: string;
  success: boolean;
  error?: string;
}

async function refactorFile(filePath: string): Promise<RefactorResult> {
  try {
    const fullPath = path.join(process.cwd(), filePath);

    if (!existsSync(fullPath)) {
      return { file: filePath, success: false, error: "File not found" };
    }

    let content = await readFile(fullPath, "utf-8");
    const originalContent = content;

    // Extract route name from path
    const routeName = filePath.replace("src/app/api/", "/api/").replace("/route.ts", "");

    // Detect HTTP methods in the file
    const methods = [];
    if (content.includes("export async function GET")) methods.push("GET");
    if (content.includes("export async function POST")) methods.push("POST");
    if (content.includes("export async function PUT")) methods.push("PUT");
    if (content.includes("export async function DELETE")) methods.push("DELETE");
    if (content.includes("export async function PATCH")) methods.push("PATCH");

    // Extract parameter types from route segments
    const paramMatch = filePath.match(/\[([^\]]+)\]/g);
    const params = paramMatch ? paramMatch.map((p) => p.slice(1, -1)) : [];
    const paramType =
      params.length > 0 ? `{ ${params.map((p) => `${p}: string`).join(", ")} }` : undefined;

    // Update imports
    if (
      content.includes("import { getUserFromClerkId }") &&
      content.includes("import { getAuth }")
    ) {
      // Remove getUserFromClerkId and getAuth imports
      content = content.replace(/import { getUserFromClerkId } from "@\/lib\/auth";\n/g, "");
      content = content.replace(/import { getAuth } from "@clerk\/nextjs\/server";\n/g, "");

      // Add withAuth import at the top
      const firstImportIndex = content.indexOf("import");
      content = `${content.slice(0, firstImportIndex)}import { withAuth } from "@/lib/auth-middleware";\n${content.slice(firstImportIndex)}`;
    }

    // Process each method
    for (const method of methods) {
      const functionPattern = new RegExp(
        `export async function ${method}\\s*\\([^)]*\\)\\s*(?::\\s*[^{]+)?\\s*{`,
        "g"
      );

      // Find the function and its body
      const match = functionPattern.exec(content);
      if (!match) continue;

      // Extract the full function body
      let braceCount = 1;
      let i = match.index + match[0].length;
      const functionStart = match.index;

      while (i < content.length && braceCount > 0) {
        if (content[i] === "{") braceCount++;
        if (content[i] === "}") braceCount--;
        i++;
      }

      const functionEnd = i;
      const functionBody = content.slice(functionStart, functionEnd);

      // Check if it has the auth pattern
      if (!functionBody.includes("getAuth(request)")) continue;

      // Transform to withAuth pattern
      let newFunction = `export const ${method} = withAuth${paramType ? `<${paramType}>` : ""}(\n  async (request, { user${params.length > 0 ? ", params" : ""} }) => {\n`;

      // Extract the try block content
      const tryMatch = functionBody.match(/try\s*{([\s\S]*?)}\s*catch/);
      if (tryMatch) {
        let tryContent = tryMatch[1];

        // Remove auth checking code
        tryContent = tryContent.replace(
          /const { userId: clerkUserId } = getAuth\(request\);[\s\S]*?return NextResponse\.json\(formatErrorEntity\("Unauthorized"\), {[\s\S]*?}\);/g,
          ""
        );
        tryContent = tryContent.replace(
          /const { id: userId } = await getUserFromClerkId\(clerkUserId\);[\s\S]*?return NextResponse\.json\(formatErrorEntity\("User not found"\), {[\s\S]*?}\);/g,
          ""
        );

        // Replace userId with user.id
        tryContent = tryContent.replace(/\buserId\b/g, "user.id");

        // Handle params extraction
        if (params.length > 0) {
          // Remove the params await line
          tryContent = tryContent.replace(/const params = await props\.params;?\n/g, "");

          // Replace params.X with params!.X
          for (const param of params) {
            tryContent = tryContent.replace(
              new RegExp(`params\\.${param}`, "g"),
              `params!.${param}`
            );
          }
        }

        // Clean up extra newlines
        tryContent = tryContent.replace(/\n{3,}/g, "\n\n");

        newFunction += `    try {${tryContent}    } catch (error) {${
          functionBody
            .match(/catch[\s\S]*?}\s*$/)?.[0]
            ?.replace(/catch/, "")
            .replace(/}\s*$/, "") || ""
        }    }\n  },\n  { routeName: "${method} ${routeName}" }\n);`;
      }

      // Replace the old function with the new one
      content = content.slice(0, functionStart) + newFunction + content.slice(functionEnd);
    }

    // Clean up any remaining references
    content = content.replace(/, type NextRequest/g, "");
    content = content.replace(/NextRequest/g, "Request");

    // Only write if changes were made
    if (content !== originalContent) {
      await writeFile(fullPath, content);
      return { file: filePath, success: true };
    }

    return { file: filePath, success: false, error: "No changes needed" };
  } catch (error) {
    return {
      file: filePath,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log("🔧 Starting auth refactoring...\n");

  const results: RefactorResult[] = [];

  for (const file of apiRoutes) {
    process.stdout.write(`Processing ${file}... `);
    const result = await refactorFile(file);
    results.push(result);

    if (result.success) {
      console.log("✅");
    } else {
      console.log(`❌ ${result.error}`);
    }
  }

  console.log("\n📊 Summary:");
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✅ Successfully refactored: ${successful} files`);
  console.log(`❌ Failed or skipped: ${failed} files`);

  if (failed > 0) {
    console.log("\n❌ Failed files:");
    const failedResults = results.filter((r) => !r.success);
    for (const r of failedResults) {
      console.log(`  - ${r.file}: ${r.error}`);
    }
  }
}

main().catch(console.error);
