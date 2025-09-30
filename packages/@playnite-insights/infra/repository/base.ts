import type { LogService } from "@playnite-insights/core";
import { ApiError, ValidationError } from "@playnite-insights/lib/client";
import type { DatabaseSync } from "node:sqlite";
import { ZodError } from "zod";
import { getDb as _getDb } from "../database/database";
import { defaultLogger } from "../services/log";

const PERFORMANCE_WARN_THRESHSOLD_MS = 50;

export type BaseRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};

export const getDefaultRepositoryDeps = (): Required<BaseRepositoryDeps> => {
  return {
    getDb: _getDb,
    logService: defaultLogger,
  };
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
      throw new ValidationError({ details: error.errors });
    }
    throw new ApiError("SQLite database error", 500, { cause: error });
  }
};
