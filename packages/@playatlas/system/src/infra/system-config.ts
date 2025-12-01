import {
  isValidLogLevel,
  logLevel,
  type LogLevelNumber,
} from "@playatlas/common/application";
import { join } from "path";
import { type MakeSystemConfigDeps } from "./system-config.port";

export type SystemConfig = {
  getMigrationsDir(): string;
  getLogLevel(): LogLevelNumber;
  getDataDir(): string;
  getTmpDir(): string;
  getLibFilesDir(): string;
  getDbPath(): string;
};

export const makeSystemConfig = ({
  envService,
}: MakeSystemConfigDeps): SystemConfig => {
  const _data_dir = join(envService.getWorkDir(), "/data");
  const _tmp_dir = join(_data_dir, "/tmp");
  const _lib_files_dir = join(_data_dir, "/files");
  const _migrations_dir =
    envService.getMigrationsDir() ??
    join(envService.getWorkDir(), "/infra/migrations");
  const envLogLevel = envService.getLogLevel();
  const _log_level = isValidLogLevel(envLogLevel) ? envLogLevel : logLevel.info;
  const _db_path = join(_data_dir, "/db");

  const systemConfig: SystemConfig = {
    getMigrationsDir: () => _migrations_dir,
    getLogLevel: () => _log_level,
    getDataDir: () => _data_dir,
    getLibFilesDir: () => _lib_files_dir,
    getTmpDir: () => _tmp_dir,
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
