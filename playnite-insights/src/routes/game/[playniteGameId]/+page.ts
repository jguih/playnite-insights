import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const { playniteGameId } = params;
	if (!playniteGameId) {
		throw error(400, 'Invalid game id');
	}
	return { gameId: playniteGameId };
};
