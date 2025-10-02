import z from "zod";
import { ISODateSchema } from "../schemas";

export const validAuthenticationHeaders = {
  "X-ExtensionId": "X-ExtensionId",
  "X-Signature": "X-Signature",
  "X-Timestamp": "X-Timestamp",
  "X-ContentHash": "X-ContentHash",
  "X-RegistrationId": "X-RegistrationId",
} as const;

export const syncIdHeader = "X-Sync-Id" as const;

export const instanceAuthenticationSchema = z.object({
  Id: z.literal(1),
  PasswordHash: z.string(),
  Salt: z.string(),
  CreatedAt: ISODateSchema,
  LastUpdatedAt: ISODateSchema,
});

export const instanceSessionSchema = z.object({
  Id: z.string(),
  CreatedAt: ISODateSchema,
  LastUsedAt: ISODateSchema,
});
