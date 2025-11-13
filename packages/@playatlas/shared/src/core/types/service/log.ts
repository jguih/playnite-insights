import type { LOG_LEVELS } from "../../constants/log-levels";

export type LogService = {
  error: (message: string, error?: unknown) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  success: (message: string) => void;
  debug: (message: string) => void;
  CURRENT_LOG_LEVEL: (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
};
