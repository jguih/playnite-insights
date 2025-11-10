import { ISODateSchema } from "@playatlas/shared/core";
import z from "zod";

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
