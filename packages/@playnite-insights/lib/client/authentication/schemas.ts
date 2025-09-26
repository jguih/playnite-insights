import z from "zod";
import { ISODateSchema } from "../schemas";

export const validAuthenticationHeaders = {
  "X-ExtensionId": "X-ExtensionId",
  "X-Signature": "X-Signature",
  "X-Timestamp": "X-Timestamp",
  "X-ContentHash": "X-ContentHash",
  "X-RegistrationId": "X-RegistrationId",
} as const;

export const instanceAuthenticationSchema = z.object({
  Id: z.literal(1),
  PasswordHash: z.string(),
  CreatedAt: ISODateSchema,
  LastUpdatedAt: ISODateSchema,
});
