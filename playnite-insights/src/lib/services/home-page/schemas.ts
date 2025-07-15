import z from 'zod';

export const gameDataSchema = z.array(
	z.object({
		Id: z.string(),
		Name: z.string().nullable().optional(),
		CoverImage: z.string().nullable().optional()
	})
);
export type HomePageGameData = z.infer<typeof gameDataSchema>;

export const homePageDataSchema = z.object({
	games: gameDataSchema,
	total: z.number(),
	hasNextPage: z.boolean(),
	totalPages: z.number(),
	offset: z.number(),
	items: z.number()
});
export type HomePageData = z.infer<typeof homePageDataSchema>;
