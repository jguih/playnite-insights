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
	IsInstalled: z.number().transform((n) => Boolean(n)),
	BackgroundImage: z.string().optional().nullable(),
	CoverImage: z.string().optional().nullable(),
	Icon: z.string().optional().nullable(),
	ContentHash: z.string()
});

export type PlayniteGame = z.infer<typeof playniteGameSchema>;
