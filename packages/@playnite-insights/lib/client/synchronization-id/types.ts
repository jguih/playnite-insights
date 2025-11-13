import z from "zod";
import { synchronizationIdSchema } from "./schemas";

export type SynchronizationId = z.infer<typeof synchronizationIdSchema>;
