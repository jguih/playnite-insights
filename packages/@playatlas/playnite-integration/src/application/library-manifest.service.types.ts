import type {
  FileSystemService,
  LogService,
} from "@playatlas/common/application";
import type { GameRepository } from "@playatlas/game-library/infra";
import type { SystemConfig } from "@playatlas/system/infra";

export type LibraryManifestServiceDeps = {
  systemConfig: SystemConfig;
  logService: LogService;
  fileSystemService: FileSystemService;
  gameRepository: GameRepository;
};
