import z from "zod";
import { ISODateSchema } from "../schemas";

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
