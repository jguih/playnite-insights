import { type LogLevelNumber } from "@playatlas/common/domain";
import { join } from "path";
import { type MakeSystemConfigDeps } from "./system-config.port";

export type SystemConfig = {
  getMigrationsDir(): string;
  getLogLevel(): LogLevelNumber;
  getDataDir(): string;
  getDbPath(): string;
};

export const makeSystemConfig = ({
  envService,
}: MakeSystemConfigDeps): SystemConfig => {
  const _data_dir = envService.getDataDir();
  const _migrations_dir = envService.getMigrationsDir();
  const _log_level = envService.getLogLevel();
  const _db_path = join(envService.getDataDir(), "/db");

  const systemConfig: SystemConfig = {
    getMigrationsDir: () => _migrations_dir,
    getLogLevel: () => _log_level,
    getDataDir: () => _data_dir,
    getDbPath: () => _db_path,
  };
  return Object.freeze(systemConfig);
};

let _config: SystemConfig | null = null;

export const getSystemConfig = (deps: MakeSystemConfigDeps) => {
  if (_config === null) {
    _config = makeSystemConfig(deps);
  }
  return _config;
};
