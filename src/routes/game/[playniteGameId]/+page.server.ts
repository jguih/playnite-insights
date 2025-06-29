import { getGameById } from '$lib/services/game-repository.js';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const paramsSchema = z.object({
		playniteGameId: z.string().min(1, 'Playnite Game ID is required')
	});
	const parsedParams = paramsSchema.safeParse(params);
	if (!parsedParams.success) {
		error(400, parsedParams.error.errors[0].message);
	}
	const playniteGame = await getGameById(parsedParams.data.playniteGameId);
	return {
		game: playniteGame
	};
};
