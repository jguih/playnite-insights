import z from "zod";
import { gameManifestDataSchema } from "../validation/schemas/game-manifest-data";

export type GameManifestData = z.infer<typeof gameManifestDataSchema>;
