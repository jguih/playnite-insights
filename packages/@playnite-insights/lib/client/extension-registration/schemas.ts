import z from "zod";
import { ISODateSchema } from "../schemas";

export const extensionRegistrationSchema = z.object({
  Id: z.number(),
  ExtensionId: z.string(),
  PublicKey: z.string(),
  Hostname: z.string().nullable(),
  Os: z.string().nullable(),
  ExtensionVersion: z.string().nullable(),
  Status: z.enum(["pending", "trusted", "rejected"]),
  CreatedAt: ISODateSchema,
  LastUpdatedAt: ISODateSchema,
});
