import z from "zod";
import { publisherSchema } from "../schemas";

export type Publisher = z.infer<typeof publisherSchema>;
