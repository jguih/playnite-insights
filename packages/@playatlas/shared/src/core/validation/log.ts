import { LOG_LEVELS } from "../constants/log-levels";

export const isValidLogLevel = (
  value: number
): value is (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS] => {
  const validLevels = Object.values(LOG_LEVELS);
  return validLevels.includes(
    value as (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS]
  );
};
