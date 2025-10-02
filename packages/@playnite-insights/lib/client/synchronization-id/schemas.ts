import z from "zod";
import { ISODateSchema } from "../schemas";

export const synchronizationIdSchema = z.object({
  Id: z.literal(1),
  SyncId: z.string(),
  CreatedAt: ISODateSchema,
  LastUsedAt: ISODateSchema,
});
