import type { UploadService } from "../types";
import type { FileSystemService } from "../types/file-system.types";
import type { LogService } from "../types/log.types";

export type MediaFilesServiceDeps = {
  fileSystemService: FileSystemService;
  logService: LogService;
  FILES_DIR: string;
  SCREENSHOTS_DIR: string;
  uploadService: UploadService;
};

export type MediaFilesService = {
  /**
   * Retrieves a game image from the file system.
   *
   * @param playniteGameId Playnite game ID
   * @param imageFileName Image file name as stored in Playnite
   * @param ifNoneMatch if-none-match header value
   * @param ifModifiedSince if-modified-since header value
   * @returns A Response containing the image if found or not cached.
   */
  getGameImage: (
    playniteGameId: string,
    imageFileName: string,
    ifNoneMatch: string | null,
    ifModifiedSince: string | null
  ) => Promise<Response>;
  getScreenshotAsync: (
    imageFileName: string,
    ifNoneMatch: string | null,
    ifModifiedSince: string | null
  ) => Promise<Response>;
  uploadScreenshotsAsync: (request: Request) => Promise<string[]>;
  getAvailableScreenshots: () => Promise<string[]>;
};
