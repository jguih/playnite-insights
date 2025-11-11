import { ISODateSchema } from "@playatlas/shared/core";
import z from "zod";
import { sessionStatus } from "../../constants/game-session";

export const gameSessionSchema = z.object({
  SessionId: z.string(),
  GameId: z.string().nullable(),
  GameName: z.string().nullable(),
  StartTime: z.string(),
  EndTime: z.string().nullable(),
  Duration: z.number().nullable(),
  Status: z.enum([
    sessionStatus.inProgress,
    sessionStatus.closed,
    sessionStatus.stale,
  ]),
});

export const openGameSessionSchema = z.object({
  ClientUtcNow: ISODateSchema,
  SessionId: z.string(),
  GameId: z.string(),
  StartTime: z.string(),
});

export const closeGameSessionSchema = z.object({
  ClientUtcNow: ISODateSchema,
  SessionId: z.string(),
  GameId: z.string(),
  StartTime: z.string(),
  EndTime: z.string().optional().nullable(),
  Duration: z.number().optional().nullable(),
  Status: z.enum([sessionStatus.closed, sessionStatus.stale]),
});
