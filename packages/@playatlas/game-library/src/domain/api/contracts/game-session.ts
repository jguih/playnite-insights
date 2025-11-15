import z from "zod";
import { gameSessionSchema } from "../../validation/schemas/game-session";

export const getRecentSessionsResponseSchema = z.array(gameSessionSchema);

export type GetRecentSessionsResponse = z.infer<
  typeof getRecentSessionsResponseSchema
>;
