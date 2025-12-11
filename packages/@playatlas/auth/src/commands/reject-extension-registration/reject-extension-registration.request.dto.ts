import z from "zod";

export const rejectExtensionRegistrationRequestDtoSchema = z.object({
  registrationId: z.number(),
});

export type RejectExtensionRegistrationRequestDto = z.infer<
  typeof rejectExtensionRegistrationRequestDtoSchema
>;
