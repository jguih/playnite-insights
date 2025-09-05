import z from "zod";
import { noteSchema } from "./schemas";

export type Note = z.infer<typeof noteSchema>;
