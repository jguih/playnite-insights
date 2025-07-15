import z from "zod";
import { genreSchema } from "../schemas/genre";

export type Genre = z.infer<typeof genreSchema>;
