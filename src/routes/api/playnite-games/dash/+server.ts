import { dashPagePlayniteGameListSchema } from '$lib/models/api/playnite-game/schemas';
import { getDashPagePlayniteGameList } from '$lib/services/playnite-game-repository';
import { json, type RequestHandler } from '@sveltejs/kit';
import type z from 'zod';

export const GET: RequestHandler = () => {
	const games = getDashPagePlayniteGameList();
	const responseData: z.infer<typeof dashPagePlayniteGameListSchema> = games ?? [];
	return json(responseData);
};
