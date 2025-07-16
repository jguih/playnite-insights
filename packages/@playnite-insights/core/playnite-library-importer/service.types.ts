import { SyncGameListCommand, ValidationResult } from "@playnite-insights/lib";
import { FileSystemService } from "../file-system/service.types";
import { LibraryManifestService } from "../library-manifest/service.types";
import { LogService } from "../log/service.types";
import { PlayniteGameRepository } from "../playnite-game/repository.types";
import { PlayniteLibrarySyncRepository } from "../playnite-library-sync/repository.types";
import { StreamUtilsService } from "../stream-utils/service.types";

export type PlayniteLibraryImporterServiceDeps = {
  playniteGameRepository: PlayniteGameRepository;
  libraryManifestService: LibraryManifestService;
  playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
  fileSystemService: FileSystemService;
  streamUtilsService: StreamUtilsService;
  logService: LogService;
  FILES_DIR: string;
};

export type PlayniteLibraryImporterService = {
  sync: (data: SyncGameListCommand) => Promise<boolean>;
  importMediaFiles: (request: Request) => Promise<ValidationResult<null>>;
};
