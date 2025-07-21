import z from "zod";

export const gameSessionSchema = z.object({
  SessionId: z.string(),
  GameId: z.string(),
  StartTime: z.string(),
  EndTime: z.string().nullable(),
  Duration: z.number().nullable(),
});

export const openGameSessionSchema = z.object({
  SessionId: z.string(),
  GameId: z.string(),
  StartTime: z.string(),
});
export const closeGameSessionSchema = gameSessionSchema;
