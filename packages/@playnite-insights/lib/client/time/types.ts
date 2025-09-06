import z from "zod";
import { getServerTimeResponseSchema } from "./schemas";

export type GetServerTimeResponse = z.infer<typeof getServerTimeResponseSchema>;
