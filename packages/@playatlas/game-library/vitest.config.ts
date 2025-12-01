import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    reporters: [
      "default",
      ["junit", { outputFile: "../../../test-results/game-library-junit.xml" }],
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
