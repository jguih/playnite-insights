import {
  LogServiceFactory,
  type FileSystemService,
} from "@playatlas/common/application";
import {
  initDatabase,
  makeDatabaseConnection,
  type EnvService,
  type SystemConfig,
} from "@playatlas/system/infra";
import { DatabaseSync } from "node:sqlite";

export type PlayAtlasApiInfra = Readonly<{
  getFsService: () => FileSystemService;
  getDb: () => DatabaseSync;
  setDb: (db: DatabaseSync) => void;
  /**
   * Initialize the database, creating the SQLite db file and running migrations
   */
  initDb: () => Promise<void>;
}>;

export type BootstrapInfraDeps = {
  logServiceFactory: LogServiceFactory;
  fsService: FileSystemService;
  envService: EnvService;
  systemConfig: SystemConfig;
};

export const bootstrapInfra = ({
  logServiceFactory,
  fsService,
  envService,
  systemConfig,
}: BootstrapInfraDeps) => {
  const logService = logServiceFactory.build("Infra");
  const _fs_service = fsService;

  if (envService.getUseInMemoryDb())
    logService.warning("Using in memory database");

  let _db = envService.getUseInMemoryDb()
    ? makeDatabaseConnection({ inMemory: true })
    : makeDatabaseConnection({ path: systemConfig.getDbPath() });

  const infra: PlayAtlasApiInfra = {
    getFsService: () => _fs_service,
    getDb: () => _db,
    setDb: (db) => (_db = db),
    initDb: () =>
      initDatabase({
        db: _db,
        fileSystemService: _fs_service,
        logService: logServiceFactory.build("InitDatabase"),
        migrationsDir: systemConfig.getMigrationsDir(),
      }),
  };
  return Object.freeze(infra);
};
