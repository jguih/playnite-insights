import z from "zod";
import { completionStatusSchema } from "../validation/schemas/completion-status";

export type CompletionStatus = z.infer<typeof completionStatusSchema>;
