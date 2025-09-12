import z from "zod";

export const companySchema = z.object({
  Id: z.string(),
  Name: z.string(),
});
