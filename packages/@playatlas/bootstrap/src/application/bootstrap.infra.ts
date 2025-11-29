import {
  LogServiceFactory,
  type FileSystemService,
} from "@playatlas/common/application";
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
  setDb: (db: DatabaseSync) => void;
  /**
   * Initialize the database, creating the SQLite db file and running migrations
   */
  initDb: () => Promise<void>;
}>;

export type BootstrapInfraDeps = {
  logServiceFactory: LogServiceFactory;
};

export const bootstrapInfra = ({ logServiceFactory }: BootstrapInfraDeps) => {
  const logService = logServiceFactory.build("Infra");
  const _fs_service = makeFileSystemService();
  const _env_service = makeEnvService({ fs: _fs_service });
  const _systemConfig = makeSystemConfig({ envService: _env_service });

  if (_env_service.getUseInMemoryDb())
    logService.warning("Using in memory database");

  let _db = _env_service.getUseInMemoryDb()
    ? makeDatabaseConnection({ inMemory: true })
    : makeDatabaseConnection({ path: _systemConfig.getDbPath() });
  const _init_db: PlayAtlasApiInfra["initDb"] = () =>
    initDatabase({
      db: _db,
      fileSystemService: _fs_service,
      logService: logServiceFactory.build("InitDatabase"),
      migrationsDir: _systemConfig.getMigrationsDir(),
    });

  const infra: PlayAtlasApiInfra = {
    getFsService: () => _fs_service,
    getEnvService: () => _env_service,
    getSystemConfig: () => _systemConfig,
    getDb: () => _db,
    setDb: (db) => (_db = db),
    initDb: () =>
      initDatabase({
        db: _db,
        fileSystemService: _fs_service,
        logService: logServiceFactory.build("InitDatabase"),
        migrationsDir: _systemConfig.getMigrationsDir(),
      }),
  };
  return Object.freeze(infra);
};
