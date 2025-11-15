import { isValidLogLevel, logLevel } from "@playatlas/common/domain";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const moduleDir = join(__dirname, "..", "..");

export type SystemConfig = {
  getMigrationsDir(): string;
  getLogLevel(): (typeof logLevel)[keyof typeof logLevel];
};

export const makeSystemConfig = (): SystemConfig => {
  const env = {
    migrationsDir: process.env.PLAYATLAS_MIGRATIONS_DIR,
    logLevel: process.env.PLAYATLAS_LOG_LEVEL,
  };

  const _default_migrations_dir = join(
    moduleDir,
    "/src/infra/database/migrations"
  );
  const _migrations_dir = env.migrationsDir
    ? env.migrationsDir
    : _default_migrations_dir;

  const _log_level_as_number = Number(env.logLevel);
  const _log_level = isValidLogLevel(_log_level_as_number)
    ? _log_level_as_number
    : logLevel.info;

  return Object.freeze({
    getMigrationsDir: () => _migrations_dir,
    getLogLevel: () => _log_level,
  });
};

let _config: SystemConfig | null = null;

export const getSystemConfig = () => {
  if (_config === null) {
    _config = makeSystemConfig();
  }
  return _config;
};
