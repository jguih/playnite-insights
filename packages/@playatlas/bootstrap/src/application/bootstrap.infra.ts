import {
  LogServiceFactory,
  SignatureService,
  type FileSystemService,
} from "@playatlas/common/application";
import { makeSignatureService } from "@playatlas/system/application";
import { InvalidServerConfigurationError } from "@playatlas/system/domain";
import {
  initDatabase,
  makeDatabaseConnection,
  makeFileSystemService,
  type EnvService,
  type SystemConfig,
} from "@playatlas/system/infra";
import { DatabaseSync } from "node:sqlite";

export type PlayAtlasApiInfra = Readonly<{
  getFsService: () => FileSystemService;
  getSignatureService: () => SignatureService;
  getDb: () => DatabaseSync;
  setDb: (db: DatabaseSync) => void;
  /**
   * Initialize the database, creating the SQLite db file and running migrations
   */
  initDb: () => Promise<void>;
  /**
   * Creates required environment folders and files
   */
  initEnvironment: () => Promise<void>;
}>;

export type BootstrapInfraDeps = {
  logServiceFactory: LogServiceFactory;
  envService: EnvService;
  systemConfig: SystemConfig;
};

export const bootstrapInfra = ({
  logServiceFactory,
  envService,
  systemConfig,
}: BootstrapInfraDeps) => {
  const logService = logServiceFactory.build("Infra");
  const _fs_service = makeFileSystemService();
  const _signature_service = makeSignatureService({
    fileSystemService: _fs_service,
    getSecurityDir: systemConfig.getSecurityDir,
    logService: logServiceFactory.build("SignatureService"),
  });

  if (envService.getUseInMemoryDb())
    logService.warning("Using in memory database");

  let _db: DatabaseSync | null = null;

  const infra: PlayAtlasApiInfra = {
    getFsService: () => _fs_service,
    getSignatureService: () => _signature_service,
    getDb: () => {
      if (!_db)
        throw new InvalidServerConfigurationError(`Database not initialized`);
      return _db;
    },
    setDb: (db) => (_db = db),
    initDb: () => {
      _db = envService.getUseInMemoryDb()
        ? makeDatabaseConnection({ inMemory: true })
        : makeDatabaseConnection({ path: systemConfig.getDbPath() });
      return initDatabase({
        db: _db,
        fileSystemService: _fs_service,
        logService: logServiceFactory.build("InitDatabase"),
        migrationsDir: systemConfig.getMigrationsDir(),
      });
    },
    initEnvironment: async () => {
      if (!_fs_service.isDir(systemConfig.getMigrationsDir()))
        throw new InvalidServerConfigurationError(
          `Migrations folder (${systemConfig.getMigrationsDir()}) is not a valid directory`
        );

      const dirs = [
        systemConfig.getDataDir(),
        systemConfig.getTmpDir(),
        systemConfig.getLibFilesDir(),
        systemConfig.getSecurityDir(),
      ];

      try {
        await Promise.all(
          dirs.map((dir) =>
            _fs_service.mkdir(dir, { recursive: true, mode: "0755" })
          )
        );
      } catch (error) {
        throw new InvalidServerConfigurationError(
          "Failed to create required environment directories",
          error
        );
      }
    },
  };
  return Object.freeze(infra);
};
