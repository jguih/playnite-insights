import z from "zod";

export const genreSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});
