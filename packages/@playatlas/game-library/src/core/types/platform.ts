import z from "zod";
import { platformSchema } from "../../validation/schemas/platform";

export type Platform = z.infer<typeof platformSchema>;
