import { getGameList } from '$lib/services/game-repository';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async () => {
	const games = await getGameList();

	return {
		games
	};
};
