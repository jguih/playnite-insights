import z from "zod";

export const approveExtensionRegistrationRequestDtoSchema = z.object({
  registrationId: z.number(),
});

export type ApproveExtensionRegistrationRequestDto = z.infer<
  typeof approveExtensionRegistrationRequestDtoSchema
>;
