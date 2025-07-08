import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { gamePageDataSchema } from '$lib/services/game-page/schemas';

export const load: PageLoad = async ({ params, fetch }) => {
	const { playniteGameId } = params;
	if (!playniteGameId) {
		throw error(400, 'Invalid game id');
	}
	try {
		const response = await fetch(`/api/game/${playniteGameId}`);
		const data = gamePageDataSchema.parse(await response.json());
		if (!data) {
			throw error(404, 'Game not found');
		}
		return data;
	} catch {
		throw error(404, 'Game not found');
	}
};
