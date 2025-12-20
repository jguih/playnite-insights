import { type LibraryManifest } from "./library-manifest";

export type LibraryManifestService = {
  write: () => Promise<void>;
  get: () => Promise<LibraryManifest | null>;
};
