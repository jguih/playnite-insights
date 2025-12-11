import z from "zod";

export const revokeExtensionRegistrationRequestDtoSchema = z.object({
  registrationId: z.number(),
});

export type RevokeExtensionRegistrationRequestDto = z.infer<
  typeof revokeExtensionRegistrationRequestDtoSchema
>;
