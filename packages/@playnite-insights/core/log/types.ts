import { LOG_LEVELS, ValidLogLevels } from "@playnite-insights/lib";

export type LogService = {
  error: (message: string, error?: Error) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  success: (message: string) => void;
  debug: (message: string) => void;
  LOG_LEVELS: ValidLogLevels;
  CURRENT_LOG_LEVEL: (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
};
