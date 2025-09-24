import type {
  PlayniteGame,
  SyncGameListCommand,
} from "@playnite-insights/lib/client";
import { type LibraryManifestService } from "../library-manifest/service.types";
import type {
  PlayniteGameRepository,
  PlayniteLibrarySyncRepository,
} from "../types";
import { type CompletionStatusRepository } from "../types/completion-status.types";
import { type FileSystemService } from "../types/file-system.types";
import { type GameSessionRepository } from "../types/game-session.types";
import { type LogService } from "../types/log.types";
import { type StreamUtilsService } from "../types/stream-utils.types";

export type PlayniteLibraryImporterServiceDeps = {
  playniteGameRepository: PlayniteGameRepository;
  libraryManifestService: LibraryManifestService;
  playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
  gameSessionRepository: GameSessionRepository;
  fileSystemService: FileSystemService;
  streamUtilsService: StreamUtilsService;
  logService: LogService;
  FILES_DIR: string;
  TMP_DIR: string;
  completionStatusRepository: CompletionStatusRepository;
};

export type PlayniteLibraryImporterService = {
  sync: (data: SyncGameListCommand) => Promise<boolean>;
  importMediaFiles: (request: Request, url: URL) => Promise<void>;
};

export type ImportMediaFilesContext = {
  requestId: string;
  tmpDir: string;
  gameId: string | null;
  game: PlayniteGame | null;
  mediaFilesHash: string | null;
  uploadCount: number;
  filesToHash: { filename: string; buffer: Buffer }[];
  filePromises: Promise<string>[];
};
