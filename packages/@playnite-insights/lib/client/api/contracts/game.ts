import z from "zod";
import { fullGameSchema } from "../../playnite-game";

export const getAllGamesResponseSchema = z.array(fullGameSchema);

export type GetAllGamesResponse = z.infer<typeof getAllGamesResponseSchema>;
