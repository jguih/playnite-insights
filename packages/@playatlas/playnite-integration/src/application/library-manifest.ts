import { z } from "zod";
import { libraryManifestSchema } from "./library-manifest.schema";

export type LibraryManifest = z.infer<typeof libraryManifestSchema>;
