import { z } from 'zod';

export const genreScheme = z.object({
	Id: z.string(),
	Name: z.string()
});

export type Genre = z.infer<typeof genreScheme>;
