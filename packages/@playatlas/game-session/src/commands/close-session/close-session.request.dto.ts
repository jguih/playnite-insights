import { ISODateSchema } from "@playatlas/common/domain";
import z from "zod";

export const closeGameSessionRequestDtoSchema = z.object({
  ClientUtcNow: ISODateSchema,
  SessionId: z.string(),
  GameId: z.string(),
  StartTime: ISODateSchema,
  EndTime: ISODateSchema,
  Duration: z.number(),
});

export type CloseGameSessionRequestDto = z.infer<
  typeof closeGameSessionRequestDtoSchema
>;
