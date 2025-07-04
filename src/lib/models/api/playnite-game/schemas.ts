import z from 'zod';

export const statisticsResponseSchema = z.object({
	totalPlaytimeOverLast6Months: z.array(z.number()),
	totalGamesOwnedOverLast6Months: z.array(z.number())
});

export const dashPagePlayniteGameListSchema = z.array(
	z.object({
		Id: z.string(),
		IsInstalled: z.number(),
		Playtime: z.number()
	})
);
