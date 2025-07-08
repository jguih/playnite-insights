import z from 'zod';
import { playniteGameSchema } from '../playnite-game/schemas';

export const dashPageDataSchema = z.object({
	total: z.number(),
	isInstalled: z.number(),
	notInstalled: z.number(),
	totalPlaytime: z.number(),
	notPlayed: z.number(),
	played: z.number(),
	charts: z.object({
		totalPlaytimeOverLast6Months: z.object({
			xAxis: z.object({ data: z.array(z.string()) }),
			series: z.object({ bar: z.object({ data: z.array(z.number()) }) })
		}),
		totalGamesOwnedOverLast6Months: z.object({
			xAxis: z.object({ data: z.array(z.string()) }),
			series: z.object({ bar: z.object({ data: z.array(z.number()) }) })
		})
	}),
	top10MostPlayedGames: z.array(
		z.object({
			Id: playniteGameSchema.shape.Id,
			Name: playniteGameSchema.shape.Name,
			Playtime: playniteGameSchema.shape.Playtime,
			CoverImage: playniteGameSchema.shape.CoverImage,
			LastActivity: playniteGameSchema.shape.LastActivity
		})
	)
});

export type DashPageData = z.infer<typeof dashPageDataSchema>;
