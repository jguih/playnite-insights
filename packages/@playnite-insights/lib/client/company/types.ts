import z from "zod";
import { companySchema } from "./schemas";

export type Company = z.infer<typeof companySchema>;
