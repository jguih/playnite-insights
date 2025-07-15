import { LOG_LEVELS } from "./service";

export type ValidLogLevels = typeof LOG_LEVELS;

export type LogService = {
  error: (message: string, error?: Error) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  success: (message: string) => void;
  debug: (message: string) => void;
  LOG_LEVELS: typeof LOG_LEVELS;
  CURRENT_LOG_LEVEL: (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
};
