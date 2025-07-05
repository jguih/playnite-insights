import { developerSchema } from '$lib/developer/schemas';
import { z } from 'zod';

export const playniteGameSchema = z.object({
	Id: z.string(),
	Name: z.string().optional().nullable(),
	Description: z.string().optional().nullable(),
	ReleaseDate: z.string().optional().nullable(),
	Playtime: z.number(),
	LastActivity: z.string().optional().nullable(),
	Added: z.string().optional().nullable(),
	InstallDirectory: z.string().optional().nullable(),
	IsInstalled: z.number(),
	BackgroundImage: z.string().optional().nullable(),
	CoverImage: z.string().optional().nullable(),
	Icon: z.string().optional().nullable(),
	ContentHash: z.string()
});
export type PlayniteGame = z.infer<typeof playniteGameSchema>;

export const statisticsResponseSchema = z.object({
	totalPlaytimeOverLast6Months: z.array(z.number()),
	totalGamesOwnedOverLast6Months: z.array(z.number()),
	top10MostPlayedGames: z.array(playniteGameSchema)
});

export const dashPagePlayniteGameListSchema = z.array(
	z.object({
		Id: z.string(),
		IsInstalled: z.number(),
		Playtime: z.number()
	})
);

export const gameByIdSchema = z.object({
	game: z.optional(playniteGameSchema),
	developers: z.array(developerSchema).optional()
});
