import z from "zod";
import {
  gameManifestDataSchema,
  playniteGameSchema,
} from "../schemas/playnite-game";

export type PlayniteGame = z.infer<typeof playniteGameSchema>;
export type GameManifestData = z.infer<typeof gameManifestDataSchema>;
