import z from "zod";
import { platformSchema } from "../schemas";

export type Platform = z.infer<typeof platformSchema>;
