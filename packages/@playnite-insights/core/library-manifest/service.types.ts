import {
  type PlayniteLibraryManifest,
  type ValidationResult,
} from "@playnite-insights/lib/client";
import type { PlayniteGameRepository } from "../playnite-game.types";
import type { FileSystemService } from "../file-system.types";
import type { LogService } from "../log.types";

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
