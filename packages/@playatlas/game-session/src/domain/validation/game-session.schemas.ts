import z from "zod";
import { sessionStatus } from "../game-session.constants";

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
