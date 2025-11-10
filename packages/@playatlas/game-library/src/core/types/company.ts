import z from "zod";
import type { companySchema } from "../validation/schemas/company";

export type Company = z.infer<typeof companySchema>;
