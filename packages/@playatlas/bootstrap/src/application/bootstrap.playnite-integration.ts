import {
  type FileSystemService,
  type LogServiceFactory,
} from "@playatlas/common/application";
import type {
  CompanyRepository,
  CompletionStatusRepository,
  GameRepository,
  GenreRepository,
  PlatformRepository,
} from "@playatlas/game-library/infra";
import {
  type LibraryManifestService,
  makeLibraryManifestService,
  makePlayniteSyncService,
  type PlayniteSyncService,
} from "@playatlas/playnite-integration/application";
import {
  makeSyncGamesCommandHandler,
  type SyncGamesCommandHandler,
} from "@playatlas/playnite-integration/commands";
import {
  makePlayniteMediaFilesHandler,
  type PlayniteMediaFilesHandler,
} from "@playatlas/playnite-integration/infra";
import type { SystemConfig } from "@playatlas/system/infra";

export type PlayAtlasApiPlayniteIntegration = Readonly<{
  getPlayniteMediaFilesHandler: () => PlayniteMediaFilesHandler;
  getLibraryManifestService: () => LibraryManifestService;
  getPlayniteSyncService: () => PlayniteSyncService;
  commands: {
    getSyncGamesCommandHandler: () => SyncGamesCommandHandler;
  };
}>;

export type BootstrapPlayniteIntegrationDeps = {
  logServiceFactory: LogServiceFactory;
  fileSystemService: FileSystemService;
  systemConfig: SystemConfig;
  gameRepository: GameRepository;
  companyRepository: CompanyRepository;
  platformRepository: PlatformRepository;
  genreRepository: GenreRepository;
  completionStatusRepository: CompletionStatusRepository;
};

export const bootstrapPlayniteIntegration = ({
  logServiceFactory,
  fileSystemService,
  systemConfig,
  gameRepository,
  companyRepository,
  completionStatusRepository,
  genreRepository,
  platformRepository,
}: BootstrapPlayniteIntegrationDeps): PlayAtlasApiPlayniteIntegration => {
  const _playnite_media_files_handler = makePlayniteMediaFilesHandler({
    logService: logServiceFactory.build("PlayniteMediaFilesHandler"),
    logServiceFactory,
    fileSystemService,
    systemConfig,
  });
  const _library_manifest_service = makeLibraryManifestService({
    systemConfig,
    fileSystemService,
    logService: logServiceFactory.build("LibraryManifestService"),
    gameRepository: gameRepository,
  });
  const _playnite_sync_service = makePlayniteSyncService({
    gameRepository: gameRepository,
    libraryManifestService: _library_manifest_service,
    logService: logServiceFactory.build("PlayniteSyncService"),
    playniteMediaFilesHandler: _playnite_media_files_handler,
  });
  const _sync_games_command_handler = makeSyncGamesCommandHandler({
    companyRepository: companyRepository,
    completionStatusRepository: completionStatusRepository,
    gameRepository: gameRepository,
    genreRepository: genreRepository,
    platformRepository: platformRepository,
    logService: logServiceFactory.build("SyncGamesCommandHandler"),
    libraryManifestService: _library_manifest_service,
  });

  const playniteIntegrationApi: PlayAtlasApiPlayniteIntegration = {
    getPlayniteMediaFilesHandler: () => _playnite_media_files_handler,
    getLibraryManifestService: () => _library_manifest_service,
    getPlayniteSyncService: () => _playnite_sync_service,
    commands: {
      getSyncGamesCommandHandler: () => _sync_games_command_handler,
    },
  };
  return Object.freeze(playniteIntegrationApi);
};
