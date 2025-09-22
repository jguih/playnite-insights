import z from "zod";

export const registerExtensionCommandSchema = z.object({
  ExtensionId: z.string(),
  PublicKey: z.string(),
  Hostname: z.string().nullable().optional(),
  Os: z.string().nullable().optional(),
  ExtensionVersion: z.string().nullable().optional(),
});

export type RegisterExtensionCommand = z.infer<
  typeof registerExtensionCommandSchema
>;
