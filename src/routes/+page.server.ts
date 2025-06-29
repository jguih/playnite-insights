import type { PageServerLoad } from './$types';
import { getGameList } from '$lib/services/game-repository';

export const load: PageServerLoad = async () => {
	const games = (await getGameList()).map((game) => {
		return {
			Id: game.Id,
			Name: game.Name,
			IsInstalled: game.IsInstalled,
			CoverImage: game.CoverImage
		};
	});
	return { games: games };
};
