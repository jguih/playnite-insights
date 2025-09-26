import z from "zod";

export const registerInstanceCommandSchema = z.object({
  password: z.string(),
});
