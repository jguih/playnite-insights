import type { PlayniteMediaFilesContext } from "./playnite-media-files-context";
import type { PlayniteMediaFileStreamResult } from "./playnite-media-files-handler.types";

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
  withMediaFilesContext: <T>(
    request: Request,
    cb: (context: PlayniteMediaFilesContext) => Promise<T>
  ) => Promise<T>;
  verifyIntegrity: (context: PlayniteMediaFilesContext) => Promise<boolean>;
  /**
   * Process images using sharp.
   * @param imageFilePaths Array of image paths for process
   */
  processImages: (
    context: PlayniteMediaFilesContext
  ) => Promise<PlayniteMediaFileStreamResult[]>;
  moveProcessedImagesToGameFolder: (
    context: PlayniteMediaFilesContext
  ) => Promise<void>;
};
