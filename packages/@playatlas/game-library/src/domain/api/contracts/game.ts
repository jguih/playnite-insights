import z from "zod";
import { fullGameSchema } from "../../validation/schemas/game";

export const getAllGamesResponseSchema = z.array(fullGameSchema);

export type GetAllGamesResponse = z.infer<typeof getAllGamesResponseSchema>;
