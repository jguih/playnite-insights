import {
  PlayniteLibraryManifest,
  type ValidationResult,
} from "@playnite-insights/lib";

export type LibraryManifestService = {
  write: () => Promise<ValidationResult<PlayniteLibraryManifest>>;
  get: () => Promise<PlayniteLibraryManifest | null>;
};
