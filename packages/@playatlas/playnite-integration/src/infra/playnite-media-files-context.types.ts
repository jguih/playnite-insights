import type { FileSystemService } from "@playatlas/common/application";
import { type GameImageType } from "@playatlas/common/common";
import type { PlayniteMediaFileStreamResult } from "./playnite-media-files-handler.types";

export type MakePlayniteMediaFilesContextDeps = {
  fileSystemService: FileSystemService;
};

export type MakePlayniteMediaFilesContextProps = {
  tmpDirPath: string;
  contentHashHeader: string | null;
  gameId?: string;
  contentHash?: string;
  streamResults?: PlayniteMediaFileStreamResult[];
};

export type ValidMediaFileFieldName = GameImageType;
