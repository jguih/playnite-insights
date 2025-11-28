import { LogLevelNumber } from "@playatlas/common/domain";

export type EnvService = {
  getDataDir: () => string;
  getMigrationsDir: () => string;
  getLogLevel: () => LogLevelNumber;
};
