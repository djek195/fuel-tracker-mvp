import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["src/tests/setup.ts"],
    globalSetup: "src/tests/globalSetup.ts",
    hookTimeout: 30000,
  },
});