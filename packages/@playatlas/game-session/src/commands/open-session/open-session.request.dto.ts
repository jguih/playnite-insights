import { ISODateSchema } from "@playatlas/common/domain";
import z from "zod";

export const openGameSessionRequestDtoSchema = z.object({
  ClientUtcNow: ISODateSchema,
  SessionId: z.string(),
  GameId: z.string(),
  StartTime: z.string(),
});

export type OpenGameSessionRequestDto = z.infer<
  typeof openGameSessionRequestDtoSchema
>;
