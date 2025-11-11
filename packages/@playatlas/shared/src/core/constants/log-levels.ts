export const LOG_LEVELS = {
  debug: 0,
  info: 1,
  success: 2,
  warning: 3,
  error: 4,
} as const;

export type ValidLogLevels = typeof LOG_LEVELS;
