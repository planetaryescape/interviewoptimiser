import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "lib/**/*.test.ts",
      "lib/**/*.test.tsx",
      "functions/**/*.test.ts",
    ],
    setupFiles: ["lib/ai/__tests__/setup.ts", "src/__tests__/setup.tsx"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "~": resolve(__dirname, "./"),
    },
  },
});
