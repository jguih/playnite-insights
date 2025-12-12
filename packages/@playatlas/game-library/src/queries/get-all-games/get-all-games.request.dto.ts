import z from "zod";

export const getAllGamesRequestDtoSchema = z.object({
  ifNoneMatch: z.string().optional().nullable(),
});

export type GetAllGamesRequestDto = z.infer<typeof getAllGamesRequestDtoSchema>;
