import { logLevel } from "./log-service.constants";

export const isValidLogLevel = (
  value?: number | null
): value is (typeof logLevel)[keyof typeof logLevel] => {
  if (value === undefined || value === null) return false;
  const validLevels = Object.values(logLevel);
  return validLevels.includes(
    value as (typeof logLevel)[keyof typeof logLevel]
  );
};
