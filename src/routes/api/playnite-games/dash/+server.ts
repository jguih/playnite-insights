import { repositories } from '$lib';
import { schemas } from '$lib/services/playnite-game/schemas';
import { json, type RequestHandler } from '@sveltejs/kit';
import type z from 'zod';

export const GET: RequestHandler = () => {
	const games = repositories.playniteGame.getDashPageGameList();
	const responseData: z.infer<typeof schemas.dashPagePlayniteGameList> = games ?? [];
	return json(responseData);
};
