import { libraryManifestSchema } from "./schemas";
import { z } from "zod";

export type PlayniteLibraryManifest = z.infer<typeof libraryManifestSchema>;
