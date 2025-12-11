import { ISODateSchema } from "@playatlas/common/common";
import z from "zod";

export const extensionRegistrationResponseDtoSchema = z.object({
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

export type ExtensionRegistrationResponseDto = z.infer<
  typeof extensionRegistrationResponseDtoSchema
>;
