import z from 'zod';

export const libraryManifestSchema = z.object({
	totalGamesInLibrary: z.number(),
	gamesInLibrary: z.array(
		z.object({
			gameId: z.string(),
			contentHash: z.string()
		})
	),
	mediaExistsFor: z.array(
		z.object({
			gameId: z.string(),
			contentHash: z.string()
		})
	)
});

export type PlayniteLibraryManifest = z.infer<typeof libraryManifestSchema>;
