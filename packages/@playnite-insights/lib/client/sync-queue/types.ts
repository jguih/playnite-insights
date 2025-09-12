import z from "zod";
import { syncQueueItemSchema } from "./schemas";

export type SyncQueueItem = z.infer<typeof syncQueueItemSchema>;
