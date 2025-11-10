import z from "zod";
import { companySchema } from "../../validation/schemas/company";

export type Company = z.infer<typeof companySchema>;
