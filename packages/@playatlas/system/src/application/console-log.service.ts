import { logLevel, type LogService } from "@playatlas/common/application";
import { ZodError } from "zod/v4";
import { getSystemConfig } from "../infra/system-config";

export const DEFAULT_SOURCE = "PlayAtlasServer";

export const makeConsoleLogService = (
  source: string = DEFAULT_SOURCE
): LogService => {
  const getDateTimeString = (): string => {
    const now = new Date();
    return now.toLocaleString();
  };
  const systemConfig = getSystemConfig();
  const currentLogLevel = systemConfig.getLogLevel();

  const logError = (message: string, error?: unknown): void => {
    if (currentLogLevel > logLevel.error) {
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
    if (currentLogLevel > logLevel.warning) {
      return;
    }
    console.warn(`[${getDateTimeString()}] [WARNING] [${source}] ${message}`);
  };

  const logDebug = (message: string): void => {
    if (currentLogLevel > logLevel.debug) {
      return;
    }
    console.debug(`[${getDateTimeString()}] [DEBUG] [${source}] ${message}`);
  };

  const logSuccess = (message: string): void => {
    if (currentLogLevel > logLevel.success) {
      return;
    }
    console.log(`[${getDateTimeString()}] [SUCCESS] [${source}] ${message}`);
  };

  const logInfo = (message: string): void => {
    if (currentLogLevel > logLevel.info) {
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

export const defaultLogger = makeConsoleLogService(DEFAULT_SOURCE);
