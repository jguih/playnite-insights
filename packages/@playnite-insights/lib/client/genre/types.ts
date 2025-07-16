import z from "zod";
import { genreSchema } from "./schemas";

export type Genre = z.infer<typeof genreSchema>;
