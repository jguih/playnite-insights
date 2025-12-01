import { InvalidEnvironmentVariableValueError } from "../domain/error";
import { EnvService } from "./environment.service.port";
import { EnvServiceDeps } from "./environment.service.types";

export const makeEnvService = ({ env }: EnvServiceDeps): EnvService => {
  const _work_dir = env.PLAYATLAS_WORK_DIR;
  if (!_work_dir || _work_dir === "")
    throw new InvalidEnvironmentVariableValueError(
      `Work directory environment variable is empty or undefined`,
      { envName: "PLAYATLAS_WORK_DIR" }
    );

  const _migrations_dir =
    env.PLAYATLAS_MIGRATIONS_DIR && env.PLAYATLAS_MIGRATIONS_DIR !== ""
      ? env.PLAYATLAS_MIGRATIONS_DIR
      : null;
  const _log_level = Number.isInteger(Number(env.PLAYATLAS_LOG_LEVEL))
    ? Number(env.PLAYATLAS_LOG_LEVEL)
    : null;
  const _use_in_memory_db =
    env.PLAYATLAS_USE_IN_MEMORY_DB === "true" ||
    env.PLAYATLAS_USE_IN_MEMORY_DB === "1";

  return {
    getWorkDir: () => _work_dir,
    getMigrationsDir: () => _migrations_dir,
    getLogLevel: () => _log_level,
    getUseInMemoryDb: () => _use_in_memory_db,
  };
};
