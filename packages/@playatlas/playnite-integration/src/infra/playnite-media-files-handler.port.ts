import { PlayniteMediaFilesContext } from "./playnite-media-files-context";

export type PlayniteMediaFilesHandler = {
  /**
   * Streams the request's multipart form data to a temporary location using busboy.
   *
   * IMPORTANT: caller owns the context and MUST call `dispose()`.
   */
  streamMultipartToTempFolder: (
    request: Request
  ) => Promise<PlayniteMediaFilesContext>;
  /**
   * Scoped helper that guarantees context disposal.
   * Preferred API for most use cases.
   */
  withMediaFilesContext: (
    request: Request,
    cb: (context: PlayniteMediaFilesContext) => Promise<void>
  ) => Promise<void>;
};
