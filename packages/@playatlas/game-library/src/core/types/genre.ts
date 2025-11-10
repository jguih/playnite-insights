import z from "zod";
import { genreSchema } from "../validation/schemas/genre";

export type Genre = z.infer<typeof genreSchema>;
