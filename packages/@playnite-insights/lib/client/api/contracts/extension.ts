import z from "zod";
import { extensionRegistrationSchema } from "../../extension-registration";

export const baseExtensionCommandSchema = z.object({
  ExtensionId: z.string(),
});

export type BaseExtensionCommand = z.infer<typeof baseExtensionCommandSchema>;

export const registerExtensionCommandSchema = z.object({
  ...baseExtensionCommandSchema.shape,
  PublicKey: z.string(),
  Hostname: z.string().nullable().optional(),
  Os: z.string().nullable().optional(),
  ExtensionVersion: z.string().nullable().optional(),
});

export type RegisterExtensionCommand = z.infer<
  typeof registerExtensionCommandSchema
>;

export const getAllExtensionRegistrationsSchema = z.object({
  registrations: z.array(extensionRegistrationSchema),
});
export type GetAllExtensionRegistrationsResponse = z.infer<
  typeof getAllExtensionRegistrationsSchema
>;
