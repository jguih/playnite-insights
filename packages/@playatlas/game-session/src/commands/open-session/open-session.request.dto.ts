import { ISODateSchema } from "@playatlas/common/common";
import z from "zod";

export const openGameSessionRequestDtoSchema = z.object({
  ClientUtcNow: ISODateSchema,
  SessionId: z.string(),
  GameId: z.string(),
});

export type OpenGameSessionRequestDto = z.infer<
  typeof openGameSessionRequestDtoSchema
>;
