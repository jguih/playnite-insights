import { developerSchema } from '$lib/services/developer/schemas';
import { z } from 'zod';

const playniteGame = z.object({
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
export type PlayniteGame = z.infer<typeof playniteGame>;

const statisticsResponse = z.object({
	totalPlaytimeOverLast6Months: z.array(z.number()),
	totalGamesOwnedOverLast6Months: z.array(z.number()),
	top10MostPlayedGames: z.array(playniteGame)
});

const gameById = z.object({
	game: z.optional(playniteGame),
	developers: z.array(developerSchema).optional()
});

const gameManifestData = z.array(
	z.object({
		Id: z.string(),
		ContentHash: z.string()
	})
);

export const playniteGameSchemas = {
	playniteGame,
	statisticsResponse,
	gameById,
	gameManifestDataResult: gameManifestData
};
