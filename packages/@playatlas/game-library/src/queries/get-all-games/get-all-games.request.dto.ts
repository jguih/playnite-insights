import z from "zod";

export const getAllGamesQuerySchema = z.object({
  ifNoneMatch: z.string().optional().nullable(),
});

export type GetAllGamesQuery = z.infer<typeof getAllGamesQuerySchema>;
