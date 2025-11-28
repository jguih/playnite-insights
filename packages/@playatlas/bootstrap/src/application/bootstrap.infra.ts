import { type FileSystemService } from "@playatlas/common/domain";
import {
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
  };
  return Object.freeze(infra);
};
