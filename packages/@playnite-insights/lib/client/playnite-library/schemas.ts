import z from "zod";

export const playniteLibraryMetricsSchema = z.object({
  gamesOwnedLast6Months: z.array(
    z.object({
      month: z.string(),
      count: z.number(),
    })
  ),
});
