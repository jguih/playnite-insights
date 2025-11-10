import z from "zod";
import { genreSchema } from "../../validation/schemas/genre";

export const getAllGenresResponseSchema = z.array(genreSchema);
export type GetAllGenresResponse = z.infer<typeof getAllGenresResponseSchema>;
