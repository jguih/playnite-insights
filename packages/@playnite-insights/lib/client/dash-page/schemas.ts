import z from "zod";
import { gameSessionSchema } from "../game-session/schemas";
import { playniteGameSchema } from "../playnite-game/schemas";

export const dashPageDataSchema = z.object({
  totalGamesInLibrary: z.number(),
  isInstalled: z.number(),
  notInstalled: z.number(),
  totalPlaytimeSeconds: z.number(),
  notPlayed: z.number(),
  played: z.number(),
  charts: z.object({
    totalPlaytimeOverLast6Months: z.object({
      xAxis: z.object({ data: z.array(z.string()) }),
      series: z.object({ bar: z.object({ data: z.array(z.number()) }) }),
    }),
    totalGamesOwnedOverLast6Months: z.object({
      xAxis: z.object({ data: z.array(z.string()) }),
      series: z.object({ bar: z.object({ data: z.array(z.number()) }) }),
    }),
  }),
  topMostPlayedGames: z.array(
    z.object({
      Id: playniteGameSchema.shape.Id,
      Name: playniteGameSchema.shape.Name,
      Playtime: playniteGameSchema.shape.Playtime,
      CoverImage: playniteGameSchema.shape.CoverImage,
      LastActivity: playniteGameSchema.shape.LastActivity,
    })
  ),
  gameSessionsFromLast7Days: z.array(gameSessionSchema),
});

export const dashPageGameSchema = z.object({
  Id: playniteGameSchema.shape.Id,
  IsInstalled: playniteGameSchema.shape.IsInstalled,
  Playtime: playniteGameSchema.shape.Playtime,
});
