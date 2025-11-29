import { type LogLevelNumber } from "@playatlas/common/application";

export type EnvService = {
  getDataDir: () => string;
  getMigrationsDir: () => string;
  getLogLevel: () => LogLevelNumber;
};
