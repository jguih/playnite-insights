import z from "zod";

export const completionStatusSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});
