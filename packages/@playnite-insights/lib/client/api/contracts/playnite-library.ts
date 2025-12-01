import z from "zod";

export const getPlayniteLibraryMetricsResponseSchema = z.object({
  gamesOwnedLast6Months: z.object({
    all: z.array(
      z.object({
        monthIndex: z.number(),
        count: z.number(),
      })
    ),
    visibleOnly: z.array(
      z.object({
        monthIndex: z.number(),
        count: z.number(),
      })
    ),
  }),
});

export type GetPlayniteLibraryMetricsResponse = z.infer<
  typeof getPlayniteLibraryMetricsResponseSchema
>;
