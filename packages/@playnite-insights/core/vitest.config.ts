import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    reporters: [
      "default",
      ["json", { outputFile: "test-results/unit-results.json" }],
    ],
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["**/*.{test,spec}.{js,ts}"],
        },
      },
    ],
  },
});
