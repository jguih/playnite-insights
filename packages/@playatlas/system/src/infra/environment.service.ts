import { isValidLogLevel, logLevel } from "@playatlas/common/application";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { InvalidEnvironmentVariableValueError } from "../domain/error";
import { EnvService } from "./environment.service.port";
import { EnvServiceDeps } from "./environment.service.types";

export const makeEnvService = ({
  fsService,
  env,
}: EnvServiceDeps): EnvService => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const moduleDir = join(__dirname, "..", "..");

  const default_migrations_dir = join(
    moduleDir,
    "/src/infra/database/migrations"
  );
  const log_level_as_number = Number(env.PLAYATLAS_LOG_LEVEL);

  const _data_dir = env.PLAYATLAS_DATA_DIR;
  const _migrations_dir = env.PLAYATLAS_MIGRATIONS_DIR
    ? env.PLAYATLAS_MIGRATIONS_DIR
    : default_migrations_dir;
  const _log_level = isValidLogLevel(log_level_as_number)
    ? log_level_as_number
    : logLevel.info;
  const _use_in_memory_db = Boolean(env.PLAYATLAS_USE_IN_MEMORY_DB);

  return {
    getDataDir: () => {
      if (!_data_dir)
        throw new InvalidEnvironmentVariableValueError(
          "Data directory is missing",
          { envName: "PLAYATLAS_DATA_DIR" }
        );

      try {
        fsService.mkdirSync(_data_dir, { recursive: true, mode: "0755" });
      } catch (error) {
        throw new InvalidEnvironmentVariableValueError(
          `Data directory was missing and could not be created`,
          { envName: "PLAYATLAS_DATA_DIR", cause: error }
        );
      }

      if (!fsService.isDir(_data_dir))
        throw new InvalidEnvironmentVariableValueError("Invalid path", {
          envName: "PLAYATLAS_DATA_DIR",
        });
      return _data_dir;
    },
    getMigrationsDir: () => {
      if (!fsService.isDir(_migrations_dir))
        throw new InvalidEnvironmentVariableValueError(
          "Migrations directory is missing or is not a valid path",
          { envName: "PLAYATLAS_MIGRATIONS_DIR" }
        );
      return _migrations_dir;
    },
    getLogLevel: () => _log_level,
    getUseInMemoryDb: () => _use_in_memory_db,
  };
};
