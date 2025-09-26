import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
	const params = new URLSearchParams(url.searchParams);
	const gameId = params.get('id');
	if (!gameId) {
		throw error(400, 'Invalid game id');
	}
	return { gameId };
};
