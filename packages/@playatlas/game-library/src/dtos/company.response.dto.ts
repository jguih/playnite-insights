import z from "zod";

export const companyResponseDtoSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

export type CompanyResponseDto = z.infer<typeof companyResponseDtoSchema>;
