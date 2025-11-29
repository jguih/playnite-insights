import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    reporters: ["default", ["junit", { outputFile: "test-results/junit.xml" }]],
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          globals: true,
          include: ["**/*.{test,spec}.{js,ts}"],
          setupFiles: ["./src/vitest.setup.ts"],
        },
      },
    ],
  },
  envPrefix: "PLAYATLAS",
});
