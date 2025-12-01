import {
  logLevel,
  LogLevelNumber,
  type LogService,
} from "@playatlas/common/application";
import { ZodError } from "zod/v4";

export const DEFAULT_SOURCE = "PlayAtlasServer";

export const makeLogService = (
  source: string = DEFAULT_SOURCE,
  getCurrentLogLevel: () => LogLevelNumber
): LogService => {
  const getDateTimeString = (): string => {
    const now = new Date();
    return now.toLocaleString();
  };

  const logError = (message: string, error?: unknown): void => {
    if (getCurrentLogLevel() > logLevel.error) {
      return;
    }
    console.error(`[${getDateTimeString()}] [ERROR] [${source}] ${message}`);
    if (error && error instanceof ZodError) {
      console.error(
        `[${getDateTimeString()}] [ERROR] [${source}] `,
        JSON.stringify(error.issues, null, 2)
      );
    } else if (error) {
      console.error(`[${getDateTimeString()}] [ERROR] [${source}] `, error);
    }
  };

  const logWarning = (message: string): void => {
    if (getCurrentLogLevel() > logLevel.warning) {
      return;
    }
    console.warn(`[${getDateTimeString()}] [WARNING] [${source}] ${message}`);
  };

  const logDebug = (message: string): void => {
    if (getCurrentLogLevel() > logLevel.debug) {
      return;
    }
    console.debug(`[${getDateTimeString()}] [DEBUG] [${source}] ${message}`);
  };

  const logSuccess = (message: string): void => {
    if (getCurrentLogLevel() > logLevel.success) {
      return;
    }
    console.log(`[${getDateTimeString()}] [SUCCESS] [${source}] ${message}`);
  };

  const logInfo = (message: string): void => {
    if (getCurrentLogLevel() > logLevel.info) {
      return;
    }
    console.info(`[${getDateTimeString()}] [INFO] [${source}] ${message}`);
  };

  return {
    error: logError,
    warning: logWarning,
    info: logInfo,
    success: logSuccess,
    debug: logDebug,
  };
};
