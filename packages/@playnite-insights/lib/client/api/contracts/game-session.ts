import z from "zod";
import { gameSessionSchema } from "../../game-session";

export const getRecentSessionsResponseSchema = z.array(gameSessionSchema);

export type GetRecentSessionsResponse = z.infer<
  typeof getRecentSessionsResponseSchema
>;
