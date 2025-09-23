import z from "zod";
import { ISODateSchema } from "../../schemas";

export const baseExtensionCommandSchema = z.object({
  Timestamp: ISODateSchema,
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
