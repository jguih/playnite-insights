import z from "zod";
import { dashPageDataSchema, dashPageGameSchema } from "../schemas";

export type DashPageData = z.infer<typeof dashPageDataSchema>;
export type DashPageGame = z.infer<typeof dashPageGameSchema>;
