import z from "zod";

export const noteSchema = z.object({
  Id: z.string(),
  Title: z.string(),
  Content: z.string().nullable(),
  ImagePath: z.string().nullable(),
  CreatedAt: z.string(),
  LastUpdatedAt: z.string(),
});
