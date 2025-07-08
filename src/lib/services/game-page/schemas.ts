import z from 'zod';
import { playniteGameSchema } from '../playnite-game/schemas';
import { developerSchema } from '../developer/schemas';

export const gamePageDataSchema = z
	.object({
		game: z.object({ ...playniteGameSchema.shape, Developers: z.array(developerSchema) })
	})
	.optional();

export type GamePageData = z.infer<typeof gamePageDataSchema>;
