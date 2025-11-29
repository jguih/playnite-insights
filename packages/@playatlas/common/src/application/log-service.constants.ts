export const logLevel = {
  debug: 0,
  info: 1,
  success: 2,
  warning: 3,
  error: 4,
} as const;

export type LogLevel = keyof typeof logLevel;
export type LogLevelNumber = (typeof logLevel)[keyof typeof logLevel];
