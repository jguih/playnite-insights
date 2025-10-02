import z from "zod";
import { completionStatusSchema } from "./schemas";

export type CompletionStatus = z.infer<typeof completionStatusSchema>;
