import type { PageServerLoad } from './$types';
import { getGameList } from '$lib/services/game-repository';

export const load: PageServerLoad = async () => {
	const games = await getGameList();
	return { games: games };
};
