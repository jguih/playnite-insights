import z from "zod";

export const removeExtensionRegistrationRequestDtoSchema = z.object({
  registrationId: z.number(),
});

export type RemoveExtensionRegistrationRequestDto = z.infer<
  typeof removeExtensionRegistrationRequestDtoSchema
>;
