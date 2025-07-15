import z from "zod";
import { playniteGameSchema } from "../schemas/playnite-game";

export type PlayniteGame = z.infer<typeof playniteGameSchema>;
