import { repositories } from '$lib';
import { playniteGameSchemas } from '$lib/services/playnite-game/schemas';
import { json, type RequestHandler } from '@sveltejs/kit';
import type z from 'zod';

export const GET: RequestHandler = () => {
	const games = repositories.playniteGame.getDashPageGameList();
	const responseData: z.infer<typeof playniteGameSchemas.getDashPageGameListResult> = games ?? [];
	return json(responseData);
};
