import z from "zod";

export const getAllCompaniesRequestDtoSchema = z.object({
  ifNoneMatch: z.string().optional().nullable(),
});

export type GetAllCompaniesRequestDto = z.infer<
  typeof getAllCompaniesRequestDtoSchema
>;
