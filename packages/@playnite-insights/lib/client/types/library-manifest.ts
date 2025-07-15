import { libraryManifestSchema } from "../schemas/library-manifest";
import { z } from "zod";

export type PlayniteLibraryManifest = z.infer<typeof libraryManifestSchema>;
