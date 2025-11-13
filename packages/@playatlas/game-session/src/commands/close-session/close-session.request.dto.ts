import { ISODateSchema } from "@playatlas/shared/core";
import z from "zod";
import { sessionStatus } from "../../domain/game-session.constants";

export const closeGameSessionRequestDtoSchema = z.object({
  clientUtcNow: ISODateSchema,
  sessionId: z.string(),
  gameId: z.string(),
  startTime: ISODateSchema,
  endTime: ISODateSchema,
  duration: z.number(),
  status: z.enum([sessionStatus.closed]),
});

export type CloseGameSessionRequestDto = z.infer<
  typeof closeGameSessionRequestDtoSchema
>;
