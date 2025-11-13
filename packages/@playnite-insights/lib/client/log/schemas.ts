export const LOG_LEVELS = {
  debug: 0,
  info: 1,
  success: 2,
  warning: 3,
  error: 4,
} as const;

export const isValidLogLevel = (
  value: number
): value is (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS] => {
  const validLevels = Object.values(LOG_LEVELS);
  return validLevels.includes(
    value as (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS]
  );
};
