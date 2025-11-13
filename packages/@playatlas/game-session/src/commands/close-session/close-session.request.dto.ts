import { ISODateSchema } from "@playatlas/shared/core";
import z from "zod";
import { sessionStatus } from "../../domain/game-session.constants";

export const closeGameSessionRequestDtoSchema = z.object({
  ClientUtcNow: ISODateSchema,
  SessionId: z.string(),
  GameId: z.string(),
  StartTime: z.string(),
  EndTime: z.string().optional().nullable(),
  Duration: z.number().optional().nullable(),
  Status: z.enum([sessionStatus.closed, sessionStatus.stale]),
});

export type CloseGameSessionRequestDto = z.infer<
  typeof closeGameSessionRequestDtoSchema
>;
