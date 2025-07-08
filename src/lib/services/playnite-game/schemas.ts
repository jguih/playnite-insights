import { developerSchema } from '$lib/services/developer/schemas';
import { z } from 'zod';

export const playniteGameSchema = z.object({
	Id: z.string(),
	Name: z.string().nullable(),
	Description: z.string().nullable(),
	ReleaseDate: z.string().nullable(),
	Playtime: z.number(),
	LastActivity: z.string().nullable(),
	Added: z.string().nullable(),
	InstallDirectory: z.string().nullable(),
	IsInstalled: z.number(),
	BackgroundImage: z.string().nullable(),
	CoverImage: z.string().nullable(),
	Icon: z.string().nullable(),
	ContentHash: z.string()
});
export type PlayniteGame = z.infer<typeof playniteGameSchema>;

export const gameByIdSchema = z.object({
	game: z.optional(playniteGameSchema),
	developers: z.array(developerSchema).optional()
});

export const gameManifestDataSchema = z.array(
	z.object({
		Id: z.string(),
		ContentHash: z.string()
	})
);
export type GameManifestData = z.infer<typeof gameManifestDataSchema>;
