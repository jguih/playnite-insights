import z from "zod";
import { companySchema } from "../../company";

export const getAllCompaniesResponseSchema = z.array(companySchema);

export type GetAllCompaniesResponse = z.infer<
  typeof getAllCompaniesResponseSchema
>;
