import z from "zod";

export const publisherSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});
