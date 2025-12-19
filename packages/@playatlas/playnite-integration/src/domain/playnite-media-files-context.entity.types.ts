import { PlayniteMediaFileStreamResult } from "../infra/playnite-media-files-handler.types";

export type MakePlayniteMediaFilesContextProps = {
  tmpDirPath: string;
  gameId?: string;
  contentHash?: string;
  streamResults?: PlayniteMediaFileStreamResult[];
};
