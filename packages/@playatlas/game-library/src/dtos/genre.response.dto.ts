import z from "zod";

export const genreResponseDtoSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

export type GenreResponseDto = z.infer<typeof genreResponseDtoSchema>;
