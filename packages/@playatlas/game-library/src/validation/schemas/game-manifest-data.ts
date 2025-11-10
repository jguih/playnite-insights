import z from "zod";

export const gameManifestDataSchema = z.array(
  z.object({
    Id: z.string(),
    ContentHash: z.string(),
  })
);
