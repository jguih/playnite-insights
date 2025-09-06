import type {
  SyncGameListCommand,
  ValidationResult,
} from "@playnite-insights/lib/client";
import { type FileSystemService } from "../file-system.types";
import { type LibraryManifestService } from "../library-manifest/service.types";
import { type LogService } from "../log.types";
import { type PlayniteGameRepository } from "../playnite-game.types";
import { type PlayniteLibrarySyncRepository } from "../playnite-library-sync.types";
import { type StreamUtilsService } from "../stream-utils.types";
import { type GameSessionRepository } from "../game-session.types";

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
