import {
  FileSystemService,
  LogServiceFactory,
} from "@playatlas/common/application";
import {
  makePlayniteMediaFilesHandler,
  type PlayniteMediaFilesHandler,
} from "@playatlas/playnite-integration/infra";
import type { SystemConfig } from "@playatlas/system/infra";

export type PlayAtlasApiPlayniteIntegration = Readonly<{
  getPlayniteMediaFilesHandler: () => PlayniteMediaFilesHandler;
}>;

export type BootstrapPlayniteIntegrationDeps = {
  logServiceFactory: LogServiceFactory;
  fileSystemService: FileSystemService;
  systemConfig: SystemConfig;
};

export const bootstrapPlayniteIntegration = ({
  logServiceFactory,
  fileSystemService,
  systemConfig,
}: BootstrapPlayniteIntegrationDeps): PlayAtlasApiPlayniteIntegration => {
  const _playnite_media_files_handler = makePlayniteMediaFilesHandler({
    logService: logServiceFactory.build("PlayniteMediaFilesHandler"),
    fileSystemService,
    systemConfig,
  });

  const playniteIntegrationApi: PlayAtlasApiPlayniteIntegration = {
    getPlayniteMediaFilesHandler: () => _playnite_media_files_handler,
  };
  return Object.freeze(playniteIntegrationApi);
};
