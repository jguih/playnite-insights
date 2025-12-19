import { PlayniteMediaFilesContext } from "../domain/playnite-media-files-context.entity";

export type PlayniteMediaFilesHandler = {
  /**
   * Streams the request's multipart form data to a temporary location using busboy.
   */
  streamMultipartToTempFolder: (
    request: Request
  ) => Promise<PlayniteMediaFilesContext>;
};
