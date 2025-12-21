import type { ValidMediaFileFieldName } from "./playnite-media-files-context.types";

export type PlayniteMediaFileStreamResult = {
  filename: string;
  filepath: string;
  name: ValidMediaFileFieldName;
};
