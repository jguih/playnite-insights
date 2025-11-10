import type { LogService } from "@playnite-insights/core";
import { ApiError } from "@playnite-insights/lib/client";
import type { DatabaseSync } from "node:sqlite";
import { ZodError } from "zod";

const PERFORMANCE_WARN_THRESHSOLD_MS = 50;

export type BaseRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};

export const repositoryCall = <T>(
  logService: LogService,
  fn: () => T,
  context?: string
): T => {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    const message = `Repository call ${
      context ? context : ""
    } took ${duration.toFixed(1)}ms`;
    if (duration >= PERFORMANCE_WARN_THRESHSOLD_MS) logService.warning(message);
    else logService.debug(message);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logService.error(
      `Repository call ${
        context ? context : ""
      } failed after ${duration.toFixed(1)}ms`,
      error
    );
    if (error instanceof ApiError) throw error;
    if (error instanceof ZodError) {
      throw new ApiError(
        {
          error: {
            code: "validation_error",
            issues: error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
        },
        "Validation Error"
      );
    }
    throw new ApiError(
      { error: { code: "internal_error" } },
      "SQLite database error",
      500,
      { cause: error }
    );
  }
};
