import z from "zod";
import { developerSchema } from "../schemas";

export type Developer = z.infer<typeof developerSchema>;
