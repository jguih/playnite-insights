import {
  PlayniteLibraryManifest,
  type ValidationResult,
} from "@playnite-insights/lib";
import { PlayniteGameRepository } from "../playnite-game";
import { FileSystemService } from "../file-system";
import { LogService } from "../log";

export type LibraryManifestServiceDeps = {
  getManifestData: PlayniteGameRepository["getManifestData"];
  fileSystemService: FileSystemService;
  logService: LogService;
  LIBRARY_MANIFEST_FILE: string;
  FILES_DIR: string;
  CONTENT_HASH_FILE_NAME: string;
};

export type LibraryManifestService = {
  write: () => Promise<ValidationResult<PlayniteLibraryManifest>>;
  get: () => Promise<PlayniteLibraryManifest | null>;
};
