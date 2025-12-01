import z from "zod";
import { playniteLibraryMetricsSchema } from "./schemas";

export type PlayniteLibraryMetrics = z.infer<
  typeof playniteLibraryMetricsSchema
>;
