import type {
  PlayniteGame,
  SyncGameListCommand,
} from "@playnite-insights/lib/client";
import { type LibraryManifestService } from "../library-manifest/service.types";
import type {
  CompanyRepository,
  GenreRepository,
  PlatformRepository,
  PlayniteGameRepository,
  PlayniteLibraryMetricsRepository,
} from "../types";
import { type CompletionStatusRepository } from "../types/completion-status-repository";
import { type FileSystemService } from "../types/file-system-service";
import { type GameSessionRepository } from "../types/game-session-repository";
import { type LogService } from "../types/log-service";
import { type StreamUtilsService } from "../types/stream-utils-service";

export type PlayniteLibraryImporterServiceDeps = {
  playniteGameRepository: PlayniteGameRepository;
  libraryManifestService: LibraryManifestService;
  playniteLibraryMetricsRepository: PlayniteLibraryMetricsRepository;
  gameSessionRepository: GameSessionRepository;
  fileSystemService: FileSystemService;
  streamUtilsService: StreamUtilsService;
  logService: LogService;
  FILES_DIR: string;
  TMP_DIR: string;
  completionStatusRepository: CompletionStatusRepository;
  genreRepository: GenreRepository;
  platformRepository: PlatformRepository;
  companyRepository: CompanyRepository;
};

export type PlayniteLibraryImporterService = {
  sync: (data: SyncGameListCommand) => Promise<void>;
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
