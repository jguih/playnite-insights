import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { playniteGameSchemas } from '$lib/services/playnite-game/schemas';

export const load: PageLoad = async ({ params, fetch }) => {
	const { playniteGameId } = params;
	if (!playniteGameId) {
		throw error(400, 'Invalid game id');
	}
	try {
		const response = await fetch(`/api/playnite-games/${playniteGameId}`);
		const data = playniteGameSchemas.gameById.parse(await response.json());
		return { game: { ...data.game, Developers: data.developers } };
	} catch (e) {
		console.error(e);
		throw error(404, 'Game not found');
	}
};
