import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
	const { playniteGameId } = params;
	if (!playniteGameId) {
		throw error(400, 'Invalid game id');
	}
	return { gameId: playniteGameId };
};
