import type { ValidFileName } from "./playnite-media-files-context.types";

export type PlayniteMediaFileStreamResult = {
  filename: string;
  filepath: string;
  name: ValidFileName;
};
