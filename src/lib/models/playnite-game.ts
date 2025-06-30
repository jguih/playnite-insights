import { z } from 'zod';

const platformSchema = z.object({
	SpecificationId: z.string(),
	Icon: z.string().optional().nullable(),
	Cover: z.string().optional().nullable(),
	Background: z.string().optional().nullable(),
	Id: z.string(),
	Name: z.string()
});

const genreSchema = z.object({
	Id: z.string(),
	Name: z.string()
});

const developerSchema = genreSchema;

const publisherSchema = developerSchema;

export const playniteGameSchema = z.object({
	Id: z.string(),
	Name: z.string().optional().nullable(),
	Description: z.string().optional().nullable(),
	Platforms: z.array(platformSchema).optional().nullable(),
	Genres: z.array(genreSchema).optional().nullable(),
	Developers: z.array(developerSchema).optional().nullable(),
	Publishers: z.array(publisherSchema).optional().nullable(),
	ReleaseDate: z
		.object({
			ReleaseDate: z.string().optional().nullable()
		})
		.optional()
		.nullable(),
	Playtime: z.number(),
	LastActivity: z.string().optional().nullable(),
	Added: z.string().optional().nullable(),
	InstallDirectory: z.string().optional().nullable(),
	IsInstalled: z.boolean(),
	BackgroundImage: z.string().optional().nullable(),
	CoverImage: z.string().optional().nullable(),
	Icon: z.string().optional().nullable()
});

export const playniteGameListSchema = z.array(playniteGameSchema);

export type PlayniteGameMetadata = z.infer<typeof playniteGameSchema>;
