import z from 'zod';

export const homePagePlayniteGameMetadataSchema = z.array(
	z.object({
		Id: z.string(),
		Name: z.string().nullable().optional(),
		CoverImage: z.string().nullable().optional()
	})
);

export const homePagePlayniteGameListSchema = z
	.object({
		games: homePagePlayniteGameMetadataSchema,
		total: z.number(),
		hasNextPage: z.boolean(),
		totalPages: z.number()
	})
	.optional();
