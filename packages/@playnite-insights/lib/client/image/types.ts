import z from "zod";
import { imageSchema } from "./schemas";

export type Image = z.infer<typeof imageSchema>;
