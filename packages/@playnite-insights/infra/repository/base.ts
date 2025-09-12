import type { LogService } from "@playnite-insights/core";
import { ApiError, ValidationError } from "@playnite-insights/lib/client";
import type { DatabaseSync } from "node:sqlite";
import { ZodError } from "zod";
import { getDb as _getDb } from "../database";
import { defaultLogger } from "../services";

export type BaseRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};

export const defaultRepositoryDeps: Required<BaseRepositoryDeps> = {
  getDb: _getDb,
  logService: defaultLogger,
};

export const repositoryCall = <T>(
  logService: LogService,
  fn: () => T,
  context?: string
): T => {
  try {
    return fn();
  } catch (error) {
    logService.error(`Repository call failed ${context ? context : ""}`, error);
    if (error instanceof ApiError) throw error;
    if (error instanceof ZodError) {
      throw new ValidationError({ details: error.errors });
    }
    throw new ApiError("SQLite database error", 500, { cause: error });
  }
};
