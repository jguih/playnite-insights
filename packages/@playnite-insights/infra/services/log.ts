import { currentLogLevel, LOG_LEVELS } from "@playnite-insights/lib";
import { LogService } from "@playnite-insights/core";
import { ZodError } from "zod";

export const DEFAULT_SOURCE = "General";

export const makeLogService = (
  source: string = DEFAULT_SOURCE,
  CURRENT_LOG_LEVEL: (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS] = currentLogLevel
): LogService => {
  const getDateTimeString = (): string => {
    const now = new Date();
    return now.toISOString().trim();
  };

  const logError = (message: string, error?: unknown): void => {
    if (CURRENT_LOG_LEVEL > LOG_LEVELS.error) {
      return;
    }
    console.error(`[${getDateTimeString()}][ERROR][${source}] ${message}`);
    if (error && error instanceof ZodError) {
      const formattedIssues = error.issues
        .map((i) => `- ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      console.error(formattedIssues);
      return;
    }
    if (error) {
      console.error(error);
    }
  };

  const logWarning = (message: string): void => {
    if (CURRENT_LOG_LEVEL > LOG_LEVELS.warning) {
      return;
    }
    console.warn(`[${getDateTimeString()}][WARNING][${source}] ${message}`);
  };

  const logDebug = (message: string): void => {
    if (CURRENT_LOG_LEVEL > LOG_LEVELS.debug) {
      return;
    }
    console.debug(`[${getDateTimeString()}][DEBUG][${source}] ${message}`);
  };

  const logSuccess = (message: string): void => {
    if (CURRENT_LOG_LEVEL > LOG_LEVELS.success) {
      return;
    }
    console.log(`[${getDateTimeString()}][SUCCESS][${source}] ${message}`);
  };

  const logInfo = (message: string): void => {
    if (CURRENT_LOG_LEVEL > LOG_LEVELS.info) {
      return;
    }
    console.info(`[${getDateTimeString()}][INFO][${source}] ${message}`);
  };

  return {
    error: logError,
    warning: logWarning,
    info: logInfo,
    success: logSuccess,
    debug: logDebug,
    LOG_LEVELS,
    CURRENT_LOG_LEVEL,
  };
};

export const defaultLogger = makeLogService(DEFAULT_SOURCE);
