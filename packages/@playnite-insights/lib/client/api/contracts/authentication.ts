import z from "zod";

export const registerInstanceCommandSchema = z.object({
  password: z
    .string()
    .min(4, "Instance password must have at least 4 characters"),
});

export type RegisterInstanceCommand = z.infer<
  typeof registerInstanceCommandSchema
>;
