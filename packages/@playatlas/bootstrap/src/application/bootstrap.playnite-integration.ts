import {
  type FileSystemService,
  type LogServiceFactory,
} from "@playatlas/common/application";
import {
  type LibraryManifestService,
  makeLibraryManifestService,
  makePlayniteSyncService,
  type PlayniteSyncService,
} from "@playatlas/playnite-integration/application";
import {
  makePlayniteMediaFilesHandler,
  type PlayniteMediaFilesHandler,
} from "@playatlas/playnite-integration/infra";
import type { SystemConfig } from "@playatlas/system/infra";
import type { PlayAtlasApiGameLibrary } from "./bootstrap.game-library";

export type PlayAtlasApiPlayniteIntegration = Readonly<{
  getPlayniteMediaFilesHandler: () => PlayniteMediaFilesHandler;
  getLibraryManifestService: () => LibraryManifestService;
  getPlayniteSyncService: () => PlayniteSyncService;
}>;

export type BootstrapPlayniteIntegrationDeps = {
  logServiceFactory: LogServiceFactory;
  fileSystemService: FileSystemService;
  systemConfig: SystemConfig;
  gameLibrary: PlayAtlasApiGameLibrary;
};

export const bootstrapPlayniteIntegration = ({
  logServiceFactory,
  fileSystemService,
  systemConfig,
  gameLibrary,
}: BootstrapPlayniteIntegrationDeps): PlayAtlasApiPlayniteIntegration => {
  const _playnite_media_files_handler = makePlayniteMediaFilesHandler({
    logService: logServiceFactory.build("PlayniteMediaFilesHandler"),
    fileSystemService,
    systemConfig,
  });
  const _library_manifest_service = makeLibraryManifestService({
    systemConfig,
    fileSystemService,
    logService: logServiceFactory.build("LibraryManifestService"),
    gameRepository: gameLibrary.getGameRepository(),
  });
  const _playnite_sync_service = makePlayniteSyncService({
    gameRepository: gameLibrary.getGameRepository(),
    libraryManifestService: _library_manifest_service,
    logService: logServiceFactory.build("PlayniteSyncService"),
    playniteMediaFilesHandler: _playnite_media_files_handler,
  });

  const playniteIntegrationApi: PlayAtlasApiPlayniteIntegration = {
    getPlayniteMediaFilesHandler: () => _playnite_media_files_handler,
    getLibraryManifestService: () => _library_manifest_service,
    getPlayniteSyncService: () => _playnite_sync_service,
  };
  return Object.freeze(playniteIntegrationApi);
};
