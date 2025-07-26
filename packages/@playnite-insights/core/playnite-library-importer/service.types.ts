import { SyncGameListCommand, ValidationResult } from "@playnite-insights/lib";
import { FileSystemService } from "../file-system.types";
import { LibraryManifestService } from "../library-manifest/service.types";
import { LogService } from "../log.types";
import { PlayniteGameRepository } from "../playnite-game.types";
import { PlayniteLibrarySyncRepository } from "../playnite-library-sync.types";
import { StreamUtilsService } from "../stream-utils.types";
import { GameSessionRepository } from "../game-session.types";

export type PlayniteLibraryImporterServiceDeps = {
  playniteGameRepository: PlayniteGameRepository;
  libraryManifestService: LibraryManifestService;
  playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
  gameSessionRepository: GameSessionRepository;
  fileSystemService: FileSystemService;
  streamUtilsService: StreamUtilsService;
  logService: LogService;
  FILES_DIR: string;
};

export type PlayniteLibraryImporterService = {
  sync: (data: SyncGameListCommand) => Promise<boolean>;
  importMediaFiles: (request: Request) => Promise<ValidationResult<null>>;
};
