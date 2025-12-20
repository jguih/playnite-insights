import type { FileSystemService } from "@playatlas/common/application";
import { VALID_FILE_NAMES } from "./playnite-media-files-handler.constants";
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

export type ValidFileName = (typeof VALID_FILE_NAMES)[number];
