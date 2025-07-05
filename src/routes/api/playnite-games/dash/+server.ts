import { getDashPagePlayniteGameList } from '$lib/playnite-game/playnite-game-repository';
import type { dashPagePlayniteGameListSchema } from '$lib/playnite-game/schemas';
import { json, type RequestHandler } from '@sveltejs/kit';
import type z from 'zod';

export const GET: RequestHandler = () => {
	const games = getDashPagePlayniteGameList();
	const responseData: z.infer<typeof dashPagePlayniteGameListSchema> = games ?? [];
	return json(responseData);
};
