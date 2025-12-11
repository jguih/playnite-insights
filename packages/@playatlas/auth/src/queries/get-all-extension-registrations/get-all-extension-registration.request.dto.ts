import z from "zod";

export const getAllExtensionRegistrationsRequestDtoSchema = z.object({
  ifNoneMatch: z.string().optional().nullable(),
});

export type GetAllExtensionRegistrationsRequestDto = z.infer<
  typeof getAllExtensionRegistrationsRequestDtoSchema
>;
