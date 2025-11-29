import { type FileSystemService } from "@playatlas/common/application";
import { makeConsoleLogService } from "@playatlas/system/application";
import {
  initDatabase,
  makeDatabaseConnection,
  makeEnvService,
  makeFileSystemService,
  makeSystemConfig,
  type EnvService,
  type SystemConfig,
} from "@playatlas/system/infra";
import { DatabaseSync } from "node:sqlite";

export type PlayAtlasApiInfra = Readonly<{
  getFsService: () => FileSystemService;
  getEnvService: () => EnvService;
  getSystemConfig: () => SystemConfig;
  getDb: () => DatabaseSync;
  /**
   * Initialize the database, creating the SQLite db file and running migrations
   */
  initDb: () => Promise<void>;
}>;

export const bootstrapInfra = () => {
  const _fs_service = makeFileSystemService();
  const _env_service = makeEnvService({ fs: _fs_service });
  const _systemConfig = makeSystemConfig({ envService: _env_service });
  const _db = makeDatabaseConnection({ path: _systemConfig.getDbPath() });

  const infra: PlayAtlasApiInfra = {
    getFsService: () => _fs_service,
    getEnvService: () => _env_service,
    getSystemConfig: () => _systemConfig,
    getDb: () => _db,
    initDb: async () =>
      initDatabase({
        db: _db,
        fileSystemService: _fs_service,
        logService: makeConsoleLogService("InitDatabase"),
        migrationsDir: _systemConfig.getMigrationsDir(),
      }),
  };
  return Object.freeze(infra);
};
