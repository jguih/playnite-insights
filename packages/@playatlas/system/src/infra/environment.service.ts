import { isValidLogLevel, logLevel } from "@playatlas/common/application";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { InvalidEnvironmentVariableValueError } from "../domain/error";
import { EnvService } from "./environment.service.port";
import { EnvServiceDeps } from "./environment.service.types";
import { defaultFsService } from "./file-system.service";

export const makeEnvService = ({ fs }: EnvServiceDeps): EnvService => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const moduleDir = join(__dirname, "..", "..");

  const env = {
    dataDir: process.env.PLAYATLAS_DATA_DIR,
    migrationsDir: process.env.PLAYATLAS_MIGRATIONS_DIR,
    logLevel: process.env.PLAYATLAS_LOG_LEVEL,
  };

  const default_migrations_dir = join(
    moduleDir,
    "/src/infra/database/migrations"
  );
  const log_level_as_number = Number(env.logLevel);

  const _data_dir = env.dataDir;
  const _migrations_dir = env.migrationsDir
    ? env.migrationsDir
    : default_migrations_dir;
  const _log_level = isValidLogLevel(log_level_as_number)
    ? log_level_as_number
    : logLevel.info;

  return {
    getDataDir: () => {
      if (!_data_dir || !fs.isDir(_data_dir))
        throw new InvalidEnvironmentVariableValueError(
          "Data directory is missing or is not a valid path",
          { envName: "PLAYATLAS_DATA_DIR" }
        );
      return _data_dir;
    },
    getMigrationsDir: () => {
      if (!fs.isDir(_migrations_dir))
        throw new InvalidEnvironmentVariableValueError(
          "Migrations directory is missing or is not a valid path",
          { envName: "PLAYATLAS_MIGRATIONS_DIR" }
        );
      return _migrations_dir;
    },
    getLogLevel: () => _log_level,
  };
};

export const defaultEnvService = makeEnvService({ fs: defaultFsService });
