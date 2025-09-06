import type { FileSystemService } from "../file-system.types";
import type { LogService } from "../log.types";

export type MediaFilesServiceDeps = {
  fileSystemService: FileSystemService;
  logService: LogService;
  FILES_DIR: string;
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
};
