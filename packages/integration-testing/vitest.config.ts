import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    reporters: [
      "default",
      ["junit", { outputFile: "../../test-results/integration-junit.xml" }],
    ],
    projects: [
      {
        test: {
          name: "integration",
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
