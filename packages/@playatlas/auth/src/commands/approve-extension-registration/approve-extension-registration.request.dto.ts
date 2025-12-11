import z from "zod";

export const approveExtensionRegistrationRequestDtoSchema = z.object({
  registrationId: z.number({
    message: "registration id must be a valid number",
    required_error: "registration id is required",
  }),
});

export type ApproveExtensionRegistrationRequestDto = z.infer<
  typeof approveExtensionRegistrationRequestDtoSchema
>;
