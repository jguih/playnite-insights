import { ISODateSchema } from "@playatlas/shared/core";
import z from "zod";

export const gameNoteSchema = z.object({
  Id: z.string(),
  Title: z.string().nullable(),
  Content: z.string().nullable(),
  ImagePath: z.string().nullable(),
  GameId: z.string().nullable(),
  SessionId: z.string().nullable(),
  DeletedAt: ISODateSchema.nullable(),
  CreatedAt: ISODateSchema,
  LastUpdatedAt: ISODateSchema,
});
