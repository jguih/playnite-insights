import { logLevel } from "./log-service.constants";

export const isValidLogLevel = (
  value: number
): value is (typeof logLevel)[keyof typeof logLevel] => {
  const validLevels = Object.values(logLevel);
  return validLevels.includes(
    value as (typeof logLevel)[keyof typeof logLevel]
  );
};
