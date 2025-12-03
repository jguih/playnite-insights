import { ISODateSchema } from "@playatlas/common/common";
import z from "zod";
import { extensionRegistrationStatus } from "../domain/extension-registration.constants";

export const extensionRegistrationSchema = z.object({
  Id: z.number(),
  ExtensionId: z.string(),
  PublicKey: z.string(),
  Hostname: z.string().nullable(),
  Os: z.string().nullable(),
  ExtensionVersion: z.string().nullable(),
  Status: z.nativeEnum(extensionRegistrationStatus),
  CreatedAt: ISODateSchema,
  LastUpdatedAt: ISODateSchema,
});

export type ExtensionRegistrationModel = z.infer<
  typeof extensionRegistrationSchema
>;
