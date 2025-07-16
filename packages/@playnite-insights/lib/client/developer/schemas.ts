import z from "zod";

export const developerSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});
