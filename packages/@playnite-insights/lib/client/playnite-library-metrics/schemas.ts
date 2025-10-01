import z from "zod";
import { ISODateSchema } from "../schemas";

export const playniteLibraryMetricsSchema = z.object({
  Id: z.number(),
  Timestamp: ISODateSchema,
  TotalPlaytimeSeconds: z.number(),
  VisibleTotalPlaytimeSeconds: z.number(),
  TotalGames: z.number(),
  VisibleTotalGames: z.number(),
});
